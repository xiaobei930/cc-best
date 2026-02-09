---
description: 开发服务管理（自动检测运行时、启动/停止/重启服务）
argument-hint: "[--stop|--restart|--logs] [--port num]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---

# /service - 开发服务管理

自动检测项目运行时和包管理器，管理开发服务的启动、停止和重启。**支持 6 种语言运行时的自动检测。**

## 使用方式

```bash
# 自动检测并启动服务
/cc-best:service

# 停止运行中的服务
/cc-best:service --stop

# 重启服务
/cc-best:service --restart

# 查看服务日志
/cc-best:service --logs

# 指定端口启动
/cc-best:service --port 3000

# 列出检测到的所有服务入口
/cc-best:service --list
```

---

## 运行时自动检测

### 检测优先级

按以下顺序检测项目运行时：

| 优先级 | 检测文件                              | 运行时  | 包管理器          |
| ------ | ------------------------------------- | ------- | ----------------- |
| 1      | `package.json`                        | Node.js | npm/pnpm/yarn/bun |
| 2      | `pyproject.toml` / `requirements.txt` | Python  | poetry/pdm/pip    |
| 3      | `go.mod`                              | Go      | go                |
| 4      | `Cargo.toml`                          | Rust    | cargo             |
| 5      | `build.gradle` / `pom.xml`            | Java    | gradle/maven      |
| 6      | `*.csproj` / `*.sln`                  | C#      | dotnet            |

### 包管理器检测（Node.js）

| 检测文件            | 包管理器 | 启动命令      |
| ------------------- | -------- | ------------- |
| `bun.lockb`         | bun      | `bun run dev` |
| `pnpm-lock.yaml`    | pnpm     | `pnpm dev`    |
| `yarn.lock`         | yarn     | `yarn dev`    |
| `package-lock.json` | npm      | `npm run dev` |

### 启动命令映射

#### Node.js

```bash
# 检查 package.json scripts
# 优先级: dev > start > serve
<PM> run dev          # 存在 "dev" script 时
<PM> run start        # 存在 "start" script 时
```

#### Python

```bash
# 检测框架
uvicorn main:app --reload        # FastAPI (检测 uvicorn 依赖)
flask run --reload               # Flask (检测 flask 依赖)
python manage.py runserver       # Django (检测 manage.py)
python -m gunicorn app:app       # Gunicorn (生产环境)
```

#### Go

```bash
# 检测 air 配置
air                              # 存在 .air.toml 时 (hot reload)
go run .                         # 默认
go run cmd/server/main.go        # 存在 cmd/ 目录时
```

#### Rust

```bash
cargo watch -x run               # 安装了 cargo-watch 时 (hot reload)
cargo run                        # 默认
```

#### Java

```bash
./gradlew bootRun                # Spring Boot + Gradle
mvn spring-boot:run              # Spring Boot + Maven
./gradlew run                    # 普通 Gradle 项目
```

#### C#

```bash
dotnet watch run                 # 开发模式 (hot reload)
dotnet run                       # 默认
```

---

## 多服务项目

当检测到多个服务入口时（如前后端分离项目）：

1. 使用 `--list` 列出所有检测到的服务
2. 自动为每个服务分配不同端口
3. 使用后台运行模式启动多个服务

```bash
# 示例输出
# 检测到 2 个服务:
# [1] frontend (Node.js/pnpm) → pnpm dev --port 3000
# [2] backend  (Python/poetry) → poetry run uvicorn main:app --port 8000
```

---

## 注意事项

1. **后台运行**: 服务使用 `run_in_background` 方式启动，不阻塞会话
2. **端口冲突**: 自动检测端口占用，冲突时递增端口号
3. **环境变量**: 自动加载 `.env` 文件（如存在）
4. **Windows 兼容**: 所有命令均兼容 Windows/macOS/Linux
5. **不依赖 PM2**: 使用原生命令启动，不引入额外依赖
