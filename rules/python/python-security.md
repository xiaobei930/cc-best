---
paths:
  - "**/*.py"
---

# Python 安全规范 | Python Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供 Python 特定安全规范

## 禁止操作

### 禁止拼接 SQL 语句

```python
# ❌ SQL 注入风险
query = f"SELECT * FROM users WHERE name = '{name}'"
cursor.execute(query)

# ✅ 使用参数化查询
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))

# ✅ 使用 SQLAlchemy ORM
user = session.query(User).filter(User.name == name).first()

# ✅ 使用 SQLAlchemy Core 绑定参数
stmt = select(users).where(users.c.name == bindparam("name"))
result = conn.execute(stmt, {"name": name})
```

### 禁止使用 pickle 反序列化不可信数据

```python
# ❌ pickle.loads 可执行任意代码，严重安全风险
import pickle

data = pickle.loads(untrusted_bytes)  # 远程代码执行漏洞

# ✅ 使用安全的序列化格式
import json

data = json.loads(untrusted_string)

# ✅ 如必须使用二进制格式，选择 msgpack 或 protobuf
import msgpack

data = msgpack.unpackb(untrusted_bytes, raw=False)
```

### 禁止使用 eval/exec 处理用户输入

```python
# ❌ 代码注入风险
result = eval(user_expression)
exec(user_code)

# ✅ 使用 ast.literal_eval 处理简单字面量
import ast

value = ast.literal_eval(user_input)  # 仅支持基本类型

# ✅ 使用白名单 + 专用解析器
from simpleeval import simple_eval

result = simple_eval(user_expression, names={"x": 10, "y": 20})
```

### 禁止使用 shell=True 的 subprocess

```python
# ❌ 命令注入风险
import subprocess

subprocess.run(f"ls {user_path}", shell=True)

# ✅ 使用列表参数，避免 shell 解析
subprocess.run(["ls", user_path], shell=False, check=True)

# ✅ 使用 shlex.quote 转义（仅在必须用 shell 时）
import shlex

subprocess.run(f"ls {shlex.quote(user_path)}", shell=True)
```

---

## 必须遵守

### 输入验证使用 Pydantic

```python
from pydantic import BaseModel, Field, field_validator, EmailStr

class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    age: int = Field(ge=18, le=120)

    @field_validator("name")
    @classmethod
    def name_must_not_contain_special_chars(cls, v: str) -> str:
        if not v.replace(" ", "").isalnum():
            raise ValueError("用户名不能包含特殊字符")
        return v.strip()

# ✅ FastAPI 自动验证
@app.post("/users")
async def create_user(request: CreateUserRequest):
    return await user_service.create(request)
```

### 密钥管理使用环境变量

```python
# ❌ 硬编码密钥
SECRET_KEY = "my-super-secret-key"
DATABASE_URL = "postgresql://user:password@host/db"

# ✅ 使用 python-dotenv + 环境变量
from dotenv import load_dotenv
import os

load_dotenv()  # 从 .env 文件加载

SECRET_KEY = os.environ["SECRET_KEY"]  # 缺失时抛异常
DATABASE_URL = os.environ["DATABASE_URL"]

# ✅ 使用 pydantic-settings 类型安全配置
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str
    database_url: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

### SSTI（服务端模板注入）防护

```python
# ❌ 直接拼接用户输入到模板字符串
from jinja2 import Template

template = Template(user_provided_template)  # SSTI 漏洞
result = template.render(data=data)

# ✅ 使用沙箱环境
from jinja2 import SandboxedEnvironment

env = SandboxedEnvironment()
template = env.from_string(user_provided_template)
result = template.render(data=data)

# ✅ 最佳实践：禁止用户自定义模板，只允许变量替换
result = predefined_template.render(user_name=user_input)
```

### 文件操作安全

```python
import os
from pathlib import Path

UPLOAD_DIR = Path("/app/uploads")

# ❌ 路径遍历风险
def get_file(filename: str):
    return open(f"/app/uploads/{filename}", "rb")  # ../../etc/passwd

# ✅ 使用 Path.resolve() 验证路径
def get_file_safe(filename: str):
    safe_name = Path(filename).name  # 去除路径分隔符
    file_path = (UPLOAD_DIR / safe_name).resolve()

    # 确认文件在允许的目录内
    if not str(file_path).startswith(str(UPLOAD_DIR.resolve())):
        raise ValueError("非法文件路径")

    if not file_path.exists():
        raise FileNotFoundError(f"文件不存在: {safe_name}")

    return open(file_path, "rb")
```

---

## 推荐做法

### 依赖安全审计

```bash
# 使用 pip-audit 检查已知漏洞
pip-audit

# 使用 safety 检查（需 API key）
safety check --full-report

# 使用 bandit 静态安全扫描
bandit -r src/ -f json -o security-report.json

# 在 CI 中集成
# pyproject.toml
# [tool.bandit]
# exclude_dirs = ["tests", "migrations"]
# skips = ["B101"]  # 跳过 assert 检查（测试中常用）
```

### 密码与 Token 处理

```python
# ✅ 密码哈希使用 bcrypt 或 passlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ✅ 生成安全随机 Token
import secrets

token = secrets.token_urlsafe(32)  # URL 安全的随机字符串
api_key = secrets.token_hex(32)    # 十六进制随机字符串
```

### 日志脱敏

```python
import logging
import re

class SensitiveDataFilter(logging.Filter):
    """过滤日志中的敏感信息"""
    PATTERNS = [
        (re.compile(r"password['\"]?\s*[:=]\s*['\"]?[\w!@#$%^&*]+"), "password=****"),
        (re.compile(r"token['\"]?\s*[:=]\s*['\"]?[\w\-._~+/]+=*"), "token=****"),
        (re.compile(r"\b\d{16,19}\b"), "****"),  # 信用卡号
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        msg = str(record.msg)
        for pattern, replacement in self.PATTERNS:
            msg = pattern.sub(replacement, msg)
        record.msg = msg
        return True

# 使用
logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())
```

### CORS 安全配置（FastAPI）

```python
from fastapi.middleware.cors import CORSMiddleware

# ❌ 允许所有来源
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# ✅ 明确指定允许的来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.example.com",
        "https://admin.example.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```
