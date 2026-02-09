# 综合验证方法论参考

> 本文件是 `/cc-best:verify` 命令的知识参考。
> 包含验证流程详细步骤、输出报告格式、快速模式、项目类型检测、失败处理指南。

---

## 验证流程（6 Phase）

```
┌─────────────────────────────────────────────────────────────────┐
│                    /cc-best:verify 验证流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: 构建检查                                              │
│  ├─ 检测项目类型（Node/Python/Go/Java/...）                     │
│  └─ 执行构建命令                                                │
│                                                                 │
│  Phase 2: 类型检查（如适用）                                     │
│  ├─ TypeScript: tsc --noEmit                                   │
│  ├─ Python: mypy / pyright                                     │
│  └─ 其他语言: 对应类型检查工具                                   │
│                                                                 │
│  Phase 3: Lint 检查                                             │
│  ├─ ESLint / Biome (JS/TS)                                     │
│  ├─ Ruff / Flake8 (Python)                                     │
│  └─ 其他语言对应 linter                                         │
│                                                                 │
│  Phase 4: 测试套件                                              │
│  ├─ 单元测试                                                    │
│  ├─ 集成测试                                                    │
│  └─ E2E 测试（如有）                                            │
│                                                                 │
│  Phase 5: 安全扫描                                              │
│  ├─ 依赖漏洞检查                                                │
│  ├─ 敏感信息检查                                                │
│  └─ 常见安全模式检查                                            │
│                                                                 │
│  Phase 6: Git 状态检查                                          │
│  ├─ 未提交变更                                                  │
│  ├─ console.log / print 审计                                    │
│  └─ TODO/FIXME 审计                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 详细执行步骤

### Phase 1: 构建检查

```bash
# 检测项目类型并执行构建
# Node.js
npm run build || yarn build || pnpm build

# Python
python -m py_compile **/*.py

# Go
go build ./...

# Java
mvn compile || gradle build
```

**通过标准**: 构建命令返回 0

### Phase 2: 类型检查

```bash
# TypeScript
npx tsc --noEmit

# Python (如有配置)
mypy . || pyright .
```

**通过标准**: 无类型错误

### Phase 3: Lint 检查

```bash
# JS/TS
npx eslint . || npx biome check .

# Python
ruff check . || flake8 .
```

**通过标准**: 无 lint 错误（警告可接受）

### Phase 4: 测试套件

```bash
# Node.js
npm test || yarn test || pnpm test

# Python
pytest

# Go
go test ./...

# Java
mvn test || gradle test
```

**通过标准**: 所有测试通过

### Phase 5: 安全扫描

```bash
# Node.js 依赖检查
npm audit --audit-level=high

# Python 依赖检查
pip-audit || safety check

# 敏感信息检查
grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.ts" --include="*.js" --include="*.py" || true
```

**通过标准**: 无高危漏洞，无硬编码敏感信息

### Phase 6: Git 状态检查

```bash
# 检查未提交变更
git status --porcelain

# console.log 审计
grep -rn "console\.log\|console\.debug" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ || true

# TODO/FIXME 审计
grep -rn "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" src/ || true
```

**通过标准**: 了解当前状态（不强制失败）

---

## 输出报告格式

```
══════════════════════════════════════════════════════════════════
                        VERIFICATION REPORT
══════════════════════════════════════════════════════════════════

Phase 1: Build Check
────────────────────────────────────────────────────────────────
[PASS] Build completed successfully

Phase 2: Type Check
────────────────────────────────────────────────────────────────
[PASS] No type errors found

Phase 3: Lint Check
────────────────────────────────────────────────────────────────
[PASS] No lint errors (2 warnings)

Phase 4: Test Suite
────────────────────────────────────────────────────────────────
[PASS] 42 tests passed, 0 failed

Phase 5: Security Scan
────────────────────────────────────────────────────────────────
[PASS] No high/critical vulnerabilities
[WARN] 2 moderate vulnerabilities found

Phase 6: Git Status
────────────────────────────────────────────────────────────────
[INFO] 3 files modified, not committed
[WARN] 5 console.log statements found
[INFO] 2 TODO comments found

══════════════════════════════════════════════════════════════════
                    VERIFICATION: [PASS/FAIL]
══════════════════════════════════════════════════════════════════

Summary:
- Passed: 4/6 phases
- Warnings: 2
- Action Required: [描述需要处理的问题]
```

### 结果状态定义

| 状态     | 含义               | 后续动作 |
| -------- | ------------------ | -------- |
| `[PASS]` | 检查通过           | 可继续   |
| `[WARN]` | 有警告但可接受     | 建议处理 |
| `[FAIL]` | 检查失败           | 必须修复 |
| `[SKIP]` | 跳过（工具不存在） | 无       |
| `[INFO]` | 信息提示           | 仅供参考 |

---

## 快速模式选项

```bash
# 完整验证（默认）
/cc-best:verify

# 快速验证（跳过耗时步骤）
/cc-best:verify --quick
# 仅执行: build + type + lint

# 仅测试
/cc-best:verify --test-only

# 仅安全扫描
/cc-best:verify --security-only
```

---

## 项目类型自动检测

```
检测逻辑：
├─ package.json 存在 → Node.js 项目
├─ pyproject.toml / setup.py 存在 → Python 项目
├─ go.mod 存在 → Go 项目
├─ pom.xml 存在 → Maven 项目
├─ build.gradle 存在 → Gradle 项目
├─ Cargo.toml 存在 → Rust 项目
└─ 其他 → 通用检查
```

---

## 失败处理指南

### 构建失败

1. 检查错误信息
2. 修复编译/构建错误
3. 重新 `/cc-best:verify`

### 类型检查失败

1. 修复类型错误
2. 确保类型注解完整
3. 重新 `/cc-best:verify`

### 测试失败

1. 分析失败原因
2. 修复代码或测试
3. 重新 `/cc-best:verify`

### 安全扫描失败

1. 更新有漏洞的依赖
2. 移除硬编码敏感信息
3. 重新 `/cc-best:verify`

---

## 安全测试示例

> 以下内容从 `SKILL.md` 提取，供验证阶段参考。

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

---

## 部署前安全检查清单

> 以下内容从 `SKILL.md` 提取，任何生产部署前必须确认。

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
