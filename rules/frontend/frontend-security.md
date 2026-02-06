---
paths:
  - "**/*"
alwaysApply: true
---

# 前端安全规范 | Frontend Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供前端特定安全规范

## 禁止操作

### 直接插入未转义的 HTML

```tsx
// ❌ React 中使用 dangerouslySetInnerHTML 未经 sanitize
function Comment({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ 使用 DOMPurify 清理后再插入
import DOMPurify from "dompurify";

function Comment({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "i", "a"] });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

```typescript
// ❌ 原生 DOM 直接写入用户输入
element.innerHTML = userInput;

// ✅ 使用 textContent 或框架模板绑定
element.textContent = userInput;
```

### 在 localStorage 中存储敏感信息

```typescript
// ❌ Token 存入 localStorage，XSS 可直接窃取
localStorage.setItem("access_token", token);

// ✅ 使用 HttpOnly Cookie 由服务端设置
// Set-Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict
// 前端无需手动存储，浏览器自动携带
```

### 禁用或放宽 CORS

```typescript
// ❌ 允许所有来源（仅限开发环境）
app.use(cors({ origin: "*" }));

// ✅ 明确指定允许的来源
app.use(
  cors({
    origin: ["https://app.example.com", "https://admin.example.com"],
    credentials: true,
  }),
);
```

---

## 必须遵守

### XSS 防御清单

所有用户输入在渲染前必须经过处理：

| 场景               | 防御方式                             |
| ------------------ | ------------------------------------ |
| 文本渲染           | 框架自动转义（React JSX / Vue 模板） |
| 富文本编辑器输出   | DOMPurify sanitize                   |
| URL 参数拼接到页面 | `encodeURIComponent()` 编码          |
| `href` 动态绑定    | 校验协议，禁止 `javascript:`         |
| SVG / MathML 嵌入  | DOMPurify 白名单过滤                 |

```typescript
// ❌ 动态 href 可能执行脚本
<a href={userProvidedUrl}>链接</a>

// ✅ 校验 URL 协议
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
<a href={isSafeUrl(url) ? url : "#"}>链接</a>
```

### CSRF 防护

前端请求必须携带 CSRF Token：

```typescript
// axios 全局拦截器自动携带 CSRF Token
import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// fetch 手动添加
const csrfToken = document.querySelector<HTMLMetaElement>(
  'meta[name="csrf-token"]',
)?.content;

fetch("/api/data", {
  method: "POST",
  headers: { "X-CSRFToken": csrfToken ?? "" },
  credentials: "same-origin",
});
```

### Content-Security-Policy 配置

必须在 HTML `<meta>` 或 HTTP 响应头中配置 CSP：

```html
<!-- ❌ 允许 inline script，等同于无防护 -->
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'unsafe-inline'"
/>

<!-- ✅ 严格 CSP，使用 nonce 或 hash -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
/>
```

### 依赖安全审计

每次添加新依赖后必须执行审计：

```bash
# 检查已知漏洞
npm audit

# 自动修复非破坏性漏洞
npm audit fix

# 查看依赖树中的指定包
npm ls lodash
```

---

## 推荐做法

### Sanitize 用户输入的统一方案

```typescript
// utils/sanitize.ts — 项目统一入口
import DOMPurify from "dompurify";

/** 清理富文本，保留基础格式标签 */
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "li"],
    ALLOWED_ATTR: ["href", "target"],
  });
}

/** 清理纯文本，移除所有 HTML */
export function sanitizePlainText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

### 第三方脚本加载安全

```html
<!-- ❌ 无完整性校验 -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- ✅ 使用 SRI (Subresource Integrity) 校验 -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K..."
  crossorigin="anonymous"
></script>
```

### 敏感操作二次确认

关键操作（删除、支付、权限变更）必须增加确认步骤，防止 CSRF 和 Clickjacking：

```typescript
// ✅ 关键操作需二次验证
async function deleteAccount() {
  const confirmed = await showConfirmDialog("确认删除账户？此操作不可撤销。");
  if (!confirmed) return;

  const code = await requestVerificationCode(); // 短信/邮箱验证码
  await api.deleteAccount({ verificationCode: code });
}
```
