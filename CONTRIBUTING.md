# Contributing to Claude Code Best Practices Template

[English](#english) | [中文](#中文)

---

## English

Thank you for your interest in contributing! This project aims to build the best Claude Code development template together with the community.

### Ways to Contribute

#### 1. Report Issues

- Found a bug? [Open an issue](../../issues/new?template=bug_report.md)
- Have a suggestion? [Open a feature request](../../issues/new?template=feature_request.md)
- Documentation unclear? Let us know!

#### 2. Submit Pull Requests

- Fix bugs
- Add new commands/skills/rules
- Improve documentation
- Add translations

#### 3. Share Your Experience

- Share usage scenarios in Discussions
- Write blog posts about using this template
- Star the project if you find it useful

### Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/claude-code-best-practices.git
cd claude-code-best-practices

# 2. Create a branch
git checkout -b feature/your-feature-name

# 3. Make changes and test
python scripts/test_template.py

# 4. Commit (follow conventional commits - English only)
git commit -m "feat(commands): add new command for X"

# 5. Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/).

> ⚠️ **Important**: All commit messages for this repository must be in **English** to maintain consistency.

```
<type>(<scope>): <description>

[optional body]
```

**Rules:**

- Use **lowercase** for description (not capitalized)
- Use **present tense** verbs (add, not added)
- Keep description under **50 characters**
- No period at the end

**Types:**

| Type       | Description       | Example                                 |
| ---------- | ----------------- | --------------------------------------- |
| `feat`     | New feature       | feat(commands): add /deploy command     |
| `fix`      | Bug fix           | fix(hooks): resolve encoding issue      |
| `docs`     | Documentation     | docs(readme): add FAQ section           |
| `style`    | Code formatting   | style: format with prettier             |
| `refactor` | Code refactoring  | refactor(hooks): simplify timeout logic |
| `perf`     | Performance       | perf(query): optimize search            |
| `test`     | Tests             | test: add unit tests for hooks          |
| `chore`    | Build/maintenance | chore(deps): bump axios to 1.6.0        |

**Examples:**

```
feat(commands): add /deploy command for CI/CD
fix(hooks): resolve format_file.py encoding issue
docs(readme): add FAQ section
refactor(scripts): simplify timeout configuration
```

### Pull Request Guidelines

1. **One PR per feature/fix** - Keep changes focused
2. **Update documentation** - If adding commands/skills, update relevant docs
3. **Test your changes** - Run `test_template.py`
4. **Follow existing patterns** - Match the style of existing files
5. **Write clear descriptions** - Explain what and why

### Local Plugin Testing

To test changes locally before submitting a PR:

```bash
# Option 1: Symlink (recommended)
# macOS/Linux:
ln -s /path/to/claude-code-best-practices ~/.claude/plugins/cc-best
# Windows (PowerShell as Admin):
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\plugins\cc-best" -Target "C:\path\to\claude-code-best-practices"

# Option 2: Run CI validation locally
node scripts/ci/validate-agents.js
node scripts/ci/validate-skills.js
node scripts/ci/validate-commands.js
```

### File Structure Guidelines

#### Adding a New Command

Create `commands/your-command.md`:

```markdown
---
description: Brief description of the command
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# /your-command - Command Name

## Role Definition

...

## Workflow

1. Step 1
2. Step 2
```

- File name: `kebab-case.md`
- `description` is required in frontmatter
- `allowed-tools` lists permitted tools
- Avoid name conflicts with existing skills

#### Adding a New Rule

Create `rules/<directory>/your-rule.md`:

```markdown
---
paths:
  - "**/*.py"
---

# Rule Title
```

- `common/` rules: No `paths` (always loaded)
- Language rules: Must have `paths` with glob patterns
- Only `paths` is a valid frontmatter field

#### Adding a New Language (4 Steps)

1. Create directory: `rules/your-lang/`
2. Add style file with `paths` frontmatter
3. Add optional: testing, security, performance files
4. Update `.claude-plugin/ARCHITECTURE.md`

#### Adding a New Skill

Create `skills/your-skill/SKILL.md`:

```markdown
---
name: your-skill
description: What this skill provides
---
```

- Main file must be `SKILL.md` (uppercase)
- `name` and `description` required
- Child files (e.g., `sub-topic.md`) auto-load with parent

#### Adding a New Agent

Create `agents/your-agent.md`:

```markdown
---
name: your-agent
description: What this agent does (min 20 chars)
tools: [Read, Glob, Grep, Bash]
model: opus
---
```

- `name` must match filename (without `.md`)
- `tools` is required
- `model` is optional: `opus`/`sonnet`/`haiku`
- Must also add path to `plugin.json` `agents` array

#### Hook Script Conventions

```javascript
#!/usr/bin/env node
if (process.argv.includes("--help")) {
  console.log("Hook description");
  process.exit(0);
}
const { readStdinJson } = require("../lib/utils.js");

async function main() {
  const input = await readStdinJson();
  // To block: output { "decision": "block", "reason": "..." }
  // To allow: exit 0 with no output
}
main();
```

- Use `readStdinJson()` from `scripts/node/lib/utils.js`
- Handle `--help` flag for documentation
- Timeout configured in `hooks/hooks.json`

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

### Questions?

- Open a [Discussion](../../discussions)
- Check existing issues before creating new ones

---

## 中文

感谢你有兴趣参与贡献！本项目旨在与社区一起打造最好的 Claude Code 开发模板。

### 贡献方式

#### 1. 报告问题

- 发现 Bug？[提交 Issue](../../issues/new?template=bug_report.md)
- 有建议？[提交功能请求](../../issues/new?template=feature_request.md)
- 文档不清楚？告诉我们！

#### 2. 提交 Pull Request

- 修复 Bug
- 添加新的命令/技能/规则
- 改进文档
- 添加翻译

#### 3. 分享你的经验

- 在 Discussions 分享使用场景
- 写博客介绍这个模板
- 如果觉得有用，给项目 Star

### 开发环境设置

```bash
# 1. Fork 并克隆
git clone https://github.com/YOUR_USERNAME/claude-code-best-practices.git
cd claude-code-best-practices

# 2. 创建分支
git checkout -b feature/your-feature-name

# 3. 修改并测试
python scripts/test_template.py

# 4. 提交（必须使用英文）
git commit -m "feat(commands): add new command for X"

# 5. 推送并创建 PR
git push origin feature/your-feature-name
```

### 提交信息格式

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)。

> ⚠️ **重要**: 本仓库的所有 commit message 必须使用**英文**，以保持一致性。

```
<type>(<scope>): <description>

[可选正文]
```

**规范：**

- 使用**小写字母**开头（不首字母大写）
- 使用**现在时态**动词（add 而非 added）
- 描述不超过 **50 字符**
- 不以句号结尾

**类型：**

| Type       | 说明     | 示例                                    |
| ---------- | -------- | --------------------------------------- |
| `feat`     | 新功能   | feat(commands): add /deploy command     |
| `fix`      | Bug 修复 | fix(hooks): resolve encoding issue      |
| `docs`     | 文档更新 | docs(readme): add FAQ section           |
| `style`    | 代码格式 | style: format with prettier             |
| `refactor` | 重构     | refactor(hooks): simplify timeout logic |
| `perf`     | 性能优化 | perf(query): optimize search            |
| `test`     | 测试     | test: add unit tests for hooks          |
| `chore`    | 构建维护 | chore(deps): bump axios to 1.6.0        |

**示例：**

```
feat(commands): add /deploy command for CI/CD
fix(hooks): resolve format_file.py encoding issue
docs(readme): add FAQ section
refactor(scripts): simplify timeout configuration
```

### Pull Request 指南

1. **一个 PR 一个功能** - 保持修改聚焦
2. **更新文档** - 如果添加命令/技能，更新相关文档
3. **测试你的修改** - 运行 `test_template.py`
4. **遵循现有模式** - 与现有文件风格保持一致
5. **写清楚描述** - 说明改了什么以及为什么

### 本地插件测试

提交 PR 前本地测试：

```bash
# 方式 1：符号链接（推荐）
# macOS/Linux:
ln -s /path/to/claude-code-best-practices ~/.claude/plugins/cc-best
# Windows (管理员 PowerShell):
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\plugins\cc-best" -Target "C:\path\to\claude-code-best-practices"

# 方式 2：本地运行 CI 验证
node scripts/ci/validate-agents.js
node scripts/ci/validate-skills.js
node scripts/ci/validate-commands.js
```

### 文件结构指南

#### 添加新命令

创建 `commands/your-command.md`：

```markdown
---
description: 命令简述
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# /your-command - 命令名称

## 角色定义

...

## 工作流程

1. 步骤 1
2. 步骤 2
```

- 文件名：`kebab-case.md`
- `description` 必填
- `allowed-tools` 列出允许的工具
- 避免与现有 skill 同名冲突

#### 添加新规则

创建 `rules/<目录>/your-rule.md`：

```markdown
---
paths:
  - "**/*.py"
---

# 规则标题
```

- `common/` 规则：不设 `paths`（始终加载）
- 语言规则：必须有 `paths` glob 模式
- `paths` 是唯一合法的 frontmatter 字段

#### 添加新语言（4 步）

1. 创建目录：`rules/your-lang/`
2. 添加带 `paths` frontmatter 的风格文件
3. 可选添加：testing、security、performance 文件
4. 更新 `.claude-plugin/ARCHITECTURE.md`

#### 添加新技能

创建 `skills/your-skill/SKILL.md`：

```markdown
---
name: your-skill
description: 技能说明
---
```

- 主文件必须命名为 `SKILL.md`（大写）
- `name` 和 `description` 必填
- 子文件（如 `sub-topic.md`）随父技能自动加载

#### 添加新智能体

创建 `agents/your-agent.md`：

```markdown
---
name: your-agent
description: 智能体说明（至少 20 字符）
tools: [Read, Glob, Grep, Bash]
model: opus
---
```

- `name` 必须与文件名一致（去掉 `.md`）
- `tools` 必填
- `model` 可选：`opus`/`sonnet`/`haiku`
- 必须同时将路径添加到 `plugin.json` 的 `agents` 数组

#### Hook 脚本规范

```javascript
#!/usr/bin/env node
if (process.argv.includes("--help")) {
  console.log("钩子描述");
  process.exit(0);
}
const { readStdinJson } = require("../lib/utils.js");

async function main() {
  const input = await readStdinJson();
  // 阻止：输出 { "decision": "block", "reason": "..." }
  // 允许：exit 0 且无输出
}
main();
```

- 使用 `scripts/node/lib/utils.js` 的 `readStdinJson()`
- 必须处理 `--help` 参数
- 超时在 `hooks/hooks.json` 中配置

### 行为准则

- 尊重和包容他人
- 提供建设性反馈
- 帮助他人学习和成长

### 有问题？

- 发起 [Discussion](../../discussions)
- 创建新 Issue 前先检查是否已有相关问题

---

## Thank You! / 感谢！

Every contribution, no matter how small, helps make this template better for everyone.

每一个贡献，无论大小，都能让这个模板变得更好。

⭐ If you find this project useful, please consider giving it a star!

⭐ 如果你觉得这个项目有用，请考虑给它一个 Star！
