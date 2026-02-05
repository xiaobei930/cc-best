# Python 类型提示 | Type Safety

> Protocol、泛型、TypeVar 的高级用法，提升代码安全性

## 触发条件

- 设计可复用接口
- 处理泛型容器
- 类型收窄场景
- API 类型设计

---

## Protocol (结构化子类型)

### 基础用法

```python
from typing import Protocol

# ❌ DON'T: 强制继承抽象基类
from abc import ABC, abstractmethod

class Serializable(ABC):
    @abstractmethod
    def to_dict(self) -> dict: ...

class User(Serializable):  # 必须显式继承
    def to_dict(self) -> dict:
        return {"name": self.name}

# ✅ DO: 使用 Protocol（鸭子类型）
class Serializable(Protocol):
    def to_dict(self) -> dict: ...

class User:  # 不需要显式继承
    def to_dict(self) -> dict:
        return {"name": self.name}

class Product:  # 也不需要显式继承
    def to_dict(self) -> dict:
        return {"sku": self.sku}

def save_to_db(obj: Serializable) -> None:
    data = obj.to_dict()  # User 和 Product 都能用
    db.insert(data)
```

### 带属性的 Protocol

```python
from typing import Protocol, runtime_checkable

@runtime_checkable  # 允许 isinstance 检查
class HasId(Protocol):
    id: str

@runtime_checkable
class Repository(Protocol):
    """仓储协议"""
    def get(self, id: str) -> HasId | None: ...
    def save(self, entity: HasId) -> None: ...
    def delete(self, id: str) -> bool: ...

# 任何实现这些方法的类都符合协议
class UserRepository:
    def get(self, id: str) -> User | None:
        return self.db.find_one({"id": id})

    def save(self, entity: User) -> None:
        self.db.update({"id": entity.id}, entity.to_dict())

    def delete(self, id: str) -> bool:
        return self.db.delete({"id": id}).deleted_count > 0

# 类型检查器会验证 UserRepository 符合 Repository 协议
def sync_data(repo: Repository, entities: list[HasId]) -> None:
    for entity in entities:
        repo.save(entity)
```

---

## 泛型 (Generics)

### TypeVar 基础

```python
from typing import TypeVar, Generic

T = TypeVar("T")  # 任意类型
K = TypeVar("K")
V = TypeVar("V")

# ❌ DON'T: 返回 Any
def first(items: list) -> Any:
    return items[0] if items else None

# ✅ DO: 使用泛型保留类型信息
def first(items: list[T]) -> T | None:
    return items[0] if items else None

# 类型推断
users: list[User] = [...]
user = first(users)  # 推断为 User | None
```

### 有界泛型 (Bounded TypeVar)

```python
from typing import TypeVar
from decimal import Decimal

# 限制 T 必须是 int, float, 或 Decimal
Numeric = TypeVar("Numeric", int, float, Decimal)

def sum_values(values: list[Numeric]) -> Numeric:
    """类型安全的求和"""
    return sum(values)

# 或使用 bound 限制
from typing import Comparable

T = TypeVar("T", bound=Comparable)

def max_value(a: T, b: T) -> T:
    return a if a > b else b
```

### 泛型类

```python
from typing import Generic, TypeVar

T = TypeVar("T")

class Result(Generic[T]):
    """类型安全的结果包装器"""

    def __init__(self, value: T | None = None, error: str | None = None):
        self._value = value
        self._error = error

    @property
    def is_success(self) -> bool:
        return self._error is None

    def unwrap(self) -> T:
        if self._error:
            raise ValueError(self._error)
        return self._value  # type: ignore

    @classmethod
    def ok(cls, value: T) -> "Result[T]":
        return cls(value=value)

    @classmethod
    def err(cls, error: str) -> "Result[T]":
        return cls(error=error)

# 使用
def find_user(id: str) -> Result[User]:
    user = db.find(id)
    if user:
        return Result.ok(user)
    return Result.err(f"User {id} not found")

result = find_user("123")
if result.is_success:
    user: User = result.unwrap()  # 类型安全
```

---

## 类型收窄 (Type Narrowing)

### TypeGuard

```python
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    """类型守卫函数"""
    return all(isinstance(x, str) for x in val)

def process(data: list[object]) -> None:
    if is_string_list(data):
        # 这里 data 被收窄为 list[str]
        for s in data:
            print(s.upper())  # str 方法可用
```

### assert_never (穷尽检查)

```python
from typing import Literal, assert_never

Status = Literal["pending", "approved", "rejected"]

def handle_status(status: Status) -> str:
    match status:
        case "pending":
            return "等待处理"
        case "approved":
            return "已批准"
        case "rejected":
            return "已拒绝"
        case _ as unreachable:
            assert_never(unreachable)  # 编译时检查穷尽性

# 如果添加新状态但忘记处理，类型检查器会报错
```

---

## DO / DON'T 示例

### API 参数类型

```python
# ❌ DON'T: 使用 dict 丢失类型信息
def create_user(data: dict) -> User:
    return User(
        name=data["name"],      # KeyError 风险
        email=data["email"],    # 无类型检查
    )

# ✅ DO: 使用 TypedDict 或 Pydantic
from typing import TypedDict

class CreateUserInput(TypedDict):
    name: str
    email: str
    age: int | None  # 可选字段

def create_user(data: CreateUserInput) -> User:
    return User(
        name=data["name"],      # 类型安全
        email=data["email"],
    )

# 或使用 Pydantic（推荐）
from pydantic import BaseModel

class CreateUserInput(BaseModel):
    name: str
    email: str
    age: int | None = None

def create_user(data: CreateUserInput) -> User:
    return User(name=data.name, email=data.email)
```

### 回调函数类型

```python
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

# ❌ DON'T: 使用 Callable[..., Any]
def with_logging(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args, **kwargs):
        logger.info(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

# ✅ DO: 使用 ParamSpec 保留签名
def with_logging(func: Callable[P, R]) -> Callable[P, R]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        logger.info(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@with_logging
def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}!" * times

# greet 的类型签名被完整保留
```

### Union 类型处理

```python
# ❌ DON'T: 忽略类型检查
def process(value: str | int) -> str:
    return value.upper()  # int 没有 upper 方法!

# ✅ DO: 正确处理所有分支
def process(value: str | int) -> str:
    if isinstance(value, str):
        return value.upper()
    return str(value)

# 或使用 match
def process(value: str | int) -> str:
    match value:
        case str():
            return value.upper()
        case int():
            return str(value)
```

---

## 类型注解最佳实践

| 场景                | 推荐方式               | 示例                                |
| ------------------- | ---------------------- | ----------------------------------- |
| 函数返回可能为 None | `T \| None`            | `def find(id: str) -> User \| None` |
| 多种类型参数        | `Union` 或 `\|`        | `data: str \| bytes`                |
| 字典结构            | `TypedDict`            | `class Config(TypedDict): ...`      |
| 回调签名            | `Callable + ParamSpec` | `Callable[P, R]`                    |
| 接口定义            | `Protocol`             | `class Serializable(Protocol): ...` |
| 泛型容器            | `Generic[T]`           | `class Result(Generic[T]): ...`     |

---

## 相关文件

- [python.md](./python.md) - Python 后端主文件
- [python-patterns.md](./python-patterns.md) - 设计模式
- [python-observability.md](./python-observability.md) - 可观测性模式

---

## Maintenance

- Sources: Python typing docs, mypy docs, agents/python-type-safety
- Last updated: 2026-02-05
- Pattern: DO/DON'T 示例驱动
