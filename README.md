# Claude Code Best Practices Template

<p align="center">
  <strong>🚀 Clone → Configure → Code</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/xiaobei930/claude-code-best-practices/stargazers"><img src="https://img.shields.io/github/stars/xiaobei930/claude-code-best-practices?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/xiaobei930/claude-code-best-practices/network/members"><img src="https://img.shields.io/github/forks/xiaobei930/claude-code-best-practices?style=social" alt="GitHub forks"></a>
  <a href="https://github.com/xiaobei930/claude-code-best-practices/issues"><img src="https://img.shields.io/github/issues/xiaobei930/claude-code-best-practices" alt="GitHub issues"></a>
  <img src="https://img.shields.io/badge/Claude%20Code-Ready-blueviolet" alt="Claude Code Ready">
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#中文">中文</a> | <a href="FAQ.md">FAQ</a> | <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## English

> **Clone this template and start coding with Claude in minutes, not hours.**

A comprehensive Claude Code configuration template for development teams. Supports **Python / Vue / TypeScript / C++ / Java / C# / Go** with built-in workflows, hooks, and multi-language coding standards.

### Why This Template?

| Without Template | With Template |
|------------------|---------------|
| ❌ Configure from scratch | ✅ Pre-configured, ready to use |
| ❌ Inconsistent code style | ✅ Enforced coding standards |
| ❌ Manual workflow | ✅ Role-based automation (PM→Dev→QA) |
| ❌ Risk of dangerous commands | ✅ Safety hooks protect your system |
| ❌ Context lost between sessions | ✅ Memory bank persists progress |

### ✨ Features

- **🎭 Role-based Workflow** - PM → Lead → Dev → QA → Commit cycle
- **🔄 Autonomous Iteration** - `/iterate` mode for self-driving development
- **🛡️ Safety Hooks** - Pre-configured guards against dangerous operations
- **📐 Multi-language Rules** - Coding standards for 7+ languages
- **🧠 Memory Bank** - Progress tracking and architecture documentation
- **🔌 MCP Integration** - Ready-to-use MCP server configurations

### Quick Start

```bash
# 1. Clone this template
git clone https://github.com/xiaobei930/claude-code-best-practices.git

# 2. Copy to your project
cp -r claude-code-best-practices/.claude /path/to/your/project/
cp claude-code-best-practices/CLAUDE.md /path/to/your/project/

# 3. Initialize
cd /path/to/your/project
bash .claude/scripts/init.sh

# 4. Customize CLAUDE.md (replace placeholders)
# {{PROJECT_NAME}}, {{DATE}}, {{PROJECT_DESCRIPTION}}

# 5. Start developing
/pm   # Begin first requirement
```

### Workflow Commands

| Command | Role | Description |
|---------|------|-------------|
| `/pm` | Product Manager | Requirement analysis |
| `/lead` | Tech Lead | Technical design & task breakdown |
| `/dev` | Developer | Implementation |
| `/qa` | QA Engineer | Testing & verification |
| `/commit` | - | Git commit |
| `/iterate` | - | Autonomous iteration loop |
| `/pair` | - | Pair programming mode |

### Project Structure

```
your-project/
├── CLAUDE.md                 # Project constitution
├── memory-bank/              # Progress & architecture docs
└── .claude/
    ├── commands/             # Slash commands (30+)
    ├── rules/                # Coding standards (13 files)
    ├── skills/               # Development skills (10 categories)
    ├── agents/               # Sub-agents (6 types)
    ├── hooks/                # Hook documentation
    └── scripts/              # Automation scripts
```

### Supported Languages

| Language | Style Guide | Formatter | Test Framework |
|----------|-------------|-----------|----------------|
| Python | `code-style.md` | Black + isort | pytest |
| Vue/TS/JS | `frontend-style.md` | Prettier | Vitest |
| C++ | `cpp-style.md` | clang-format | Google Test |
| Java | `java-style.md` | google-java-format | JUnit |
| C# | `csharp-style.md` | dotnet format | xUnit/NUnit |
| Go | `backend-patterns/go.md` | gofmt | testing |

### Workflow

```mermaid
flowchart LR
    PM["/pm<br/>Requirements"] --> Clarify["/clarify<br/>Clarify"]
    Clarify --> Lead["/lead<br/>Design"]
    Lead --> Designer["/designer<br/>UI Design"]
    Designer --> Dev["/dev<br/>Implement"]
    Dev --> QA["/qa<br/>Verify"]
    QA --> Commit["/commit<br/>Commit"]
    Commit --> Clear["/clear<br/>Clear"]
    Clear -.->|Loop| PM
```

### Philosophy

This template follows the **"道法术器" (Dao-Fa-Shu-Qi)** methodology:
- **道 (Dao)** - Core principles and philosophy
- **法 (Fa)** - Methods and workflows
- **术 (Shu)** - Practices and techniques
- **器 (Qi)** - Tools and configurations

### Note

This template is primarily designed for **Chinese-speaking developers**. Most internal documentation (rules, commands, skills) is written in Chinese. International users are welcome to use and adapt it, or contribute English translations.

### License

MIT License - Feel free to use and modify.

---

## 中文

> **Clone 即用，几分钟而非几小时内开始与 Claude 协作编程。**

这是一个可复制到任意项目的 Claude Code 配置模板，支持 **Python / Vue / TypeScript / C++ / Java / C# / Go** 多语言开发。

### 为什么使用这个模板？

| 没有模板 | 使用模板 |
|----------|----------|
| ❌ 从零配置 | ✅ 开箱即用 |
| ❌ 代码风格不一致 | ✅ 强制执行编码规范 |
| ❌ 手动工作流 | ✅ 角色化自动化（PM→Dev→QA） |
| ❌ 危险命令风险 | ✅ 安全钩子保护系统 |
| ❌ 会话间上下文丢失 | ✅ 记忆库持久化进度 |

**快速导航**: [特性](#-特性) | [快速使用](#快速使用) | [目录结构](#目录结构) | [工作流程](#工作流程) | [技能说明](#技能skills说明) | [自定义](#自定义) | [最佳实践](#最佳实践)

### ✨ 特性

- **🎭 角色化工作流** - PM → Lead → Dev → QA → Commit 循环
- **🔄 自主迭代模式** - `/iterate` 模式实现自驱动开发
- **🛡️ 安全钩子** - 预配置的危险操作防护
- **📐 多语言规则** - 7+ 种语言的编码规范
- **🧠 记忆库** - 进度跟踪和架构文档
- **🔌 MCP 集成** - 开箱即用的 MCP 服务器配置

### 快速使用

#### 1. 复制配置到你的项目

```bash
# 复制整个模板内容到目标项目
cp -r claude-code-best-practices/* /path/to/your/project/

# 或者使用 robocopy (Windows)
robocopy claude-code-best-practices /path/to/your/project /E
```

#### 2. 运行初始化（二选一）

**方式 A：使用初始化脚本（推荐）**
```bash
cd /path/to/your/project
bash .claude/scripts/init.sh
```

**方式 B：使用 /setup 命令**
```
/setup
```

初始化脚本会自动：
- 创建 `settings.local.json`（从 `.example` 复制）
- 创建 `memory-bank/` 目录和基础文件
- 创建 `docs/` 目录结构

#### 3. 自定义 CLAUDE.md

编辑 `CLAUDE.md`，替换以下占位符：
- `{{PROJECT_NAME}}` - 项目名称
- `{{PROJECT_DESCRIPTION}}` - 项目描述
- `{{DATE}}` - 当前日期
- `{{CURRENT_PHASE}}` - 当前阶段

#### 4. 验证配置（可选）

```bash
python .claude/scripts/test_template.py
```

#### 5. 开始开发

```bash
/pm   # 开始第一个需求
```

### 目录结构

```
your-project/
├── CLAUDE.md                   # 项目宪法（必须）
├── memory-bank/                # 项目记忆库（progress/architecture/tech-stack）
└── .claude/
    ├── commands/               # Slash 命令（30+）
    ├── rules/                  # 编码规范（13 个文件）
    ├── skills/                 # 开发技能（10 类）
    ├── agents/                 # 子智能体（6 个）
    ├── scripts/                # Hook 脚本
    └── mcp-configs/            # MCP 配置参考
```

<details>
<summary>📂 完整目录结构（点击展开）</summary>

```
your-project/
├── CLAUDE.md                   # 项目主文档（必须）
├── CLAUDE.local.md             # 个人本地配置（可选，不提交）
│
├── memory-bank/                # 项目记忆库
│   ├── progress.md             # 进度跟踪
│   ├── architecture.md         # 架构文档
│   └── tech-stack.md           # 技术选型
│
└── .claude/
    ├── settings.json           # 基础权限（提交到 Git）
    ├── settings.local.json     # 本地权限 + Hooks（不提交）
    │
    ├── commands/               # Slash 命令
    │   ├── pm.md, lead.md, dev.md, qa.md   # 角色命令
    │   ├── iterate.md, pair.md             # 模式命令
    │   └── build.md, test.md, commit.md... # 工具命令
    │
    ├── rules/                  # 代码规则（按文件类型自动应用）
    │   ├── methodology.md      # 开发方法论
    │   ├── code-style.md       # Python 风格
    │   ├── frontend-style.md   # Vue/TS/JS 风格
    │   ├── cpp-style.md        # C++ 风格
    │   ├── java-style.md       # Java 风格
    │   ├── csharp-style.md     # C# 风格
    │   └── security.md, testing.md, git-workflow.md...
    │
    ├── skills/                 # 自定义技能
    │   ├── backend-patterns/   # 后端模式（Python/TS/Java/Go/C#）
    │   ├── frontend-patterns/  # 前端模式（Vue/React）
    │   ├── tdd-workflow/       # 测试驱动开发
    │   ├── api-development/    # API 开发
    │   └── debugging/, git-workflow/, ...
    │
    ├── agents/                 # 子智能体
    │   ├── code-reviewer.md, code-simplifier.md
    │   ├── planner.md, security-reviewer.md
    │   └── tdd-guide.md, requirement-validator.md
    │
    ├── scripts/                # Hook 脚本
    │   ├── init.sh             # 初始化
    │   ├── format_file.py      # 自动格式化
    │   ├── validate_command.py # 命令验证
    │   └── protect_files.py, session_check.py...
    │
    └── mcp-configs/            # MCP 服务器配置参考
```

</details>

### 支持的语言

| 语言 | 规则文件 | 格式化工具 | 测试框架 |
|------|----------|------------|----------|
| Python | `code-style.md` | Black + isort | pytest |
| Vue/TS/JS | `frontend-style.md` | Prettier | Vitest |
| C++ | `cpp-style.md` | clang-format | Google Test |
| Java | `java-style.md` | google-java-format | JUnit |
| C# | `csharp-style.md` | dotnet format | xUnit/NUnit |
| Go | `backend-patterns/go.md` | gofmt | testing |

### 工作流程

```mermaid
flowchart LR
    PM["/pm<br/>需求分析"] --> Clarify["/clarify<br/>澄清（如需）"]
    Clarify --> Lead["/lead<br/>技术方案"]
    Lead --> Designer["/designer<br/>UI 设计"]
    Designer --> Dev["/dev<br/>编码实现"]
    Dev --> QA["/qa<br/>功能验证"]
    QA --> Commit["/commit<br/>代码提交"]
    Commit --> Clear["/clear<br/>清除上下文"]
    Clear -.->|循环| PM
```

**开发模式**:
- `/iterate` - 自主迭代循环（单 session，完全自主）
- `/pair` - 结对编程模式（人机协作，每步确认）
- `/ralph-loop` - 长时间循环（需安装插件，见 `.claude/ralph-prompts/`）

#### 模式选择指南

| 场景 | 推荐模式 |
|------|----------|
| 任务清单明确，单 session 内执行 | `/iterate` |
| 学习新技术、设计讨论、敏感操作 | `/pair` |
| 长时间批量任务（小时级） | `/ralph-loop` |

### 技能（Skills）说明

模板包含多个开发技能，可按需启用：

| 技能 | 用途 | 主要内容 |
|------|------|----------|
| `backend-patterns` | 后端开发 | 通用模式 + 多语言子文件（Python/TS/Java/Go/C#） |
| `frontend-patterns` | 前端开发 | 通用模式 + 多框架子文件（Vue/React） |
| `tdd-workflow` | 测试驱动开发 | Red-Green-Refactor 循环 |
| `security-review` | 安全审查 | OWASP 检查清单、漏洞防护 |
| `api-development` | API 开发 | RESTful 设计、响应格式、认证 |
| `database-patterns` | 数据库设计 | 命名规范、查询优化、迁移管理 |
| `debugging` | 系统化调试 | 问题定位、日志分析、性能剖析 |
| `git-workflow` | Git 工作流 | 分支策略、提交规范、冲突解决 |
| `continuous-learning` | 持续学习 | 会话评估、知识提取、模式记录 |
| `strategic-compact` | 策略性压缩 | 压缩时机、压缩清单、最佳实践 |

#### 技能结构说明

`backend-patterns` 和 `frontend-patterns` 采用 **主文件 + 语言/框架子文件** 的结构：

- **SKILL.md**: 通用模式和清单（自动加载）
- **语言子文件**: 按项目技术栈按需加载（如 `python.md`、`vue.md`）

这种结构的好处：
1. 减少重复内容
2. 按需加载，减少 token 消耗
3. 方便扩展新语言/框架

### 自定义

#### 添加新规则

1. 在 `.claude/rules/` 创建 `your-rule.md`
2. 使用 YAML frontmatter 指定匹配路径：

```yaml
---
paths:
  - "**/*.your-ext"
---

# 规则内容
```

#### 添加新命令

1. 在 `.claude/commands/` 创建 `your-command.md`
2. 定义命令行为和输出格式
3. 使用 `/your-command` 调用

#### 配置 Hooks

编辑 `.claude/settings.local.json`，模板预配置的 Hooks 包括：

| Hook 类型 | 触发器 | 功能 | 脚本 |
|-----------|--------|------|------|
| PreToolUse | `Bash` | 验证危险命令 | `validate_command.py` |
| PreToolUse | `Bash` | Git push 前确认 | `pause_before_push.sh` |
| PreToolUse | `Write\|Edit` | 保护敏感文件 | `protect_files.py` |
| PreToolUse | `Write` | 阻止随机 .md 文件 | `block_random_md.py` |
| PreToolUse | `Edit\|Write` | 策略性压缩建议 | `suggest-compact.sh` |
| PostToolUse | `Write\|Edit` | 自动格式化代码 | `format_file.py` |
| PostToolUse | `Edit` | 检查 console.log | `check_console_log.py` |
| PostToolUse | `Edit\|Write` | TypeScript 类型检查 | `typescript_check.sh` |
| SessionStart | `*` | 会话健康检查 | `session_check.py` |
| SessionStart | `*` | 加载上次会话上下文 | `session_start.sh` |
| PreCompact | `*` | 压缩前保存状态 | `pre_compact.sh` |
| Stop | `*` | 会话结束持久化 | `session_end.sh` |
| Stop | `*` | 持续学习评估 | `evaluate-session.sh` |

### 最佳实践

1. **CLAUDE.md 保持简洁** - 控制在 100 行以内
2. **使用规则文件** - 详细规范放在 `.claude/rules/`
3. **更新 progress.md** - 每次任务完成后更新
4. **上下文管理**:
   - 普通模式：频繁 `/clear`，避免上下文过长
   - `/iterate` 模式：不主动 clear，保持循环连续性
5. **MCP 不要贪多** - 同时启用不超过 10 个

### 参考

**官方资源**:
- [Anthropic 官方最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices)
- [CLAUDE.md 完整指南](https://www.builder.io/blog/claude-md-guide)

**社区项目**:
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Comprehensive Claude Code resources
- [vibe-coding-cn](https://github.com/2025Emma/vibe-coding-cn) - 中文 Vibe Coding 指南

### 许可证

MIT License - 可自由使用和修改

---

## Contributing / 参与贡献

We welcome contributions of all kinds! 我们欢迎各种形式的贡献！

### Ways to Contribute / 贡献方式

| Type | Description |
|------|-------------|
| ⭐ **Star** | Show your support / 表示支持 |
| 🐛 **Bug Report** | [Report issues](../../issues/new?template=bug_report.md) / 报告问题 |
| 💡 **Feature Request** | [Suggest features](../../issues/new?template=feature_request.md) / 建议功能 |
| 📝 **Documentation** | Improve docs / 改进文档 |
| 🌐 **Translation** | Add English translations / 添加英文翻译 |
| 🔧 **Code** | Add commands, rules, skills / 添加命令、规则、技能 |

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

详细指南请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

### Community / 社区

- [Discussions](../../discussions) - Ask questions, share ideas / 提问交流
- [Issues](../../issues) - Report bugs, request features / 报告问题

---

**If you find this template useful, please give it a ⭐ star!**

**如果你觉得这个模板有用，请给它一个 ⭐ Star！**
