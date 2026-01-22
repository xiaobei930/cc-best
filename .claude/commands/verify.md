---
allowed-tools: Read, Glob, Grep, Bash, TodoWrite
---

# /verify - 综合验证命令

一键执行完整验证流程，确保代码质量。适用于提交前、合并前、发布前的最终检查。

> **设计理念**: 将多个验证步骤整合为一个命令，避免遗漏检查项。

## 使用场景

| 场景 | 触发时机 |
|------|----------|
| 提交前 | `/dev` 完成后，`/commit` 前 |
| 合并前 | PR 准备合并到主分支前 |
| 发布前 | 版本发布前的最终检查 |
| 问题排查 | 快速定位哪个环节有问题 |

## 验证流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    /verify 验证流程                              │
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

## 执行步骤

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

## 输出格式

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

## 结果状态

| 状态 | 含义 | 后续动作 |
|------|------|----------|
| `[PASS]` | 检查通过 | 可继续 |
| `[WARN]` | 有警告但可接受 | 建议处理 |
| `[FAIL]` | 检查失败 | 必须修复 |
| `[SKIP]` | 跳过（工具不存在） | 无 |
| `[INFO]` | 信息提示 | 仅供参考 |

## 快速模式

```bash
# 完整验证（默认）
/verify

# 快速验证（跳过耗时步骤）
/verify --quick
# 仅执行: build + type + lint

# 仅测试
/verify --test-only

# 仅安全扫描
/verify --security-only
```

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

## 与其他命令的关系

```
/dev (开发完成)
    ↓
/verify (综合验证)  ←── 本命令
    ↓
    ├─ PASS → /qa (功能验收) → /commit
    └─ FAIL → 修复问题 → 重新 /verify
```

## 失败后的处理

### 构建失败
1. 检查错误信息
2. 修复编译/构建错误
3. 重新 `/verify`

### 类型检查失败
1. 修复类型错误
2. 确保类型注解完整
3. 重新 `/verify`

### 测试失败
1. 分析失败原因
2. 修复代码或测试
3. 重新 `/verify`

### 安全扫描失败
1. 更新有漏洞的依赖
2. 移除硬编码敏感信息
3. 重新 `/verify`

## 自定义配置

项目可在 `package.json` 或 `pyproject.toml` 中配置验证命令：

```json
// package.json
{
  "scripts": {
    "verify:build": "npm run build",
    "verify:type": "tsc --noEmit",
    "verify:lint": "eslint .",
    "verify:test": "vitest run",
    "verify:security": "npm audit"
  }
}
```

如果存在 `verify:*` 脚本，优先使用项目自定义命令。

---

## 执行检查清单

开始验证前，确认：
- [ ] 项目依赖已安装
- [ ] 环境变量已配置（如需要）
- [ ] 数据库/服务已启动（如测试需要）

验证完成后：
- [ ] 所有 FAIL 项已修复
- [ ] WARN 项已评估（可接受则继续）
- [ ] 准备好进入下一步
