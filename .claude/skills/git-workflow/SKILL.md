---
name: git-workflow
description: "Git 工作流技能：包含分支策略、提交规范、合并策略、冲突解决等最佳实践。Use when managing Git branches, creating commits, handling merges, or resolving conflicts."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Git 工作流技能

本技能提供 Git 版本控制的最佳实践。

## 触发条件

- 管理 Git 分支
- 创建提交
- 处理合并
- 解决冲突
- 代码审查

## 分支策略

### Git Flow

```
main (生产)
  │
  └── develop (开发)
        │
        ├── feature/xxx (功能分支)
        ├── release/x.x (发布分支)
        └── hotfix/xxx (热修复)
```

### GitHub Flow（推荐）

```
main (始终可部署)
  │
  └── feature/xxx (功能分支)
        │
        └── PR → Code Review → Merge
```

### 分支命名规范

```bash
# 功能分支
feature/add-user-auth
feature/JIRA-123-payment-integration

# Bug 修复
fix/login-validation
bugfix/JIRA-456-cart-total

# 热修复
hotfix/security-patch

# 发布
release/v1.2.0

# 重构
refactor/database-layer
```

## 提交规范 (Conventional Commits)

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(auth): 添加 OAuth 登录 |
| fix | Bug 修复 | fix(cart): 修复价格计算错误 |
| docs | 文档更新 | docs(readme): 更新安装说明 |
| style | 格式调整 | style: 格式化代码 |
| refactor | 重构 | refactor(api): 重构用户服务 |
| perf | 性能优化 | perf(query): 优化搜索查询 |
| test | 测试 | test(user): 添加用户注册测试 |
| chore | 构建/工具 | chore(deps): 更新依赖 |
| ci | CI 配置 | ci: 添加 GitHub Actions |

### 示例

```bash
# 简单提交
git commit -m "feat(user): 添加用户头像上传功能"

# 带详情的提交
git commit -m "fix(payment): 修复支付金额精度问题

- 使用 Decimal 替代 float 处理金额
- 添加金额格式化工具函数
- 更新相关测试用例

Closes #123"

# 破坏性变更
git commit -m "feat(api)!: 重构 API 响应格式

BREAKING CHANGE: API 响应格式从 {data} 改为 {success, data, error}"
```

## 常用命令

### 分支操作

```bash
# 创建并切换分支
git checkout -b feature/new-feature

# 从远程创建本地分支
git checkout -b feature/xxx origin/feature/xxx

# 删除本地分支
git branch -d feature/xxx

# 删除远程分支
git push origin --delete feature/xxx

# 重命名分支
git branch -m old-name new-name
```

### 提交操作

```bash
# 暂存特定文件
git add src/user.ts src/auth.ts

# 交互式暂存
git add -p

# 修改最后一次提交（未推送）
git commit --amend

# 修改提交信息
git commit --amend -m "新的提交信息"
```

### 同步操作

```bash
# 拉取并变基
git pull --rebase origin main

# 推送
git push origin feature/xxx

# 强制推送（谨慎！）
git push --force-with-lease origin feature/xxx
```

### 查看历史

```bash
# 简洁日志
git log --oneline -20

# 图形化日志
git log --graph --oneline --all

# 查看文件历史
git log -p -- path/to/file

# 查看某人的提交
git log --author="name"

# 搜索提交内容
git log -S "search term"
```

### 撤销操作

```bash
# 撤销工作区修改
git checkout -- file.ts

# 取消暂存
git reset HEAD file.ts

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1

# 创建反向提交
git revert commit-hash
```

### 储藏操作

```bash
# 储藏当前修改
git stash

# 储藏并命名
git stash save "WIP: 用户功能"

# 查看储藏列表
git stash list

# 应用最近储藏
git stash pop

# 应用特定储藏
git stash apply stash@{2}

# 删除储藏
git stash drop stash@{0}
```

## 合并策略

### Merge（合并提交）

```bash
# 创建合并提交
git checkout main
git merge feature/xxx

# 优点：保留完整历史
# 缺点：历史线复杂
```

### Rebase（变基）

```bash
# 变基到 main
git checkout feature/xxx
git rebase main

# 优点：线性历史
# 缺点：改写历史，需要强制推送
```

### Squash Merge（压缩合并）

```bash
# 压缩为单个提交
git checkout main
git merge --squash feature/xxx
git commit -m "feat: 完成用户功能"

# 优点：干净的主分支历史
# 缺点：丢失详细提交记录
```

### 选择策略

| 场景 | 推荐策略 |
|------|----------|
| 功能分支 → main | Squash Merge |
| main → 功能分支 | Rebase |
| 长期分支同步 | Merge |
| 发布分支 | Merge |

## 冲突解决

### 解决步骤

```bash
# 1. 拉取最新代码
git fetch origin

# 2. 合并/变基
git rebase origin/main
# 遇到冲突

# 3. 查看冲突文件
git status

# 4. 编辑冲突文件
# 手动解决 <<<<<<< ======= >>>>>>> 标记

# 5. 标记已解决
git add resolved-file.ts

# 6. 继续变基
git rebase --continue

# 或放弃变基
git rebase --abort
```

### 冲突标记

```
<<<<<<< HEAD
当前分支的代码
=======
合并分支的代码
>>>>>>> feature/xxx
```

### VS Code 冲突解决

- Accept Current Change (保留当前)
- Accept Incoming Change (保留传入)
- Accept Both Changes (保留两者)
- Compare Changes (比较差异)

## Pull Request 流程

### 创建 PR

```bash
# 推送分支
git push -u origin feature/xxx

# 使用 GitHub CLI 创建 PR
gh pr create --title "feat: 添加用户功能" --body "
## 变更说明
- 添加用户注册
- 添加用户登录

## 测试
- [x] 单元测试通过
- [x] 本地测试通过
"
```

### PR 模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新

## 变更说明
[描述本次变更的内容]

## 相关 Issue
Closes #xxx

## 测试
- [ ] 添加了新测试
- [ ] 所有测试通过
- [ ] 本地验证通过

## 截图（如适用）
[UI 变更截图]

## 检查清单
- [ ] 代码符合规范
- [ ] 已更新文档
- [ ] 无敏感信息提交
```

## Git Hooks

### pre-commit

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 运行 lint
npm run lint

# 运行测试
npm test

# 检查敏感信息
if git diff --cached | grep -E "(api_key|password|secret)" > /dev/null; then
  echo "警告：检测到可能的敏感信息"
  exit 1
fi
```

### commit-msg

```bash
#!/bin/sh
# .git/hooks/commit-msg

# 验证提交信息格式
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|ci)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "错误：提交信息不符合规范"
  echo "格式：type(scope): description"
  exit 1
fi
```

## .gitignore 最佳实践

```gitignore
# 依赖
node_modules/
venv/
__pycache__/

# 构建输出
dist/
build/
*.egg-info/

# 环境变量
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# 日志
*.log
logs/

# 测试覆盖率
coverage/
.coverage

# 缓存
.cache/
.pytest_cache/
```

## 最佳实践

1. **小而频繁的提交** - 每个提交做一件事
2. **有意义的提交信息** - 说明为什么，不只是什么
3. **保持分支更新** - 经常从主分支同步
4. **PR 前自检** - lint、test、review
5. **不要提交敏感信息** - 使用环境变量
6. **使用 .gitignore** - 忽略不需要的文件
7. **定期清理分支** - 合并后删除
8. **备份重要操作** - 变基前创建备份分支
9. **团队约定** - 统一的分支和提交规范
10. **利用 Git Hooks** - 自动化检查
