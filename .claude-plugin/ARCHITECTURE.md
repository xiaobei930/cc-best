# CC-Best Architecture | 架构文档

> Version: 0.6.3 | Last Updated: 2026-02-10

本文档描述 CC-Best 插件的完整架构、组件关系和调用链路。

---

## 1. 组件概览 | Component Overview

| 组件         | 数量  | 位置                  | 触发方式                           |
| ------------ | ----- | --------------------- | ---------------------------------- |
| **Commands** | 38    | `commands/`           | 用户输入 `/xxx`                    |
| **Skills**   | 17    | `skills/`             | Agent 预加载 / 自动注入            |
| **Agents**   | 8     | `agents/`             | Task tool 委派                     |
| **Rules**    | 33    | `rules/`              | 路径匹配自动注入 (8 目录分层)      |
| **Hooks**    | 18/17 | `scripts/node/hooks/` | 生命周期自动触发 (18 脚本/17 配置) |

---

## 2. 完整架构图 | Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Commands (38)                          │
│  角色: pm, clarify, lead, designer, dev, qa, verify         │
│  工具: build, test, run, status, commit, compact...         │
│  模式: iterate, pair, cc-ralph, mode                        │
│  知识: learn, analyze, evolve                               │
│  新增: fix-issue, release, service                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ 调用
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       Agents (8)                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ code-reviewer   │  │ code-simplifier │                   │
│  └─────────────────┘  └─────────────────┘                   │
│  ┌─────────────────┐  ┌───────────────────────┐             │
│  │ planner         │  │ requirement-validator │             │
│  └─────────────────┘  └───────────────────────┘             │
│  ┌────────────────────────┐  ┌────────────────────────┐     │
│  │ security-reviewer      │  │ tdd-guide              │     │
│  │   └──▶ skill:security │  │   └──▶ skill:testing  │     │
│  └────────────────────────┘  └────────────────────────┘     │
│  ┌────────────────────────┐  ┌────────────────────────┐     │
│  │ build-error-resolver   │  │ architect              │     │
│  │   └──▶ skill:debug    │  │   └──▶ skill:arch     │     │
│  └────────────────────────┘  └────────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │ 预加载
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       Skills (17)                           │
│  开发: api, architecture, backend(5), frontend(4), database │
│  测试: testing (tdd, e2e)                                   │
│  质量: quality → security, debug                            │
│  会话: session → learning, compact                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ 触发
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hooks (18 脚本/17 配置)                     │
│  SessionStart      → session-check                          │
│  UserPromptSubmit  → user-prompt-submit                     │
│  PreToolUse        → validate-command, pause-before-push,   │
│                      check-secrets, protect-files,          │
│                      long-running-warning                   │
│  PostToolUse       → format-file, auto-archive,             │
│                      observe-patterns, suggest-compact,     │
│                      check-console-log, typescript-check    │
│  Stop              → stop-check                             │
│  SubagentStop      → subagent-stop                          │
│  PreCompact        → pre-compact                            │
│  SessionEnd        → evaluate-session                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 工作流架构 | Workflow Architecture

```
用户需求
    ↓
/cc-best:pm (产品经理)
    ↓
    ├─ agent: requirement-validator (需求验证)
    ↓
/cc-best:clarify (澄清)
    ↓
/cc-best:lead (研发经理)
    ├─ agent: architect (架构设计) ← NEW
    ├─ agent: planner (任务规划)
    ↓
    ├─→ /cc-best:designer (UI/UX 设计)
    │
    ├─→ /cc-best:dev (开发)
    │   ├─ agent: tdd-guide + skills: testing
    │   ├─ agent: code-simplifier
    │   └─ agent: code-reviewer
    │
    └─→ /cc-best:qa (质量保证)
        └─ agent: code-reviewer

/cc-best:build (构建)
    └─ agent: build-error-resolver + skills: debug ← NEW

/cc-best:verify (最终验证)
    └─ agent: security-reviewer + skills: security
```

---

## 4. Commands → Agents/Skills 引用关系

| Command              | Agent(s)                                  | Skills       | 用途                     |
| -------------------- | ----------------------------------------- | ------------ | ------------------------ |
| `/cc-best:pm`        | requirement-validator                     | -            | 需求文档质量验证         |
| `/cc-best:clarify`   | (可选)                                    | -            | 需求澄清                 |
| `/cc-best:lead`      | architect, planner                        | architecture | 架构设计和任务规划       |
| `/cc-best:designer`  | -                                         | -            | UI/UX 设计               |
| `/cc-best:dev`       | tdd-guide, code-simplifier, code-reviewer | -            | 开发实现                 |
| `/cc-best:build`     | build-error-resolver                      | debug        | 构建错误修复             |
| `/cc-best:qa`        | code-reviewer                             | -            | 代码审查                 |
| `/cc-best:verify`    | security-reviewer                         | security     | 安全审查                 |
| `/cc-best:fix`       | build-error-resolver                      | debug        | 修复编译/类型错误        |
| `/cc-best:learn`     | -                                         | learning     | 会话知识提取             |
| `/cc-best:analyze`   | -                                         | learning     | 代码库模式分析           |
| `/cc-best:evolve`    | -                                         | learning     | 知识演化为 skills/agents |
| `/cc-best:fix-issue` | tdd-guide, build-error-resolver           | exploration  | GitHub Issue 端到端修复  |
| `/cc-best:release`   | -                                         | -            | 版本发布管理             |
| `/cc-best:service`   | -                                         | -            | 开发服务管理             |

---

## 5. Agents → Skills 预加载关系

| Agent                 | 预加载 Skills                                                          | 说明                                    |
| --------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| security-reviewer     | `security` `quality` `exploration`                                     | OWASP 安全检查 + 代码质量 + 探索        |
| tdd-guide             | `testing` `security`                                                   | TDD 工作流 + 安全测试                   |
| build-error-resolver  | `debug` `devops` `testing` `exploration`                               | 构建诊断 + CI/CD + 测试 + 探索          |
| architect             | `architecture` `exploration` `api` `database`                          | 架构 + 探索 + API + 数据库              |
| code-reviewer         | `security` `quality` `architecture` `testing` `exploration` `learning` | 安全 + 质量 + 架构 + 测试 + 探索 + 学习 |
| code-simplifier       | `quality` `architecture`                                               | 质量 + 架构感知简化                     |
| planner               | `architecture` `exploration`                                           | 任务分解 + 代码库探索                   |
| requirement-validator | `architecture`                                                         | 需求验证时参考架构                      |

### 调用链可视化 | Call Chain Visualization

```
Commands (角色)              Agents                      Skills
────────────────────────────────────────────────────────────────────
/cc-best:pm ──────────────► requirement-validator ─────► architecture
       ↓
/cc-best:clarify ─────────► [requirement-validator]────► (可选调用)
       ↓
/cc-best:lead ────────────► architect ─────────────────► architecture, exploration, api, database
                         └► planner ──────────────────► architecture, exploration
       ↓
/cc-best:designer ────────► [code-reviewer]────────────► (可选调用)
       ↓
/cc-best:designer ────────► (frontend-design Skill)────► frontend
       ↓
/cc-best:dev ─────────────► tdd-guide ─────────────────► testing, security
                         ├► code-simplifier ───────────► quality, architecture
                         └► code-reviewer ─────────────► security, quality, architecture, testing, exploration, learning
       ↓
/cc-best:qa ──────────────► code-reviewer ─────────────► security, quality, architecture, testing, exploration, learning
       ↓
/cc-best:verify ──────────► security-reviewer ─────────► security, quality, exploration
       ↓
/cc-best:build|fix ───────► build-error-resolver ──────► debug, devops, testing, exploration
       ↓
/cc-best:fix-issue ───────► tdd-guide + build-error-resolver ► exploration, testing
```

---

## 6. Skills 层级结构 | Skills Hierarchy

```
Skills (17)
├── 开发技能 (10)
│   ├── api              # RESTful API 设计
│   ├── architecture     # 架构设计 (ADR)
│   ├── backend          # 后端 (Python, TS, Java, Go, C#)
│   ├── database         # 数据库 (MySQL, PostgreSQL, Oracle, SQLite)
│   ├── devops           # DevOps (Docker, CI/CD)
│   ├── frontend         # 前端 (React, Vue, Angular, Svelte)
│   ├── git              # Git 工作流
│   ├── native           # 原生开发 (iOS/macOS)
│   ├── second-opinion   # 多模型验证
│   └── exploration      # 代码库探索
│
├── 测试技能 (1)
│   └── testing          # TDD, E2E, 框架配置
│
├── 质量技能 (父子结构)
│   └── quality (父)
│       ├── security (子) → 被 security-reviewer 预加载
│       └── debug (子)
│
└── 会话技能 (父子结构)
    └── session (父)
        ├── learning (子) → 模式提取
        └── compact (子)  → 上下文压缩
```

---

## 7. Hooks 生命周期 | Hooks Lifecycle

```
Session 生命周期:
┌─ SessionStart
│  └─ session-check.js       [验证项目状态]
│
├─ UserPromptSubmit
│  └─ user-prompt-submit.js  [注入项目上下文]
│
├─ PreToolUse
│  ├─ validate-command.js     (Bash)       [验证命令安全]
│  ├─ pause-before-push.js    (Bash)       [推送前确认+force阻止]
│  ├─ check-secrets.js        (Bash)       [密钥泄露检测 30+提供商]
│  ├─ protect-files.js        (Write|Edit) [保护重要文件]
│  └─ long-running-warning.js (Bash)       [长运行预警]
│
├─ PostToolUse
│  ├─ format-file.js       (Write|Edit)      [代码格式化]
│  ├─ auto-archive.js      (Write|Edit)      [自动存档]
│  ├─ observe-patterns.js  (Write|Edit|Bash) [模式观察]
│  ├─ suggest-compact.js   (.*)              [建议压缩]
│  ├─ check-console-log.js (Write|Edit)      [检查调试日志]
│  └─ typescript-check.js  (Write|Edit)      [TS 类型检查]
│
├─ Stop
│  └─ stop-check.js          [遗漏任务检查]
│
├─ SubagentStop
│  └─ subagent-stop.js       [子代理状态记录]
│
├─ PreCompact
│  └─ pre-compact.js         [压缩前状态保存]
│
└─ SessionEnd
   └─ evaluate-session.js    [学习提取]
```

---

## 8. 配置文件关系 | Configuration Files

```
.claude-plugin/
├── plugin.json          # 插件清单 (name, version, paths)
└── marketplace.json     # 市场元数据

.claude/
├── settings.json        # 共享配置 (提交到 Git)
├── settings.local.json  # 本地配置 + Hooks (不提交)
└── mcp-configs/         # MCP 服务器配置

hooks/
└── hooks.json           # 插件 Hooks 配置
```

---

## 9. 版本一致性 | Version Consistency

所有配置文件中的版本号必须一致：

| 文件                              | 字段         |
| --------------------------------- | ------------ |
| `.claude-plugin/plugin.json`      | `version`    |
| `.claude-plugin/marketplace.json` | `version`    |
| `CLAUDE.md`                       | 头部 Version |
| `CHANGELOG.md`                    | 最新条目     |

当前版本: **0.6.3**

---

## 10. 扩展指南 | Extension Guide

### 添加新 Command

1. 创建 `commands/your-command.md`
2. 添加 frontmatter（官方支持字段）：
   ```yaml
   ---
   description: 命令描述，简要说明用途
   allowed-tools: Read, Write, Edit, Bash, ...
   argument-hint: [可选] 参数提示
   ---
   ```
3. 在 body 中使用自然语言描述调用流程（包括委派 agents）
4. 定义职责和执行步骤

### 添加新 Skill

1. 创建 `skills/your-skill/SKILL.md`
2. 添加子文件（如语言特定规范）
3. 可选：在 Agent 中预加载

### 添加新 Agent

1. 创建 `agents/your-agent.md`
2. 添加 frontmatter（官方支持字段）：
   ```yaml
   ---
   name: your-agent
   description: 代理描述
   model: sonnet | opus | haiku
   tools: Read, Grep, Glob, ...
   skills: [skill-name] # 可选，预加载 skills
   color: red | blue | green | ... # 可选，UI 颜色
   ---
   ```
3. 在相关 Command body 中用自然语言引用

### 添加新 Hook

1. 创建脚本 `scripts/node/hooks/your-hook.js`
2. 在 `.claude/settings.local.json` 中注册
3. 指定触发条件 (`matcher`)

### 何时使用 Subagent

**Subagent** 是独立上下文的专业化代理，支持并发执行。

**适用场景**：

- 真正独立的并行任务（无相互依赖）
- 需要上下文隔离（如敏感操作）
- 任务间无信息共享需求

**不适用场景**（当前 agent 设计已覆盖）：

- 检查结果相互关联（如代码审查的安全/质量/架构检查）
- 顺序工作流（如 TDD 的 红→绿→重构）
- 失败诊断需要完整上下文

**创建方式**（如需要）：

```yaml
---
name: style-checker
description: "独立的代码风格检查，可与其他检查并发运行"
tools: Read, Grep, Glob
---
```

---

## 11. Agent 相互调用关系 | Agent Interactions

### 调用关系图

```
                    ┌───────────────────────┐
                    │ requirement-validator │
                    │  └──▶ architecture    │
                    └───────────┬───────────┘
                                │ 需求验证后
                                ▼
                    ┌───────────────────────┐
                    │      architect        │
                    │  └──▶ architecture    │
                    │  └──▶ exploration     │
                    │  └──▶ api             │
                    └───────────┬───────────┘
                                │ 架构确定后
                                ▼
                    ┌───────────────────────┐
                    │       planner         │
                    │  └──▶ architecture    │
                    │  └──▶ exploration     │
                    └───────────┬───────────┘
                                │ 任务分解后
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────────┐  ┌────────────────┐
        │ tdd-guide │   │code-simplifier│  │ code-reviewer  │
        └─────┬─────┘   └───────┬───────┘  └───────┬────────┘
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │ 构建失败时
                                ▼
                    ┌───────────────────────┐
                    │  build-error-resolver │
                    │  └──▶ debug           │
                    └───────────┬───────────┘
                                │ 修复后
                                ▼
                    ┌───────────────────────┐
                    │   security-reviewer   │
                    │   └──▶ security       │
                    └───────────────────────┘
```

### Agent 协作模式

| 上游 Agent            | 下游 Agent           | 协作场景               |
| --------------------- | -------------------- | ---------------------- |
| requirement-validator | architect            | 需求明确后架构设计     |
| architect             | planner              | 架构确定后任务分解     |
| planner               | tdd-guide            | 任务分解后 TDD 开发    |
| tdd-guide             | code-reviewer        | 代码完成后审查         |
| code-reviewer         | code-simplifier      | 审查后简化重构         |
| code-simplifier       | build-error-resolver | 重构后修复构建错误     |
| build-error-resolver  | code-reviewer        | 修复后再次审查（可选） |
| code-reviewer         | security-reviewer    | 最终安全审查           |

### 并行调用场景

| 触发 Command    | 并行 Agents                       | 场景       |
| --------------- | --------------------------------- | ---------- |
| `/cc-best:dev`  | tdd-guide + code-simplifier       | 开发实现   |
| `/cc-best:qa`   | code-reviewer + security-reviewer | 质量审查   |
| `/cc-best:lead` | architect + planner               | 设计和规划 |

---

## 12. 统计数据 | Statistics

| 类别                 | 数量                                                            |
| -------------------- | --------------------------------------------------------------- |
| Commands             | 38                                                              |
| Skills               | 17                                                              |
| Agents               | 8                                                               |
| Rules                | 33 (8 目录: common/python/frontend/java/csharp/cpp/embedded/ui) |
| Hooks Scripts        | 18 脚本 / 17 已配置                                             |
| Language Support     | 6 (Python, TS, Java, Go, C#, Rust)                              |
| Framework Support    | 8 (React, Vue, Angular, Svelte, FastAPI...)                     |
| Database Support     | 4 (MySQL, PostgreSQL, Oracle, SQLite)                           |
| Total Markdown Lines | ~25,000                                                         |

---

## 13. 官方特性兼容性 | Official Feature Compatibility

> 基于 Claude Code v2.1.31 评估（2026-02-06 更新）

### 已采用特性 | Adopted Features

| 官方特性                | 本仓库实现                  | 状态 |
| ----------------------- | --------------------------- | ---- |
| YAML Frontmatter        | 全部 agents/commands/skills | ✅   |
| Agent `model` 字段      | 8 个 agents                 | ✅   |
| Agent `skills` 预加载   | 8 个 agents                 | ✅   |
| Wildcard Permissions    | `Skill(*)`                  | ✅   |
| `context: fork`         | exploration Skill           | ✅   |
| SessionEnd Lifecycle    | hooks                       | ✅   |
| UserPromptSubmit 事件   | hooks 配置                  | ✅   |
| Stop 事件               | hooks 配置                  | ✅   |
| SubagentStop 事件       | hooks 配置                  | ✅   |
| `${CLAUDE_PLUGIN_ROOT}` | hooks 路径                  | ✅   |

### 兼容但未采用 | Compatible but Not Adopted

| 官方特性          | 说明                      | 计划     |
| ----------------- | ------------------------- | -------- |
| Skill Hot Reload  | 开发时自动重载 skill 文件 | 自动支持 |
| Frontmatter Hooks | 在 YAML 中声明 hooks      | 评估中   |
| Async Hooks       | `async: true` 非阻塞执行  | 部分采用 |
| `$ARGUMENTS` 变量 | 命令参数传递              | v0.6.x   |

### 不适用特性 | Not Applicable

| 官方特性        | 原因                   |
| --------------- | ---------------------- |
| Agent Teams     | 需要高级订阅计划       |
| Remote Sessions | 云端功能，本地插件无需 |

### 模型配置策略 | Model Configuration Strategy

**当前策略: 质量优先**

| 模型   | 使用场景                   | 当前 Agents                                                           |
| ------ | -------------------------- | --------------------------------------------------------------------- |
| opus   | 需要深度理解和创造性的任务 | architect, planner, code-reviewer, code-simplifier, security-reviewer |
| sonnet | 执行性任务和快速响应       | tdd-guide, build-error-resolver, requirement-validator                |

> 模型策略配置（质量/速度/均衡）计划在 v0.6.x 版本实现
