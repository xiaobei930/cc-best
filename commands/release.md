---
description: 版本发布管理（版本号同步、CHANGELOG 更新、Git Tag）
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /release - 版本发布管理

管理插件版本发布流程，**自动同步版本号到所有相关文件**，更新 CHANGELOG，创建 Git Tag。

## 使用方式

```bash
# 发布补丁版本 (0.5.9 → 0.5.10)
/cc-best:release patch

# 发布次版本 (0.5.9 → 0.6.0)
/cc-best:release minor

# 发布主版本 (0.5.9 → 1.0.0)
/cc-best:release major

# 预览变更（不实际执行）
/cc-best:release patch --dry-run

# 指定版本号
/cc-best:release 0.6.0
```

---

## 执行流程

### 第 0 步：守卫检查

- `git status` 必须干净（无未提交变更）
- 当前分支必须是 `main`
- 确认远程仓库已同步（`git pull --ff-only`）
- 检查 CHANGELOG.md 中是否有待发布内容

### 第 1 步：读取当前版本

```bash
# 从 plugin.json 读取版本
node -e "console.log(require('./.claude-plugin/plugin.json').version)"
```

### 第 2 步：计算目标版本

根据参数计算下一版本号：

| 当前版本 | patch  | minor | major |
| -------- | ------ | ----- | ----- |
| 0.5.9    | 0.5.10 | 0.6.0 | 1.0.0 |

### 第 3 步：同步版本号

需要更新版本号的文件（**4 个**）：

| 文件                              | 字段/位置                   |
| --------------------------------- | --------------------------- |
| `.claude-plugin/plugin.json`      | `version` 字段              |
| `.claude-plugin/marketplace.json` | `plugins[0].version` 字段   |
| `.claude-plugin/ARCHITECTURE.md`  | 头部 `Version: x.x.x`       |
| `CHANGELOG.md`                    | `[x.x.x] - YYYY-MM-DD` 标题 |

同时更新 `plugin.json` 中 `description` 的统计数字（如有变化）。

### 第 4 步：更新 CHANGELOG

- 将 `[x.x.x] - YYYY-MM-DD` 替换为实际日期
- 如有 `Unreleased` 区段，合并到新版本区段
- 确保格式符合 [Keep a Changelog](https://keepachangelog.com/) 规范

### 第 5 步：提交与打标签

```bash
# 提交版本变更
git add -A
git commit -m "chore(release): v<VERSION>"

# 创建标签
git tag -a v<VERSION> -m "Release v<VERSION>"
```

### 第 6 步：验证

- 确认 4 个文件版本号一致
- 确认 Git Tag 已创建
- 确认 CHANGELOG 格式正确
- 提示用户执行 `git push && git push --tags`（不自动推送）

---

## --dry-run 模式

预览模式下：

- 显示将要修改的文件和内容
- 显示版本号变化: `0.5.9 → 0.6.0`
- 不实际修改任何文件
- 不创建 commit 或 tag

---

## 注意事项

1. **不自动推送**: 发布后提示用户手动推送，给予最后确认机会
2. **幂等性**: 如果中途失败，可以重新执行（会覆盖上次的部分变更）
3. **CHANGELOG 格式**: 严格遵循 Keep a Changelog 格式
4. **语义化版本**: 遵循 [SemVer](https://semver.org/) 规范
