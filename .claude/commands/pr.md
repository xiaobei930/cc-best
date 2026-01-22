---
allowed-tools: Read, Glob, Grep, Bash
---

# /pr - 创建 Pull Request

创建 GitHub Pull Request。

## 任务
1. 检查当前分支状态
2. 确保所有更改已提交并推送
3. 分析分支上的所有提交
4. 生成 PR 标题和描述
5. 使用 gh 命令创建 PR

## PR 格式
```markdown
## Summary
- 主要更改点

## Test plan
- [ ] 测试项目
```

## 执行步骤
1. 检查 git status 和 remote 状态
2. 如需要，推送到远程
3. 分析所有相关提交
4. 生成 PR 内容
5. 创建 PR 并返回 URL

## 注意事项
- 需要 GitHub CLI (gh) 已安装并认证
- 默认目标分支为 main/master
