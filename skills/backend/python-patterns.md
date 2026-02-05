# Python 设计模式 | Design Patterns

> 基于 KISS、SRP、组合优于继承的 Python 惯用模式

## 触发条件

- 重构复杂类结构
- 设计新的模块架构
- 代码复用决策
- 抽象层级设计

---

## 核心原则

### KISS (Keep It Simple)

```
┌─────────────────────────────────────────────────────┐
│  简单性优先级                                        │
├─────────────────────────────────────────────────────┤
│  1. 内联代码        最简单，无额外认知负担            │
│  2. 函数            单一职责，可测试                 │
│  3. 类              只在需要状态管理时使用            │
│  4. 继承层次        通常是过度设计的信号              │
└─────────────────────────────────────────────────────┘
```

### 三次规则 (Rule of Three)

```python
# ❌ 首次出现就抽象 - 过早
def process_user(user): ...
def process_admin(admin): ...  # 只有两个，不要急着抽象

# ✅ 第三次出现时抽象 - 合理
def process_user(user): ...
def process_admin(admin): ...
def process_guest(guest): ...  # 第三次，现在可以抽象

def process_entity(entity, role_handler): ...
```

---

## DO / DON'T 示例

### 组合优于继承

```python
# ❌ DON'T: 继承层次过深
class BaseProcessor:
    def validate(self): ...
    def transform(self): ...

class UserProcessor(BaseProcessor):
    def validate(self):
        super().validate()
        # 用户特定验证

class AdminUserProcessor(UserProcessor):
    def validate(self):
        super().validate()
        # 管理员特定验证 - 继承链太深了！

# ✅ DO: 使用组合
@dataclass
class ProcessorConfig:
    validators: list[Callable]
    transformers: list[Callable]

class EntityProcessor:
    def __init__(self, config: ProcessorConfig):
        self.config = config

    def process(self, entity):
        for validate in self.config.validators:
            validate(entity)
        for transform in self.config.transformers:
            entity = transform(entity)
        return entity

# 通过配置组合功能
user_processor = EntityProcessor(ProcessorConfig(
    validators=[validate_email, validate_age],
    transformers=[normalize_name]
))
```

### 依赖注入

```python
# ❌ DON'T: 硬编码依赖
class UserService:
    def __init__(self):
        self.db = PostgresDatabase()  # 硬编码，无法测试
        self.cache = RedisCache()

    def get_user(self, user_id: str):
        if cached := self.cache.get(user_id):
            return cached
        return self.db.query(user_id)

# ✅ DO: 依赖注入
class UserService:
    def __init__(self, db: Database, cache: Cache):
        self.db = db
        self.cache = cache

    def get_user(self, user_id: str):
        if cached := self.cache.get(user_id):
            return cached
        return self.db.query(user_id)

# 生产环境
service = UserService(PostgresDatabase(), RedisCache())

# 测试环境
service = UserService(MockDatabase(), MockCache())
```

### 策略模式 vs if-else

```python
# ❌ DON'T: 长 if-else 链
def calculate_price(product, discount_type):
    if discount_type == "percentage":
        return product.price * 0.9
    elif discount_type == "fixed":
        return product.price - 10
    elif discount_type == "buy_one_get_one":
        return product.price / 2
    elif discount_type == "seasonal":
        return product.price * 0.85
    # 每加一种折扣就要改这个函数...

# ✅ DO: 策略字典
DISCOUNT_STRATEGIES = {
    "percentage": lambda p: p.price * 0.9,
    "fixed": lambda p: p.price - 10,
    "buy_one_get_one": lambda p: p.price / 2,
    "seasonal": lambda p: p.price * 0.85,
}

def calculate_price(product, discount_type: str):
    strategy = DISCOUNT_STRATEGIES.get(discount_type)
    if not strategy:
        raise ValueError(f"Unknown discount: {discount_type}")
    return strategy(product)
```

### 工厂函数 vs 类工厂

```python
# ❌ DON'T: 过度设计的工厂类
class DatabaseFactory:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def create_connection(self, db_type: str):
        if db_type == "postgres":
            return PostgresConnection()
        elif db_type == "mysql":
            return MySQLConnection()

# ✅ DO: 简单的工厂函数
def create_db_connection(db_type: str) -> Connection:
    """工厂函数足够了"""
    factories = {
        "postgres": PostgresConnection,
        "mysql": MySQLConnection,
    }
    factory = factories.get(db_type)
    if not factory:
        raise ValueError(f"Unsupported database: {db_type}")
    return factory()

# 如果真的需要单例
_db_connection: Connection | None = None

def get_db_connection() -> Connection:
    global _db_connection
    if _db_connection is None:
        _db_connection = create_db_connection(settings.DB_TYPE)
    return _db_connection
```

---

## 常用模式速查

### 上下文管理器

```python
from contextlib import contextmanager

@contextmanager
def timed_operation(name: str):
    """计时上下文管理器"""
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f"{name} took {elapsed:.3f}s")

# 使用
with timed_operation("database_query"):
    result = db.execute(query)
```

### 装饰器模式

```python
from functools import wraps

def retry(max_attempts: int = 3, delay: float = 1.0):
    """可配置的重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        time.sleep(delay * (attempt + 1))
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def fetch_data(url: str):
    return requests.get(url).json()
```

### 注册表模式

```python
from typing import Callable, TypeVar

T = TypeVar("T")
HandlerRegistry = dict[str, Callable[..., T]]

# 命令处理器注册表
command_handlers: HandlerRegistry = {}

def register_command(name: str):
    """命令注册装饰器"""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        command_handlers[name] = func
        return func
    return decorator

@register_command("create_user")
def handle_create_user(data: dict):
    return User(**data)

@register_command("delete_user")
def handle_delete_user(user_id: str):
    return delete_user_by_id(user_id)

# 使用
def dispatch_command(name: str, *args, **kwargs):
    handler = command_handlers.get(name)
    if not handler:
        raise ValueError(f"Unknown command: {name}")
    return handler(*args, **kwargs)
```

---

## 反模式警告

| 反模式    | 问题             | 替代方案           |
| --------- | ---------------- | ------------------ |
| God Class | 单个类职责过多   | 拆分为多个专注的类 |
| 深继承    | 超过2层继承      | 使用组合或 Mixin   |
| 过早抽象  | 首次出现就抽象   | 等待第三次重复     |
| 单例滥用  | 全局状态难以测试 | 依赖注入           |
| 回调地狱  | 嵌套回调难以理解 | async/await        |

---

## 相关文件

- [python.md](./python.md) - Python 后端主文件
- [python-types.md](./python-types.md) - 高级类型提示
- [python-observability.md](./python-observability.md) - 可观测性模式

---

## Maintenance

- Sources: Python Design Patterns, Clean Code, agents/python-design-patterns
- Last updated: 2026-02-05
- Pattern: DO/DON'T 示例驱动
