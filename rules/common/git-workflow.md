---
---

# Git 工作流规则

## 分支命名

- `main` / `master`: 主分支
- `feature/*` / `fix/*` / `docs/*`: 功能/修复/文档分支

## Commit 规范 (Conventional Commits)

格式: `<type>(<scope>): <description>`

| Type       | 说明     | Type    | 说明      |
| ---------- | -------- | ------- | --------- |
| `feat`     | 新功能   | `fix`   | Bug 修复  |
| `docs`     | 文档更新 | `style` | 代码格式  |
| `refactor` | 重构     | `perf`  | 性能优化  |
| `test`     | 测试     | `chore` | 构建/工具 |

Description: 小写开头，现在时态，≤50 字符，不以句号结尾

## 提交前检查

- 代码无语法错误，相关测试通过
- 无敏感信息（.env, \*.key）

## 禁止操作

- `git push --force` 到主分支
- `git reset --hard` 丢失未提交代码
- `git commit --amend` 已推送的提交

## PR 规范

标题: `[Type] Brief description`，描述包含变更内容、测试清单、关联 Issue
