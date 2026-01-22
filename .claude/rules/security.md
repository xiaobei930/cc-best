---
paths:
  - "**/*"
alwaysApply: true
---

# 安全规则

## 敏感信息处理

### 禁止硬编码
以下信息**绝对禁止**出现在代码中：
- API 密钥 / Token
- 数据库密码
- 私钥 / 证书
- 用户凭证

### 正确做法
```python
# ❌ 错误
API_KEY = "sk-xxxxx"

# ✅ 正确
import os
API_KEY = os.getenv("API_KEY")
```

```typescript
// ❌ 错误
const API_KEY = "sk-xxxxx";

// ✅ 正确
const API_KEY = process.env.API_KEY;
```

### 配置文件规范
```
.env              # 本地开发配置（不提交）
.env.example      # 配置模板（提交）
config.yaml       # 非敏感配置（提交）
```

## 输入验证

### 必须验证的输入
- 用户提交的所有数据
- 文件上传
- URL 参数
- API 请求体

### 验证模式
```python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    name: str
    age: int

    @validator("age")
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError("年龄无效")
        return v
```

## 常见漏洞防护

### SQL 注入
```python
# ❌ 危险
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ 安全
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```

### 命令注入
```python
# ❌ 危险
os.system(f"echo {user_input}")

# ✅ 安全
import subprocess
subprocess.run(["echo", user_input], shell=False)
```

### 路径遍历
```python
# ❌ 危险
file_path = f"/uploads/{filename}"

# ✅ 安全
import os
safe_name = os.path.basename(filename)
file_path = os.path.join("/uploads", safe_name)
```

### XSS 防护
```typescript
// ❌ 危险
element.innerHTML = userInput;

// ✅ 安全
element.textContent = userInput;
// 或使用框架的自动转义
```

## 依赖安全

### 定期检查
```bash
# Python
pip-audit

# Node.js
npm audit

# .NET
dotnet list package --vulnerable

# Java
mvn dependency-check:check
```

### 锁定版本
- 使用 `requirements.txt` 或 `poetry.lock`
- 使用 `package-lock.json` 或 `pnpm-lock.yaml`

## 日志安全

### 禁止记录
- 密码
- Token
- 信用卡号
- 身份证号

### 脱敏处理
```python
def mask_sensitive(value: str) -> str:
    if len(value) > 4:
        return value[:2] + "****" + value[-2:]
    return "****"
```
