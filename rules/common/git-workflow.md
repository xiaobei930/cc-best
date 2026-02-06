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

| Type       | 说明      | 示例                                   |
| ---------- | --------- | -------------------------------------- |
| `feat`     | 新功能    | feat(auth): add login feature          |
| `fix`      | Bug 修复  | fix(api): resolve timeout issue        |
| `docs`     | 文档更新  | docs: update README                    |
| `style`    | 代码格式  | style: format with prettier            |
| `refactor` | 重构      | refactor: simplify logic               |
| `perf`     | 性能优化  | perf(query): optimize database queries |
| `test`     | 测试      | test: add unit tests                   |
| `chore`    | 构建/工具 | chore: update dependencies             |

### Description 规范

- 使用**小写字母**开头（不首字母大写）
- 使用**现在时态**动词（add 而非 added）
- 不超过 **50 字符**
- 不以句号结尾

### 示例

```
feat(user): add email/password login

- implement email validation
- add JWT token generation
- support remember-me option

Closes #123
```

## 提交前检查

### 必须通过

- [ ] 代码无语法错误
- [ ] 相关测试通过
- [ ] 无敏感信息（.env, \*.key）

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
