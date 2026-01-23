# Agents 子代理系统指南

子代理是专门处理特定任务的 AI 助手，拥有独立的上下文窗口、自定义系统提示、特定工具访问和独立权限。

## 为什么使用子代理？

- **保持上下文干净**：复杂任务在子代理中执行，只返回精炼结果
- **强制约束**：限制工具访问和权限
- **复用配置**：定义一次，多次使用
- **控制成本**：为不同任务选择合适的模型

## 目录结构

```
.claude/agents/
├── README.md              # 本文档
├── code-reviewer.md       # 代码审查代理
├── security-reviewer.md   # 安全审查代理
├── code-simplifier.md     # 代码简化代理
├── planner.md             # 规划代理
├── tdd-guide.md           # TDD 指导代理
└── requirement-validator.md # 需求验证代理
```

## Agent Frontmatter 字段

```yaml
---
name: my-agent
description: 代理描述，说明何时委托给此代理
tools: Read, Glob, Grep, Bash
disallowedTools: Write, Edit
model: sonnet
permissionMode: default
skills:
  - api-conventions
  - error-handling
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---
代理指令内容...
```

### 字段说明

| 字段              | 必需 | 说明                                                     |
| ----------------- | ---- | -------------------------------------------------------- |
| `name`            | 是   | 唯一标识符（小写字母和连字符）                           |
| `description`     | 是   | 何时委托给此代理。Claude 用于决策                        |
| `tools`           | 否   | 代理可使用的工具；省略则继承所有                         |
| `disallowedTools` | 否   | 禁止的工具                                               |
| `model`           | 否   | 使用的模型：`sonnet`、`opus`、`haiku`、`inherit`（默认） |
| `permissionMode`  | 否   | 权限模式（见下方）                                       |
| `skills`          | 否   | 预加载到代理上下文的技能                                 |
| `hooks`           | 否   | 作用域限定于此代理的生命周期钩子                         |

## 权限模式

| 模式                | 行为                         |
| ------------------- | ---------------------------- |
| `default`           | 标准权限检查，有提示         |
| `acceptEdits`       | 自动接受文件编辑             |
| `dontAsk`           | 自动拒绝权限提示             |
| `bypassPermissions` | 跳过所有权限检查（谨慎使用） |
| `plan`              | 规划模式（只读探索）         |

## 内置子代理

| 代理              | 模型  | 工具 | 用途                           |
| ----------------- | ----- | ---- | ------------------------------ |
| `Explore`         | Haiku | 只读 | 文件发现、代码搜索、代码库探索 |
| `Plan`            | 继承  | 只读 | 规划模式期间的代码库研究       |
| `general-purpose` | 继承  | 所有 | 需要探索和操作的复杂多步任务   |
| `Bash`            | 继承  | Bash | 在单独上下文中运行终端命令     |

## 工具控制

### 允许特定工具

```yaml
tools: Read, Grep, Glob, Bash
```

### 禁止特定工具

```yaml
disallowedTools: Write, Edit
```

### 使用钩子进行条件验证

```yaml
---
name: db-reader
description: 执行只读数据库查询
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

钩子通过 stdin 接收 JSON：

```json
{
  "tool_input": {
    "command": "SELECT * FROM users"
  }
}
```

退出码 2 阻止操作。

## 技能集成

预加载技能到子代理：

```yaml
---
name: api-developer
description: 按照团队规范实现 API 端点
skills:
  - api-conventions
  - error-handling-patterns
---
实现 API 端点。遵循预加载技能中的规范和模式。
```

**关键点**：

- 完整技能内容注入到子代理上下文（不只是可用）
- 子代理不继承父对话的技能
- 必须显式列出技能

## 子代理中的 Hooks

### 代理级别钩子（Frontmatter）

仅在该代理活跃时运行：

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
  Stop:
    - type: command
      command: "./scripts/cleanup.sh"
```

### 项目级别钩子（settings.json）

响应子代理生命周期事件：

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [{ "type": "command", "command": "./scripts/setup-db.sh" }]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "db-agent",
        "hooks": [{ "type": "command", "command": "./scripts/cleanup-db.sh" }]
      }
    ]
  }
}
```

## 执行模式

### 前台（阻塞）

- 阻塞主对话直到完成
- 权限提示传递给用户
- MCP 工具可用

### 后台（并发）

- 与主对话并行运行
- 继承父级的预批准权限
- 自动拒绝未批准的操作
- MCP 工具**不可用**
- 如果权限失败可以恢复到前台

**触发后台运行**：

- 请求 Claude："在后台运行"
- 任务运行时按 **Ctrl+B**

## 恢复子代理

恢复的子代理保留完整对话历史、工具调用和推理：

```
用户: 使用 code-reviewer 子代理审查认证模块
[代理完成]

用户: 继续那个代码审查，现在分析授权逻辑
[Claude 恢复相同子代理，保留上下文]
```

## 何时使用子代理

**使用主对话**：

- 需要频繁来回交互的任务
- 共享大量上下文的多阶段任务
- 快速、针对性的修改
- 延迟敏感场景

**使用子代理**：

- 产生大量你不需要的输出的任务
- 强制特定工具限制
- 返回摘要的自包含工作
- 隔离高流量操作

**注意**：子代理不能生成其他子代理。

## 模板中的代理

| 代理                    | 模型   | 工具 | 用途               |
| ----------------------- | ------ | ---- | ------------------ |
| `code-reviewer`         | Opus   | 只读 | 深度代码审查       |
| `security-reviewer`     | Opus   | 只读 | 安全漏洞检查       |
| `code-simplifier`       | Sonnet | 读写 | 代码简化和重构     |
| `planner`               | Sonnet | 只读 | 任务规划和分解     |
| `tdd-guide`             | Sonnet | 读写 | TDD 指导和测试编写 |
| `requirement-validator` | Sonnet | 只读 | 需求文档验证       |

## 与官方插件的配合

本地 agents **无需安装任何插件即可独立工作**。安装官方插件后可获得增强功能：

| 本地 Agent              | 官方插件            | 配合策略                                               |
| ----------------------- | ------------------- | ------------------------------------------------------ |
| `code-reviewer`         | `code-review`       | 本地：快速审查、可定制检查项；插件：深度分析、自动触发 |
| `security-reviewer`     | `security-guidance` | 本地：OWASP 清单检查；插件：智能安全分析               |
| `code-simplifier`       | `code-simplifier`   | 功能相似，插件上下文更丰富                             |
| `tdd-guide`             | -                   | 本地独有，无官方对应                                   |
| `planner`               | -                   | 本地独有，无官方对应                                   |
| `requirement-validator` | -                   | 本地独有，无官方对应                                   |

### 使用策略

**未安装插件时**：

- Claude 自动委派本地 agents 执行相应任务
- 功能完整，无需额外配置

**安装插件后**：

- 本地 agent 做快速、即时的检查
- 插件做深度、智能的分析
- 两者结果互补

### 推荐插件配置

在 `.claude/settings.json` 中启用：

```json
{
  "enabledPlugins": {
    "code-review@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true
  }
}
```

详细说明见 `.claude/docs/plugin-integration.md`

## /agents 命令

运行 `/agents` 可以：

- 查看所有子代理（内置、用户、项目、插件）
- 使用引导设置或 Claude 生成创建新代理
- 编辑现有配置和工具访问
- 删除自定义代理
- 查看哪些代理处于活跃状态
