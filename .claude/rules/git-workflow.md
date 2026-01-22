---
paths:
  - "**/.git/**"
  - "**/COMMIT_EDITMSG"
alwaysApply: true
---

# Git 工作流规则

## 分支命名
- `main` / `master`: 主分支
- `feature/*`: 功能分支
- `fix/*`: Bug 修复分支
- `docs/*`: 文档分支

## Commit 规范 (Conventional Commits)

### 格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type 类型
| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(auth): add login feature |
| `fix` | Bug 修复 | fix(api): resolve timeout issue |
| `docs` | 文档更新 | docs: update README |
| `style` | 代码格式 | style: format with prettier |
| `refactor` | 重构 | refactor: simplify logic |
| `test` | 测试 | test: add unit tests |
| `chore` | 构建/工具 | chore: update dependencies |

### 示例
```
feat(user): 添加用户登录功能

- 实现邮箱密码登录
- 添加 JWT Token 生成
- 支持记住密码选项

Closes #123
```

## 提交前检查

### 必须通过
- [ ] 代码无语法错误
- [ ] 相关测试通过
- [ ] 无敏感信息（.env, *.key）

### 禁止操作
- `git push --force` 到主分支
- `git reset --hard` 丢失未提交代码
- `git commit --amend` 已推送的提交

## PR 规范

### 标题格式
```
[Type] Brief description
```

### 描述模板
```markdown
## 变更内容
- 变更点 1
- 变更点 2

## 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动验证

## 相关 Issue
Closes #xxx
```
