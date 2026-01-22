# Python 后端开发模式

Python 后端开发的专属模式，涵盖 FastAPI、Django、Flask 等框架。

## 项目结构

### FastAPI 项目
```
project/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py              # 应用入口
│       ├── config.py            # 配置
│       ├── api/
│       │   ├── __init__.py
│       │   ├── deps.py          # 依赖注入
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── router.py
│       │       └── endpoints/
│       ├── services/
│       │   └── user_service.py
│       ├── repositories/
│       │   └── user_repository.py
│       ├── models/
│       │   └── user.py
│       ├── schemas/
│       │   └── user.py
│       └── utils/
│           └── logger.py
├── tests/
│   ├── conftest.py
│   └── test_users.py
├── pyproject.toml
└── README.md
```

---

## 类型注解

```python
from typing import Optional, List, Dict, Any, Union
from collections.abc import Callable, Awaitable

def process_data(
    data: List[Dict[str, Any]],
    callback: Optional[Callable[[str], None]] = None,
) -> Dict[str, int]:
    """
    处理数据并返回统计结果

    Args:
        data: 输入数据列表
        callback: 可选的回调函数

    Returns:
        包含统计结果的字典
    """
    pass
```

---

## 错误处理

### 自定义错误类

```python
# errors/app_error.py
class AppError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        code: str | None = None
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)

class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(f"{resource} 未找到", 404, "NOT_FOUND")

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 400, "VALIDATION_ERROR")

class UnauthorizedError(AppError):
    def __init__(self, message: str = "未授权"):
        super().__init__(message, 401, "UNAUTHORIZED")
```

### FastAPI 错误处理器

```python
from fastapi import Request
from fastapi.responses import JSONResponse

async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

async def generic_error_handler(request: Request, exc: Exception):
    logger.error(f"未处理异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务器内部错误"
            }
        }
    )

# main.py
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, generic_error_handler)
```

---

## 日志配置

```python
# utils/logger.py
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()

# 使用
logger.info("用户登录", user_id=user_id, action="login")
logger.error("处理请求失败", error=str(e), request_id=request_id)
```

---

## 配置管理

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "MyApp"
    ENV: str = "development"
    DEBUG: bool = False

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 数据库配置
    DATABASE_URL: str

    # Redis 配置
    REDIS_URL: str | None = None

    # JWT 配置
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30

    # 日志配置
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

---

## FastAPI 路由模板

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List

router = APIRouter(prefix="/api/v1/users", tags=["users"])

# Schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True

# Endpoints
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """创建新用户"""
    return await user_service.create_user(user)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service),
):
    """获取用户详情"""
    user = await user_service.get_by_id(user_id)
    if not user:
        raise NotFoundError("用户")
    return user

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    user_service: UserService = Depends(get_user_service),
):
    """获取用户列表"""
    return await user_service.list_users(skip=skip, limit=limit)
```

---

## 依赖注入

```python
# api/deps.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

def get_user_service(
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
) -> UserService:
    return UserService(db=db, cache=cache)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service),
) -> User:
    credentials_exception = UnauthorizedError("无法验证凭证")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await user_service.get_by_id(int(user_id))
    if user is None:
        raise credentials_exception
    return user
```

---

## 缓存装饰器

```python
from functools import wraps
import json
import hashlib

def cacheable(ttl_seconds: int = 300, prefix: str = ""):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            key_data = f"{func.__name__}:{args}:{kwargs}"
            cache_key = f"{prefix}:{hashlib.md5(key_data.encode()).hexdigest()}"

            # 尝试从缓存获取
            cached = await cache.get(cache_key)
            if cached is not None:
                return cached

            # 执行函数
            result = await func(*args, **kwargs)

            # 存入缓存
            await cache.set(cache_key, result, ttl_seconds)

            return result
        return wrapper
    return decorator

# 使用
class UserService:
    @cacheable(ttl_seconds=300, prefix="user")
    async def get_by_id(self, user_id: int) -> User | None:
        return await self.repository.find_by_id(user_id)
```

---

## 异步编程模式

```python
import asyncio
from typing import AsyncIterator

# 并发执行多个任务
async def fetch_user_data(user_id: int):
    user, orders, profile = await asyncio.gather(
        user_service.get_by_id(user_id),
        order_service.get_by_user_id(user_id),
        profile_service.get_by_user_id(user_id),
    )
    return {"user": user, "orders": orders, "profile": profile}

# 异步流处理
async def process_stream(items: AsyncIterator[str]) -> AsyncIterator[str]:
    async for item in items:
        result = await process_item(item)
        yield result

# 超时控制
async def fetch_with_timeout(url: str, timeout: float = 5.0):
    try:
        async with asyncio.timeout(timeout):
            return await http_client.get(url)
    except asyncio.TimeoutError:
        raise ServiceUnavailableError("请求超时")
```

---

## 测试模板

```python
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

@pytest.fixture
async def client(app):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def mock_user_service():
    return AsyncMock(spec=UserService)

class TestUserEndpoints:
    @pytest.mark.asyncio
    async def test_create_user_success(self, client, mock_user_service):
        mock_user_service.create_user.return_value = User(id=1, email="test@example.com", name="Test")

        with patch("app.api.deps.get_user_service", return_value=mock_user_service):
            response = await client.post("/api/v1/users/", json={
                "email": "test@example.com",
                "name": "Test",
                "password": "password123"
            })

        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_user_not_found(self, client, mock_user_service):
        mock_user_service.get_by_id.return_value = None

        with patch("app.api.deps.get_user_service", return_value=mock_user_service):
            response = await client.get("/api/v1/users/999")

        assert response.status_code == 404

    @pytest.mark.parametrize("email,expected_valid", [
        ("valid@example.com", True),
        ("invalid-email", False),
    ])
    def test_email_validation(self, email, expected_valid):
        # ...
```

---

## 常用命令

```bash
# 开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 格式化
black src/ tests/
isort src/ tests/

# 类型检查
mypy src/

# 测试
pytest
pytest -v --cov=src --cov-report=html

# 依赖管理
pip install -e ".[dev]"
poetry install
pdm install
```
