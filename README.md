# Claude Code Best Practices Template

<p align="center">
  <strong>🚀 Clone → Configure → Code</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/xiaobei930/claude-code-best-practices/actions/workflows/validate-template.yml"><img src="https://github.com/xiaobei930/claude-code-best-practices/actions/workflows/validate-template.yml/badge.svg" alt="Validate Template"></a>
  <a href="https://github.com/xiaobei930/claude-code-best-practices/stargazers"><img src="https://img.shields.io/github/stars/xiaobei930/claude-code-best-practices?style=social" alt="GitHub stars"></a>
</p>

<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a>
</p>

---

> **Clone and start coding with Claude in minutes, not hours.**

A comprehensive Claude Code configuration template for development teams. Supports **Python / Vue / TypeScript / C++ / Java / C# / Go** with built-in workflows, hooks, and multi-language coding standards.

## 📑 Table of Contents

- [Why This Template?](#why-this-template)
- [Quick Start](#-quick-start)
- [Core Features](#-core-features)
- [Directory Structure](#-directory-structure)
- [Workflow](#-workflow)
- [Command Reference](#-command-reference)
- [Skills](#-skills)
- [Customization Guide](#-customization-guide)
- [Best Practices](#-best-practices)
- [FAQ](#-faq)
- [Requirements](#-requirements)
- [References](#-references)

---

## Why This Template?

| Without Template | With Template |
|------------------|---------------|
| ❌ Configure Claude Code from scratch | ✅ Ready to use out of the box |
| ❌ Inconsistent code style | ✅ Enforced coding standards |
| ❌ Manual repetitive workflows | ✅ Role-based automation (PM→Dev→QA) |
| ❌ Risk of dangerous commands | ✅ Safety hooks protect your system |
| ❌ Context lost between sessions | ✅ Memory bank persists progress |

---

## 🚀 Quick Start

### 5-Minute Setup

```bash
# 1. Clone the template
git clone https://github.com/xiaobei930/claude-code-best-practices.git my-project
cd my-project

# 2. Run initialization
bash .claude/scripts/init.sh

# 3. Edit CLAUDE.md and replace placeholders
#    {{PROJECT_NAME}} → Your project name
#    {{PROJECT_DESCRIPTION}} → Project description
#    {{DATE}} → Current date

# 4. Start developing
/pm   # Begin with the Product Manager role for your first requirement
```

### Copy to Existing Project

```bash
# Copy configuration files to your project
cp -r claude-code-best-practices/.claude /path/to/your/project/
cp claude-code-best-practices/CLAUDE.md /path/to/your/project/
cp -r claude-code-best-practices/memory-bank /path/to/your/project/

# Navigate to your project and initialize
cd /path/to/your/project
bash .claude/scripts/init.sh
```

> **Windows Users**: Use Git Bash to run scripts, or use `robocopy` to copy files.

**Migrating from an existing project?** See [MIGRATION.md](MIGRATION.md).

---

## ✨ Core Features

### 🎭 Role-Based Workflow
PM → Lead → Dev → QA → Commit complete development cycle, each role with clear responsibilities.

### 🔄 Autonomous Iteration Mode
`/iterate` mode lets Claude autonomously complete task lists without frequent intervention.

### 🛡️ Safety Hooks
Pre-configured guards against dangerous operations: blocks `rm -rf /`, `git push --force`, and other risky commands.

### 📐 Multi-Language Standards
Coding standards for 7+ languages: Python, Vue/TS, C++, Java, C#, Go, and more.

### 🧠 Memory Bank
`memory-bank/` directory persists project progress, architecture decisions, and tech stack choices.

### 🔌 MCP Integration
Ready-to-use MCP server configurations supporting memory, playwright, firecrawl, and more.

---

## 📁 Directory Structure

```
your-project/
├── CLAUDE.md                   # Project constitution (must keep)
├── memory-bank/                # Project memory bank
│   ├── progress.md             # Progress tracking
│   ├── architecture.md         # Architecture documentation
│   └── tech-stack.md           # Technology choices
│
└── .claude/
    ├── settings.json           # Base permissions (commit to Git)
    ├── settings.local.json     # Local config + Hooks (don't commit)
    │
    ├── commands/               # Slash commands (30+)
    │   ├── pm.md, lead.md      # Role commands
    │   ├── iterate.md, pair.md # Mode commands
    │   └── build.md, test.md   # Tool commands
    │
    ├── rules/                  # Coding standards (13 files)
    │   ├── methodology.md      # Development methodology
    │   ├── coding-standards.md # Universal standards
    │   ├── code-style.md       # Python style
    │   ├── frontend-style.md   # Vue/TS/JS style
    │   └── security.md         # Security rules
    │
    ├── skills/                 # Development skills (10 categories)
    │   ├── backend-patterns/   # Backend patterns
    │   ├── frontend-patterns/  # Frontend patterns
    │   └── tdd-workflow/       # TDD workflow
    │
    ├── agents/                 # Sub-agents (6)
    │   ├── code-reviewer.md    # Code review
    │   └── security-reviewer.md# Security review
    │
    └── scripts/                # Automation scripts (15)
        ├── init.sh             # Initialization
        ├── format_file.py      # Auto-formatting
        └── validate_command.py # Command validation
```

---

## 🔄 Workflow

### Standard Development Cycle

```mermaid
flowchart LR
    PM["/pm<br/>Requirements"] --> Clarify["/clarify<br/>Clarify"]
    Clarify --> Lead["/lead<br/>Design"]
    Lead --> Designer["/designer<br/>UI Design"]
    Designer --> Dev["/dev<br/>Implement"]
    Dev --> QA["/qa<br/>Verify"]
    QA --> Commit["/commit<br/>Commit"]
    Commit --> Clear["/clear<br/>Clear Context"]
    Clear -.->|Loop| PM
```

### Three Development Modes

| Mode | Command | Use Case | Characteristics |
|------|---------|----------|-----------------|
| **Autonomous Iteration** | `/iterate` | Clear task list | Fully autonomous, no intervention needed |
| **Pair Programming** | `/pair` | Learning, sensitive operations | Confirm each step, human-machine collaboration |
| **Long-Running Loop** | `/ralph-loop` | Hour-level batch tasks | Requires plugin installation |

---

## 📋 Command Reference

### Role Commands

| Command | Role | Responsibilities |
|---------|------|------------------|
| `/pm` | Product Manager | Requirement analysis, user stories, acceptance criteria |
| `/lead` | Tech Lead | Technical design, task breakdown, architecture decisions |
| `/dev` | Developer | Code implementation, unit tests |
| `/qa` | QA Engineer | Functional verification, test cases |
| `/designer` | UI Designer | Design guidance, interface specifications |
| `/clarify` | Clarification Expert | Requirement clarification, boundary confirmation |

### Mode Commands

| Command | Description |
|---------|-------------|
| `/iterate` | Autonomous iteration loop, reads progress.md and executes tasks automatically |
| `/pair` | Pair programming mode, continues after confirming each key step |

### Tool Commands

| Command | Function |
|---------|----------|
| `/build` | Build project |
| `/test` | Run tests |
| `/run` | Start development server |
| `/commit` | Git commit |
| `/pr` | Create Pull Request |
| `/status` | View project status |
| `/checkpoint` | Create checkpoint |
| `/compact` | Compress context |
| `/context` | Context management |
| `/memory` | Project memory management |
| `/verify` | Verify code quality |
| `/setup` | Project initialization |

---

## 🛠️ Skills

| Skill | Purpose | Key Contents |
|-------|---------|--------------|
| `backend-patterns` | Backend development | Generic patterns + Python/TS/Java/Go/C# subfiles |
| `frontend-patterns` | Frontend development | Generic patterns + Vue/React subfiles |
| `tdd-workflow` | Test-driven development | Red-Green-Refactor cycle |
| `api-development` | API development | RESTful design, response formats, authentication |
| `database-patterns` | Database design | Naming conventions, query optimization, migrations |
| `security-review` | Security review | OWASP checklist, vulnerability protection |
| `debugging` | Systematic debugging | Problem localization, log analysis, profiling |
| `git-workflow` | Git workflow | Branch strategy, commit conventions, conflict resolution |
| `continuous-learning` | Continuous learning | Session evaluation, knowledge extraction |
| `strategic-compact` | Strategic compression | Compression timing, best practices |

---

## ⚙️ Customization Guide

### Adding New Rules

Create a file in `.claude/rules/`:

```markdown
---
paths:
  - "**/*.your-ext"
---

# Rule Title

## Rule Content
...
```

### Adding New Commands

Create a file in `.claude/commands/`:

```markdown
---
allowed_tools:
  - Read
  - Edit
  - Write
  - Bash
---

# /your-command - Command Name

## Responsibilities
...

## Execution Steps
1. ...
2. ...
```

### Configuring Hooks

Edit `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/scripts/your-script.py",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

### Pre-configured Hooks

| Trigger | Function | Script |
|---------|----------|--------|
| PreToolUse | Validate dangerous commands | `validate_command.py` |
| PreToolUse | Confirm before git push | `pause_before_push.sh` |
| PreToolUse | Protect sensitive files | `protect_files.py` |
| PostToolUse | Auto-format code | `format_file.py` |
| PostToolUse | TypeScript type check | `typescript_check.sh` |
| SessionStart | Session health check | `session_check.py` |
| Stop | Session end persistence | `session_end.sh` |

---

## 💡 Best Practices

### 1. Keep CLAUDE.md Concise
- Keep it under 100 lines
- Put detailed specifications in `.claude/rules/`

### 2. Use the Memory Bank
- Update `progress.md` after each task completion
- Record important decisions in `architecture.md`

### 3. Context Management
- Normal mode: Use `/clear` frequently to avoid context overflow
- `/iterate` mode: Don't clear manually, maintain loop continuity

### 4. Don't Overload MCP
- Enable no more than 10 MCP servers per project
- Use `disabledMcpServers` to disable unused ones

### 5. Regular Cleanup
- Delete unused language rules
- Remove unused commands

---

## ❓ FAQ

### Getting Started

<details>
<summary><strong>Q: Can I delete files I don't need?</strong></summary>

Yes! Commonly deletable files:
- `.github/` - If you don't need contribution templates
- `CONTRIBUTING.md`, `CHANGELOG.md`, `FAQ.md` - Template-specific docs
- Unused language rules (e.g., Python projects can delete `cpp-style.md`)

Minimum to keep:
- `CLAUDE.md` - Core configuration
- `.claude/settings.json` - Permission settings
- Language rules you actually use
</details>

<details>
<summary><strong>Q: Do I need to keep the Git history?</strong></summary>

No. For a fresh start:
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit from Claude Code template"
```
</details>

### Hook Issues

<details>
<summary><strong>Q: Hooks not working?</strong></summary>

1. Check if `settings.local.json` exists:
   ```bash
   ls .claude/settings.local.json
   ```
   If not:
   ```bash
   cp .claude/settings.local.json.example .claude/settings.local.json
   ```

2. Check script permissions (Linux/Mac):
   ```bash
   chmod +x .claude/scripts/*.sh
   chmod +x .claude/scripts/*.py
   ```

3. Check Claude Code version - hooks require recent versions
</details>

<details>
<summary><strong>Q: format_file.py encoding error</strong></summary>

Common Windows issue. Solutions:
1. Ensure Python 3.8+ is installed
2. Set environment variable: `PYTHONUTF8=1`
</details>

### Command Issues

<details>
<summary><strong>Q: What's the difference between /iterate and /pair?</strong></summary>

| Mode | Control | Use Case |
|------|---------|----------|
| `/iterate` | Fully autonomous | Clear task list |
| `/pair` | Confirm each step | Learning, sensitive operations |
</details>

<details>
<summary><strong>Q: /iterate stopped unexpectedly</strong></summary>

Check stop conditions:
- User interrupt (Ctrl+C)
- All tasks in `progress.md` completed
- Fatal error occurred
- User decision required

Recovery: Run `/iterate` again
</details>

<details>
<summary><strong>Q: Command not found</strong></summary>

- Confirm file is in `.claude/commands/` directory
- Confirm file extension is `.md`
- Restart Claude Code
</details>

### MCP Issues

<details>
<summary><strong>Q: How to configure MCP servers?</strong></summary>

Edit `.claude/settings.local.json`:
```json
{
  "enabledMcpjsonServers": [
    "memory",
    "sequential-thinking"
  ]
}
```
Then restart Claude Code.
</details>

<details>
<summary><strong>Q: Too many MCP tools causing issues</strong></summary>

Best practice: Enable no more than 10 per project.
```json
{
  "disabledMcpServers": ["github", "vercel"]
}
```
</details>

### Troubleshooting

<details>
<summary><strong>Q: "Permission denied" error</strong></summary>

```bash
# Linux/Mac
chmod +x .claude/scripts/*.sh
chmod +x .claude/scripts/*.py

# Windows: Run as Administrator
```
</details>

<details>
<summary><strong>Q: Rule changes not taking effect</strong></summary>

- Claude Code caches rules at session start
- Restart session or use `/clear` after modifications
</details>

---

## 🔧 Requirements

| Dependency | Version | Notes |
|------------|---------|-------|
| Claude Code | Latest recommended | Hooks require recent versions |
| Python | 3.8+ | For hook scripts |
| Bash/Git Bash | Any version | Windows users: use Git Bash |

### Supported Languages

| Language | Rule File | Formatter | Test Framework |
|----------|-----------|-----------|----------------|
| Python | `code-style.md` | Black + isort | pytest |
| Vue/TS/JS | `frontend-style.md` | Prettier | Vitest |
| C++ | `cpp-style.md` | clang-format | Google Test |
| Java | `java-style.md` | google-java-format | JUnit |
| C# | `csharp-style.md` | dotnet format | xUnit/NUnit |
| Go | `backend-patterns/go.md` | gofmt | testing |

---

## 📚 References

### Official Resources
- [Anthropic Official Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [CLAUDE.md Complete Guide](https://www.builder.io/blog/claude-md-guide)

### Community Projects
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Claude Code resource collection
- [vibe-coding-cn](https://github.com/2025Emma/vibe-coding-cn) - Chinese Vibe Coding guide

---

## 🌐 Note on Internal Files

This template's internal files (`.claude/commands/`, `.claude/rules/`, `.claude/skills/`) are written in **Chinese**. This is intentional:

- **Claude understands Chinese** - All Claude models can read and follow Chinese instructions perfectly
- **No translation burden** - Maintaining dual-language internal files would be impractical
- **Focus on users** - The README (this file) is fully English for international users

If you prefer English internal files, community contributions for English translations are welcome!

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

| Contribution Type | Description |
|-------------------|-------------|
| ⭐ Star | Show your support |
| 🐛 Bug Report | [Report issues](../../issues/new?template=bug_report.md) |
| 💡 Feature Request | [Suggest features](../../issues/new?template=feature_request.md) |
| 📝 Documentation | Improve docs |
| 🔧 Code | Add commands, rules, skills |

---

## 📄 License

[MIT License](LICENSE) - Free to use and modify

---

<p align="center">
  <strong>If this template helps you, please give it a ⭐ Star!</strong>
</p>
