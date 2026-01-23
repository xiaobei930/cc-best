# Skills 技能系统指南

Claude Code 技能系统允许你定义可复用的专业知识、工作流和自动化。

## 什么是 Skill？

Skill 是一个包含 `SKILL.md` 文件的文件夹，可以包含：

- 指令和最佳实践
- 参考文件
- 可执行脚本

## 目录结构

```
.claude/skills/
├── README.md                    # 本文档
├── security-review/
│   └── SKILL.md                 # 安全审查技能
├── backend-patterns/
│   ├── SKILL.md                 # 后端通用模式
│   ├── python.md                # Python 特定模式
│   ├── typescript.md            # TypeScript 特定模式
│   ├── java.md                  # Java 特定模式
│   ├── go.md                    # Go 特定模式
│   └── csharp.md                # C# 特定模式
├── frontend-patterns/
│   ├── SKILL.md                 # 前端通用模式
│   ├── vue.md                   # Vue 特定模式
│   ├── react.md                 # React 特定模式
│   ├── svelte.md                # Svelte 特定模式
│   └── angular.md               # Angular 特定模式
├── devops-patterns/
│   ├── SKILL.md                 # DevOps 通用模式
│   ├── docker.md                # Docker 最佳实践
│   └── ci-cd.md                 # CI/CD 流水线
├── isolated-research/
│   └── SKILL.md                 # 🆕 隔离上下文研究（context: fork）
└── ...
```

## SKILL.md Frontmatter 字段

所有字段都是可选的：

```yaml
---
name: my-skill
description: 技能描述，说明何时使用
argument-hint: [参数提示]
disable-model-invocation: true
user-invocable: false
allowed-tools: Read, Grep, Glob
model: sonnet
context: fork
agent: Explore
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
once: true
---
技能指令内容...
```

### 字段说明

| 字段                       | 类型    | 说明                                                          |
| -------------------------- | ------- | ------------------------------------------------------------- |
| `name`                     | string  | 显示名称（小写、连字符，最多 64 字符），变成 `/slash-command` |
| `description`              | string  | 何时使用此技能。Claude 用于自动调用决策                       |
| `argument-hint`            | string  | 自动补全提示（如 `[filename] [format]`）                      |
| `disable-model-invocation` | boolean | 阻止 Claude 自动调用，只能手动 `/name`                        |
| `user-invocable`           | boolean | 设为 `false` 隐藏在 `/` 菜单中，仅作背景知识                  |
| `allowed-tools`            | string  | Claude 可使用的工具（逗号分隔）                               |
| `model`                    | string  | 指定使用的模型（sonnet、opus、haiku）                         |
| `context`                  | string  | 设为 `fork` 在隔离的子代理上下文中运行                        |
| `agent`                    | string  | `context: fork` 时使用的子代理类型                            |
| `hooks`                    | object  | 技能生命周期钩子                                              |
| `once`                     | boolean | 设为 `true` 每个会话只运行一次                                |

## 调用控制

### disable-model-invocation: true

- 你可以调用：是（`/skill-name`）
- Claude 可以调用：否
- 用例：`/deploy`、`/commit` 等有副作用的工作流

### user-invocable: false

- 你可以调用：否
- Claude 可以调用：是
- 用例：背景知识（如 `legacy-system-context`）

### 默认（两者都为 true）

- 你和 Claude 都可以调用

## Context: Fork - 隔离子代理执行

在分叉的子代理上下文中运行技能：

```yaml
---
name: deep-research
description: 深入研究一个主题
context: fork
agent: Explore
---
深入研究 $ARGUMENTS：

1. 使用 Glob 和 Grep 查找相关文件
2. 阅读和分析代码
3. 总结发现，包含具体文件引用
```

**关键点**：

- 技能内容成为子代理的提示
- 无法访问对话历史
- `agent` 字段决定执行环境（模型、工具、权限）
- 可用代理：`Explore`、`Plan`、`general-purpose` 或自定义 `.claude/agents/`

## 动态上下文注入

使用 `` !`command` `` 语法在技能执行前运行 shell 命令：

```yaml
---
name: pr-summary
description: 总结 Pull Request 的变更
context: fork
agent: Explore
---

## PR 上下文
- PR diff: !`gh pr diff`
- PR 评论: !`gh pr view --comments`
- 变更文件: !`gh pr diff --name-only`

## 任务
总结这个 Pull Request...
```

**注意**：这是预处理 - 命令在 Claude 看到技能**之前**执行。

## 字符串替换

技能内容中可用的变量：

| 变量                   | 说明                 |
| ---------------------- | -------------------- |
| `$ARGUMENTS`           | 调用时传递的所有参数 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID          |

## 技能中的 Hooks

技能支持生命周期钩子（作用域限定于该技能）：

```yaml
---
name: secure-ops
description: 带安全检查的操作
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

支持的事件：`PreToolUse`、`PostToolUse`、`Stop`

## 工具限制

限制 Claude 的工具访问：

```yaml
---
name: safe-reader
description: 只读文件，不做修改
allowed-tools: Read, Grep, Glob
---
```

## 深度思考（Ultrathink）

在技能内容中包含 "ultrathink" 触发扩展思考：

```yaml
---
name: deep-analysis
description: 使用扩展思考进行深度分析
---
使用 ultrathink 模式，分析...
```

## 最佳实践

1. **保持 SKILL.md 聚焦** - 详细参考移到单独文件（< 500 行）
2. **写具体的描述** - Claude 用于自动调用决策
3. **有副作用时使用 `disable-model-invocation: true`** - 防止意外执行
4. **引用支持文件** - 告诉 Claude 每个文件包含什么以及何时加载
5. **用 `/skill-name` 测试** - 在依赖自动调用前验证行为

## 技能热重载

修改 `.claude/skills/` 中的技能后**立即生效**，无需重启会话。

## 故障排查

| 问题       | 解决方案                                                               |
| ---------- | ---------------------------------------------------------------------- |
| 技能不触发 | 检查描述关键词，用 `/skill-name` 直接调用验证                          |
| 触发太频繁 | 使描述更具体，添加 `disable-model-invocation: true`                    |
| 技能不可见 | 检查字符预算：`SLASH_COMMAND_TOOL_CHAR_BUDGET` 环境变量（默认 15,000） |

## 模板中的技能

| 技能                  | 结构         | 用途                                             |
| --------------------- | ------------ | ------------------------------------------------ |
| `security-review`     | 单文件       | 安全审查检查清单                                 |
| `backend-patterns`    | 主+子(5语言) | 后端开发模式（Python, TypeScript, Java, Go, C#） |
| `frontend-patterns`   | 主+子(4框架) | 前端开发模式（Vue, React, Svelte, Angular）      |
| `devops-patterns`     | 主+子(2平台) | DevOps 模式（Docker, CI/CD）                     |
| `api-development`     | 单文件       | RESTful API 设计                                 |
| `database-patterns`   | 单文件       | 数据库设计和优化                                 |
| `tdd-workflow`        | 单文件       | 测试驱动开发                                     |
| `debugging`           | 单文件       | 系统化调试方法                                   |
| `git-workflow`        | 单文件       | Git 工作流最佳实践                               |
| `continuous-learning` | 主+脚本      | 会话评估和知识提取                               |
| `strategic-compact`   | 主+脚本      | 策略性上下文压缩                                 |
| `isolated-research`   | 单文件(fork) | 🆕 隔离上下文深度研究（不污染主会话）            |
