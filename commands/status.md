---
description: 项目状态与诊断信息
argument-hint: "[--full|--conflicts]"
allowed-tools: Read, Glob, Grep, Bash
---

# /status - 项目状态与诊断

检查项目整体状态，提供健康诊断和改进建议。

## 参数

| 参数          | 说明                            |
| ------------- | ------------------------------- |
| (无参数)      | 基本状态检查                    |
| `--full`      | 完整诊断，包括 CC-Best 组件统计 |
| `--conflicts` | 检测与其他插件的冲突            |

## 检查项目

执行以下检查并生成状态报告：

### 1. Git 状态

- 当前分支名称
- 未提交的更改数量
- 与远程的同步状态
- 最近一次提交信息

### 2. Memory Bank 状态

- `progress.md` 行数（超过 300 行提醒归档）
- 最后更新时间
- 是否存在未完成任务

### 3. 依赖状态

- Python 依赖（requirements.txt / pyproject.toml）
- Node.js 依赖（package.json）
- 是否有过期或缺失的依赖

### 4. 环境配置

- 必要的环境变量是否已设置
- `.env` 文件是否存在

### 5. CC-Best 组件统计（--full）

扫描并统计项目组件：

```
📊 CC-Best 组件统计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commands:  42 个 (commands/*.md)
Skills:    17 个 (skills/*/SKILL.md)
Agents:     8 个 (agents/*.md)
Hooks:     21 个 (scripts/node/hooks/*.js)
Rules:     33 个 (rules/**/*.md)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. 插件冲突检测（--conflicts）

检查是否存在与其他插件的潜在冲突：

```
⚠️ 潜在冲突检测
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
检测到 Superpowers 插件：
  - SessionStart hooks 可能冲突
  - 建议：CC-Best 用于团队工作流，Superpowers 用于 git 自动化

检测到 code-review 插件：
  - 与 code-reviewer agent 功能重叠
  - 建议：可共存，agent 做快速检查，插件做深度分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 输出格式

```
📊 项目状态报告
═══════════════════════════════════════

🌿 Git 状态
  分支: main
  最近提交: abc1234 - feat: add login
  工作区: 2 个文件未提交

📝 Memory Bank
  progress.md: 150 行 ✅
  最后更新: 2026-01-27

📦 依赖
  Node.js: ✅ 已安装
  Python: ⚠️ 未检测到 requirements.txt

═══════════════════════════════════════

💡 建议:
  (如有问题会列出改进建议)
```

## 使用场景

- 开始工作前检查项目状态
- 排查问题时快速了解环境
- 确认部署前的准备状态
- 诊断配置问题
- 检测插件冲突（`--conflicts`）
