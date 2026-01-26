---
name: security-review
description: "Security review skill: comprehensive security checklist and patterns. Use when adding authentication, handling user input, working with secrets, or creating API endpoints."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# 安全审查技能

本技能确保所有代码遵循安全最佳实践，识别潜在漏洞。

## 触发条件

- 实现认证或授权
- 处理用户输入或文件上传
- 创建新的 API 端点
- 使用密钥或凭证
- 实现支付功能
- 存储或传输敏感数据
- 集成第三方 API

## 安全检查清单

### 1. 密钥管理

#### ❌ 绝对禁止

```typescript
const apiKey = "sk-proj-xxxxx"; // 硬编码密钥
const dbPassword = "password123"; // 源码中的密码
```

#### ✅ 正确做法

```typescript
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;

// 验证密钥存在
if (!apiKey) {
  throw new Error("OPENAI_API_KEY 未配置");
}
```

```python
import os

api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY 未配置")
```

#### 检查项

- [ ] 无硬编码的 API 密钥、Token 或密码
- [ ] 所有密钥在环境变量中
- [ ] `.env.local` 在 .gitignore 中
- [ ] Git 历史中无密钥
- [ ] 生产密钥在托管平台配置

### 2. 输入验证

#### 始终验证用户输入

```typescript
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
});

export async function createUser(input: unknown) {
  const validated = CreateUserSchema.parse(input);
  return await db.users.create(validated);
}
```

```python
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    name: str
    age: int

    @validator("age")
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError("年龄无效")
        return v
```

#### 文件上传验证

```typescript
function validateFileUpload(file: File) {
  // 大小检查 (5MB 限制)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("文件过大 (最大 5MB)");
  }

  // 类型检查
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("文件类型不允许");
  }

  // 扩展名检查
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error("文件扩展名无效");
  }

  return true;
}
```

#### 检查项

- [ ] 所有用户输入使用 Schema 验证
- [ ] 文件上传限制（大小、类型、扩展名）
- [ ] 不直接在查询中使用用户输入
- [ ] 白名单验证（非黑名单）
- [ ] 错误消息不泄露敏感信息

### 3. SQL 注入防护

#### ❌ 绝不拼接 SQL

```typescript
// 危险 - SQL 注入漏洞
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
await db.query(query);
```

```python
# 危险
query = f"SELECT * FROM users WHERE email = '{email}'"
cursor.execute(query)
```

#### ✅ 始终使用参数化查询

```typescript
// 安全 - 参数化查询
const { data } = await supabase
  .from("users")
  .select("*")
  .eq("email", userEmail);

// 或原生 SQL
await db.query("SELECT * FROM users WHERE email = $1", [userEmail]);
```

```python
# 安全
cursor.execute(
    "SELECT * FROM users WHERE email = ?",
    (email,)
)
```

#### 检查项

- [ ] 所有数据库查询使用参数化
- [ ] SQL 中无字符串拼接
- [ ] ORM/查询构建器正确使用

### 4. 认证与授权

#### JWT Token 处理

```typescript
// ❌ 错误: localStorage (易受 XSS 攻击)
localStorage.setItem("token", token);

// ✅ 正确: httpOnly cookies
res.setHeader(
  "Set-Cookie",
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
);
```

#### 授权检查

```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 始终先验证授权
  const requester = await db.users.findUnique({
    where: { id: requesterId },
  });

  if (requester.role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  await db.users.delete({ where: { id: userId } });
}
```

#### 检查项

- [ ] Token 存储在 httpOnly cookies（非 localStorage）
- [ ] 敏感操作前验证授权
- [ ] 实现基于角色的访问控制
- [ ] 会话管理安全

### 5. XSS 防护

#### 净化 HTML

```typescript
import DOMPurify from 'isomorphic-dompurify'

function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### CSP 头配置

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];
```

#### 检查项

- [ ] 用户提供的 HTML 已净化
- [ ] CSP 头已配置
- [ ] 无未验证的动态内容渲染
- [ ] 使用框架的内置 XSS 防护

### 6. CSRF 防护

```typescript
export async function POST(request: Request) {
  const token = request.headers.get("X-CSRF-Token");

  if (!csrf.verify(token)) {
    return NextResponse.json({ error: "CSRF Token 无效" }, { status: 403 });
  }
  // 处理请求
}
```

#### 检查项

- [ ] 状态变更操作有 CSRF Token
- [ ] 所有 Cookie 使用 SameSite=Strict
- [ ] 双重提交 Cookie 模式

### 7. 速率限制

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每窗口 100 请求
  message: "请求过多",
});

// 对搜索等昂贵操作更严格限制
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10,
  message: "搜索请求过多",
});
```

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/search")
@limiter.limit("10/minute")
async def search(request: Request):
    pass
```

#### 检查项

- [ ] 所有 API 端点有速率限制
- [ ] 昂贵操作更严格限制
- [ ] 基于 IP 的速率限制
- [ ] 认证用户的速率限制

### 8. 敏感数据暴露

#### 日志

```typescript
// ❌ 错误: 记录敏感数据
console.log("用户登录:", { email, password });

// ✅ 正确: 脱敏
console.log("用户登录:", { email, userId });
```

#### 错误消息

```typescript
// ❌ 错误: 暴露内部细节
catch (error) {
  return { error: error.message, stack: error.stack }
}

// ✅ 正确: 通用错误消息
catch (error) {
  console.error('内部错误:', error)
  return { error: '发生错误，请重试' }
}
```

#### 检查项

- [ ] 日志中无密码、Token 或密钥
- [ ] 用户看到通用错误消息
- [ ] 详细错误仅在服务器日志
- [ ] 堆栈跟踪不暴露给用户

### 9. 依赖安全

```bash
# 检查漏洞
npm audit
pip-audit

# 修复
npm audit fix

# 更新依赖
npm update
pip install --upgrade package

# 检查过期包
npm outdated
```

#### 检查项

- [ ] 依赖保持更新
- [ ] 无已知漏洞 (npm audit clean)
- [ ] Lock 文件已提交
- [ ] 启用 Dependabot

### 10. 命令注入防护

```python
# ❌ 危险
import os
os.system(f"echo {user_input}")

# ✅ 安全
import subprocess
subprocess.run(["echo", user_input], shell=False)
```

```typescript
// ❌ 危险
exec(`process ${userInput}`);

// ✅ 安全
execFile("process", [userInput]);
```

### 11. 路径遍历防护

```python
# ❌ 危险
file_path = f"/uploads/{filename}"

# ✅ 安全
import os
safe_name = os.path.basename(filename)
file_path = os.path.join("/uploads", safe_name)
```

## 安全测试

```typescript
// 测试认证
test("需要认证", async () => {
  const response = await fetch("/api/protected");
  expect(response.status).toBe(401);
});

// 测试授权
test("需要管理员角色", async () => {
  const response = await fetch("/api/admin", {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  expect(response.status).toBe(403);
});

// 测试输入验证
test("拒绝无效输入", async () => {
  const response = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ email: "非邮箱" }),
  });
  expect(response.status).toBe(400);
});

// 测试速率限制
test("强制速率限制", async () => {
  const requests = Array(101)
    .fill(null)
    .map(() => fetch("/api/endpoint"));
  const responses = await Promise.all(requests);
  const tooMany = responses.filter((r) => r.status === 429);
  expect(tooMany.length).toBeGreaterThan(0);
});
```

## 部署前安全检查清单

任何生产部署前：

- [ ] **密钥**: 无硬编码密钥，全在环境变量
- [ ] **输入验证**: 所有用户输入已验证
- [ ] **SQL 注入**: 所有查询参数化
- [ ] **XSS**: 用户内容已净化
- [ ] **CSRF**: 防护已启用
- [ ] **认证**: Token 处理正确
- [ ] **授权**: 角色检查到位
- [ ] **速率限制**: 所有端点已启用
- [ ] **HTTPS**: 生产环境强制
- [ ] **安全头**: CSP、X-Frame-Options 已配置
- [ ] **错误处理**: 错误中无敏感数据
- [ ] **日志**: 无敏感数据记录
- [ ] **依赖**: 最新，无漏洞
- [ ] **CORS**: 正确配置
- [ ] **文件上传**: 已验证（大小、类型）

## 专题安全指南

详细的专题安全内容请参考：

- **云基础设施安全**: [cloud-security.md](./cloud-security.md) - IAM、密钥管理、CI/CD、网络安全

---

## 参考资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web 安全学院](https://portswigger.net/web-security)

---

**记住**：安全不是可选项。一个漏洞可能危及整个平台。有疑问时，选择更安全的方案。
