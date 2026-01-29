# Rust 后端开发模式

Rust 后端开发的专属模式，涵盖 Axum、Actix-web、Rocket 等框架。

> **Tauri 桌面应用开发**: 请参阅 `native/tauri.md`

## 项目结构

### 标准 Rust Web 服务布局

```
project/
├── src/
│   ├── main.rs              # 应用入口
│   ├── lib.rs               # 库导出
│   ├── config/
│   │   └── mod.rs           # 配置管理
│   ├── handlers/
│   │   └── mod.rs           # HTTP 处理器
│   ├── services/
│   │   └── mod.rs           # 业务逻辑
│   ├── models/
│   │   └── mod.rs           # 数据模型
│   ├── db/
│   │   └── mod.rs           # 数据库访问
│   └── utils/
│       └── mod.rs           # 工具函数
├── tests/
│   └── integration_test.rs  # 集成测试
├── benches/
│   └── benchmark.rs         # 性能基准测试
├── Cargo.toml
├── Cargo.lock
└── README.md
```

---

## 错误处理

### 自定义错误类型 (thiserror)

```rust
// src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),

    #[error("验证失败: {0}")]
    Validation(String),

    #[error("未找到: {0}")]
    NotFound(String),

    #[error("未授权")]
    Unauthorized,

    #[error("内部错误: {0}")]
    Internal(String),

    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),

    #[error("序列化错误: {0}")]
    Serialization(#[from] serde_json::Error),
}

// 转换为 HTTP 状态码
impl AppError {
    pub fn status_code(&self) -> u16 {
        match self {
            Self::Validation(_) => 400,
            Self::Unauthorized => 401,
            Self::NotFound(_) => 404,
            Self::Database(_) | Self::Internal(_) | Self::Io(_) | Self::Serialization(_) => 500,
        }
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### Result 处理最佳实践

```rust
// ❌ DON'T - 使用 unwrap
let file = File::open("config.json").unwrap();

// ✅ DO - 使用 ? 操作符传播错误
fn load_config() -> Result<Config> {
    let file = File::open("config.json")?;
    let config: Config = serde_json::from_reader(file)?;
    Ok(config)
}

// ✅ DO - 提供上下文
use anyhow::Context;

fn load_config() -> anyhow::Result<Config> {
    let file = File::open("config.json")
        .context("无法打开配置文件")?;
    let config: Config = serde_json::from_reader(file)
        .context("配置文件格式错误")?;
    Ok(config)
}
```

---

## 所有权和借用

### 核心原则

```rust
// 1. 每个值有且只有一个所有者
// 2. 值在所有者离开作用域时被释放
// 3. 引用不能比所有者活得更久

// ❌ DON'T - 所有权转移后继续使用
let s1 = String::from("hello");
let s2 = s1;
println!("{}", s1); // 编译错误！

// ✅ DO - 使用引用
let s1 = String::from("hello");
let s2 = &s1;
println!("{} {}", s1, s2); // OK

// ✅ DO - 使用 clone（必要时）
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{} {}", s1, s2); // OK
```

### 生命周期标注

```rust
// ❌ DON'T - 返回局部变量的引用
fn dangling() -> &str {
    let s = String::from("hello");
    &s // s 在函数结束时被释放
}

// ✅ DO - 明确生命周期
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// ✅ DO - 结构体中的生命周期
struct Excerpt<'a> {
    part: &'a str,
}
```

---

## 并发模式

### 异步编程 (tokio)

```rust
use tokio::sync::Mutex;
use std::sync::Arc;

// 共享状态
struct AppState {
    db: Database,
    cache: Cache,
}

type SharedState = Arc<Mutex<AppState>>;

// 异步任务
#[tokio::main]
async fn main() -> Result<()> {
    let state = Arc::new(Mutex::new(AppState::new()));

    // 并发执行
    let (result1, result2) = tokio::join!(
        fetch_data(&state),
        process_data(&state),
    );

    // spawn 独立任务
    tokio::spawn(async move {
        background_job().await;
    });

    Ok(())
}

// ❌ DON'T - 在异步代码中使用 std::sync::Mutex
// ✅ DO - 使用 tokio::sync::Mutex 或 parking_lot
```

### 通道通信

```rust
use tokio::sync::mpsc;

async fn producer_consumer() {
    let (tx, mut rx) = mpsc::channel::<String>(100);

    // 生产者
    tokio::spawn(async move {
        for i in 0..10 {
            tx.send(format!("消息 {}", i)).await.unwrap();
        }
    });

    // 消费者
    while let Some(msg) = rx.recv().await {
        println!("收到: {}", msg);
    }
}
```

---

## 测试模式

### 单元测试

```rust
// src/services/user.rs
pub fn validate_email(email: &str) -> bool {
    email.contains('@') && email.contains('.')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email_valid() {
        assert!(validate_email("test@example.com"));
    }

    #[test]
    fn test_validate_email_invalid() {
        assert!(!validate_email("invalid"));
        assert!(!validate_email("no-at.com"));
    }

    #[test]
    #[should_panic(expected = "空邮箱")]
    fn test_validate_email_panic() {
        validate_email_strict("").expect("空邮箱");
    }
}
```

### 集成测试

```rust
// tests/api_test.rs
use myapp::create_app;

#[tokio::test]
async fn test_create_user() {
    let app = create_app().await;

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/users")
                .header("Content-Type", "application/json")
                .body(Body::from(r#"{"name": "test"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
}
```

### Mock 测试

```rust
use mockall::predicate::*;
use mockall::mock;

// 定义 trait
trait UserRepository {
    fn find_by_id(&self, id: i64) -> Option<User>;
}

// 生成 mock
mock! {
    UserRepo {}
    impl UserRepository for UserRepo {
        fn find_by_id(&self, id: i64) -> Option<User>;
    }
}

#[test]
fn test_with_mock() {
    let mut mock_repo = MockUserRepo::new();
    mock_repo
        .expect_find_by_id()
        .with(eq(1))
        .returning(|_| Some(User { id: 1, name: "test".into() }));

    let service = UserService::new(Box::new(mock_repo));
    let user = service.get_user(1).unwrap();
    assert_eq!(user.name, "test");
}
```

---

## 性能优化

### 避免不必要的分配

```rust
// ❌ DON'T - 不必要的 String 分配
fn greet(name: String) -> String {
    format!("Hello, {}", name)
}

// ✅ DO - 使用引用
fn greet(name: &str) -> String {
    format!("Hello, {}", name)
}

// ✅ DO - 使用 Cow 延迟分配
use std::borrow::Cow;

fn process(input: &str) -> Cow<str> {
    if input.contains("bad") {
        Cow::Owned(input.replace("bad", "good"))
    } else {
        Cow::Borrowed(input)
    }
}
```

### 迭代器优化

```rust
// ❌ DON'T - 手动循环收集
let mut result = Vec::new();
for item in items {
    if item.is_valid() {
        result.push(item.transform());
    }
}

// ✅ DO - 使用迭代器链
let result: Vec<_> = items
    .iter()
    .filter(|item| item.is_valid())
    .map(|item| item.transform())
    .collect();

// ✅ DO - 预分配容量
let mut result = Vec::with_capacity(items.len());
```

---

## 常用 Crate 推荐

| 类别        | Crate                       | 用途               |
| ----------- | --------------------------- | ------------------ |
| 错误处理    | `thiserror`, `anyhow`       | 自定义错误、错误链 |
| 序列化      | `serde`, `serde_json`       | JSON/其他格式      |
| 异步运行时  | `tokio`, `async-std`        | 异步 IO            |
| HTTP 客户端 | `reqwest`                   | HTTP 请求          |
| Web 框架    | `axum`, `actix-web`         | Web 服务           |
| 数据库      | `sqlx`, `diesel`, `sea-orm` | 数据库访问         |
| CLI         | `clap`, `structopt`         | 命令行解析         |
| 日志        | `tracing`, `log`            | 结构化日志         |
| 测试        | `mockall`, `proptest`       | Mock、属性测试     |
| 桌面应用    | `tauri`                     | 跨平台桌面应用     |

---

## 场景专属内容

详细的场景专属实现请参考：

- **Tauri 桌面应用**: [tauri.md](./tauri.md) - Commands, State, IPC
- **Web 服务**: [web.md](./web.md) - Axum, Actix-web
- **CLI 工具**: [cli.md](./cli.md) - Clap, 参数解析

---

## Cargo 常用命令

```bash
# 构建
cargo build              # Debug 构建
cargo build --release    # Release 构建

# 运行
cargo run                # 运行项目
cargo run --release      # Release 模式运行

# 测试
cargo test               # 运行所有测试
cargo test test_name     # 运行特定测试
cargo test -- --nocapture # 显示 println 输出

# 检查
cargo check              # 快速检查（不生成二进制）
cargo clippy             # Lint 检查
cargo fmt                # 格式化代码

# 文档
cargo doc --open         # 生成并打开文档

# 依赖
cargo add package_name   # 添加依赖
cargo update             # 更新依赖
```

---

## Maintenance

- Sources: Rust Book, Rust by Example, Tokio 文档
- Last updated: 2025-01-29
- Pattern: 通用清单 + 按需加载场景专属
