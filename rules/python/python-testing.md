---
paths:
  - "**/*.py"
---

# Python 测试规范 | Python Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供 Python 特定测试规范

## 禁止操作

### 禁止使用 unittest 断言风格（优先 pytest 原生断言）

```python
# ❌ unittest 风格断言，错误信息不够直观
self.assertEqual(result, expected)
self.assertTrue(condition)
self.assertIn(item, collection)

# ✅ pytest 原生断言，失败时自动展示详细上下文
assert result == expected
assert condition
assert item in collection
```

### 禁止测试间共享可变状态

```python
# ❌ 模块级可变变量，测试间互相污染
_cache = {}

def test_add_to_cache():
    _cache["key"] = "value"
    assert _cache["key"] == "value"

def test_cache_empty():
    assert len(_cache) == 0  # 依赖执行顺序，不稳定

# ✅ 使用 fixture 隔离状态
@pytest.fixture
def cache():
    return {}

def test_add_to_cache(cache):
    cache["key"] = "value"
    assert cache["key"] == "value"

def test_cache_empty(cache):
    assert len(cache) == 0  # 每次都是全新的
```

### 禁止在测试中使用 time.sleep 等待异步操作

```python
# ❌ 固定等待时间，既慢又不稳定
import time

def test_async_task():
    start_task()
    time.sleep(5)
    assert get_result() is not None

# ✅ 使用 polling 或 pytest-timeout
import pytest

@pytest.mark.timeout(10)
async def test_async_task():
    result = await start_task()
    assert result is not None
```

---

## 必须遵守

### 使用 @pytest.mark.parametrize 覆盖多场景

```python
import pytest

@pytest.mark.parametrize("email,expected", [
    ("", False),
    ("valid@example.com", True),
    ("no-at-sign.com", False),
    ("@example.com", False),
    ("user@.com", False),
])
def test_validate_email(email: str, expected: bool):
    assert validate_email(email) == expected
```

### Fixture 分层：conftest.py 管理共享资源

```python
# conftest.py — 项目级 fixture
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="session")
def engine():
    """整个测试会话共享一个数据库引擎"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()

@pytest.fixture
def db_session(engine):
    """每个测试独立的数据库会话，自动回滚"""
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def client(db_session):
    """FastAPI 测试客户端"""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

### Mock 原则：只 mock 外部边界

```python
from unittest.mock import patch, MagicMock
import pytest

# ✅ mock 外部 HTTP 调用
@patch("services.payment.requests.post")
def test_process_payment(mock_post):
    mock_post.return_value = MagicMock(
        status_code=200,
        json=lambda: {"transaction_id": "txn_123"}
    )
    result = process_payment(amount=100, currency="CNY")
    assert result.transaction_id == "txn_123"
    mock_post.assert_called_once()

# ✅ 使用 pytest-mock 的 mocker fixture（自动清理）
def test_send_notification(mocker):
    mock_send = mocker.patch("services.notification.send_email")
    create_order(order_data)
    mock_send.assert_called_once_with(
        to="user@example.com",
        subject="订单确认"
    )
```

### 异步测试使用 pytest-asyncio

```python
import pytest

@pytest.mark.asyncio
async def test_fetch_user():
    user = await user_service.get_by_id(1)
    assert user.name == "测试用户"

@pytest.mark.asyncio
async def test_concurrent_requests():
    results = await asyncio.gather(
        fetch_data("endpoint_a"),
        fetch_data("endpoint_b"),
    )
    assert all(r.status == 200 for r in results)
```

---

## 推荐做法

### 测试组织结构

```
tests/
├── conftest.py           # 全局 fixture
├── unit/                 # 单元测试
│   ├── test_models.py
│   └── test_utils.py
├── integration/          # 集成测试
│   ├── conftest.py       # 集成测试专用 fixture
│   ├── test_api.py
│   └── test_repository.py
└── e2e/                  # 端到端测试
    └── test_workflows.py
```

### 覆盖率配置（pytest-cov）

```ini
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"
testpaths = ["tests"]
markers = [
    "slow: 耗时较长的测试",
    "integration: 集成测试",
]

[tool.coverage.run]
omit = ["tests/*", "*/migrations/*"]
```

### 测试命名与标记

```python
# ✅ 命名：test_<功能>_<场景>_<预期>
def test_create_user_with_valid_data_returns_user():
    pass

def test_create_user_with_duplicate_email_raises_error():
    pass

# ✅ 使用标记区分测试类型
@pytest.mark.slow
def test_large_file_processing():
    pass

@pytest.mark.integration
def test_database_migration():
    pass
```

### 使用 Factory Boy 生成测试数据

```python
import factory
from models import User

class UserFactory(factory.Factory):
    class Meta:
        model = User

    name = factory.Faker("name", locale="zh_CN")
    email = factory.LazyAttribute(lambda o: f"{o.name}@example.com")
    age = factory.Faker("random_int", min=18, max=65)

# 使用
def test_user_list(db_session):
    users = UserFactory.create_batch(10)
    db_session.add_all(users)
    db_session.commit()
    assert db_session.query(User).count() == 10
```
