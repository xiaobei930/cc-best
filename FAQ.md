# FAQ / 常见问题

[English](#english) | [中文](#中文)

---

## English

### Getting Started

#### Q: How do I use this template?

```bash
# 1. Clone the repository
git clone https://github.com/xiaobei930/claude-code-best-practices.git my-project

# 2. Enter your project
cd my-project

# 3. Run initialization
bash scripts/shell/init.sh

# 4. Replace template placeholders (see next question)

# 5. Start using
/cc-best:pm  # Begin with product manager role
```

#### Q: What placeholders need to be replaced?

The following placeholders must be replaced before using:

| Placeholder               | Description               | Example                  |
| ------------------------- | ------------------------- | ------------------------ |
| `{{PROJECT_NAME}}`        | Your project name         | `MyAwesomeApp`           |
| `{{PROJECT_DESCRIPTION}}` | Brief project description | `A task management tool` |
| `{{DATE}}`                | Creation/update date      | `2025-01-24`             |
| `{{CURRENT_PHASE}}`       | Current development phase | `Development`            |

**Files containing placeholders:**

- `CLAUDE.md` - Main configuration (required)
- `memory-bank/progress.md` - Progress tracking
- `.claude/ralph-prompts/*.md` - Ralph Loop prompts (if using ralph-loop)

You can find all placeholders with:

```bash
grep -r "{{" --include="*.md" .
```

#### Q: Can I delete files I don't need?

Yes! This is a template. Common deletions:

- `.github/` - If you don't need contribution templates
- `CONTRIBUTING.md`, `CHANGELOG.md`, `FAQ.md` - Template-specific docs
- Language rules you don't use (e.g., `cpp-style.md` for a Python project)
- Commands you won't use

Keep at minimum:

- `CLAUDE.md` - Core configuration
- `.claude/settings.json` - Permission settings
- Rules for your language

#### Q: Do I need to keep the Git history?

No. For a fresh start:

```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit from Claude Code template"
```

### Hooks & Scripts

#### Q: Hooks are not working. What should I check?

1. **Check settings.local.json exists**:

   ```bash
   ls .claude/settings.local.json
   ```

   If missing, copy from example:

   ```bash
   cp .claude/settings.local.json.example .claude/settings.local.json
   ```

2. **Check script permissions** (Linux/Mac):

   ```bash
   chmod +x scripts/*.sh
   ```

3. **Check Python/Bash availability**:

   ```bash
   which python
   which bash
   ```

4. **Check Claude Code version** - Hooks require recent versions

#### Q: How do I disable specific hooks?

Edit `.claude/settings.local.json`, remove or comment out the hook entry:

```json
{
  "hooks": {
    "PreToolUse": [
      // Remove this block to disable
      // {
      //   "matcher": "Bash",
      //   "hooks": [...]
      // }
    ]
  }
}
```

#### Q: format_file.py fails with encoding error

This usually happens on Windows. Solutions:

1. Ensure Python 3.8+ is installed
2. Check the file encoding is UTF-8
3. Set environment variable: `PYTHONUTF8=1`

### Commands

#### Q: /cc-best:iterate stops unexpectedly

Check these stop conditions:

- User interrupted (Ctrl+C or Escape)
- All tasks in `progress.md` completed
- Fatal error occurred
- External dependency needs user decision

To resume: Run `/cc-best:iterate` again, it reads from `progress.md`.

#### Q: What's the difference between /cc-best:iterate and /pair?

| Mode               | Control                   | Use Case                        |
| ------------------ | ------------------------- | ------------------------------- |
| `/cc-best:iterate` | Fully autonomous          | Clear task list, single session |
| `/cc-best:pair`    | Step-by-step confirmation | Learning, sensitive operations  |

#### Q: Commands not found

Check these locations:

- Commands should be in `commands/`
- File extension must be `.md`
- Restart Claude Code after adding new commands

### Memory Bank

#### Q: When should I update progress.md?

- After completing each task
- When making important decisions
- Before context compression (`/cc-best:compact-context`)
- At session end

#### Q: memory-bank files are empty

Run initialization:

```bash
bash scripts/shell/init.sh
```

Or manually create from templates in `memory-bank/`.

### MCP Integration

#### Q: How do I configure MCP servers?

1. Edit `.claude/settings.local.json`
2. Add to `enabledMcpjsonServers`:
   ```json
   {
     "enabledMcpjsonServers": ["memory", "sequential-thinking"]
   }
   ```
3. Restart Claude Code

#### Q: Too many MCP tools causing issues

Best practice: Enable max 10 MCP servers per project. Use `disabledMcpServers` to disable unused ones:

```json
{
  "disabledMcpServers": ["github", "vercel"]
}
```

### Troubleshooting

#### Q: "Permission denied" errors

```bash
# Linux/Mac: Fix script permissions
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Windows: Run as administrator or check execution policy
```

#### Q: Python scripts fail on Windows

```bash
# Use python instead of python3
# Or set alias
alias python3=python
```

#### Q: Changes to rules not taking effect

- Claude Code caches rules at session start
- Restart the session after modifying rules
- Or use `/clear` to refresh context

---

## 中文

### 快速开始

#### Q: 如何使用这个模板？

```bash
# 1. 克隆仓库
git clone https://github.com/xiaobei930/claude-code-best-practices.git my-project

# 2. 进入项目
cd my-project

# 3. 运行初始化
bash scripts/shell/init.sh

# 4. 替换模板占位符（见下一个问题）

# 5. 开始使用
/cc-best:pm  # 从产品经理角色开始
```

#### Q: 需要替换哪些占位符？

使用前必须替换以下占位符：

| 占位符                    | 说明          | 示例               |
| ------------------------- | ------------- | ------------------ |
| `{{PROJECT_NAME}}`        | 项目名称      | `MyAwesomeApp`     |
| `{{PROJECT_DESCRIPTION}}` | 项目简介      | `一个任务管理工具` |
| `{{DATE}}`                | 创建/更新日期 | `2025-01-24`       |
| `{{CURRENT_PHASE}}`       | 当前开发阶段  | `开发中`           |

**包含占位符的文件：**

- `CLAUDE.md` - 主配置文件（必须替换）
- `memory-bank/progress.md` - 进度跟踪
- `.claude/ralph-prompts/*.md` - Ralph Loop 提示词（如使用）

查找所有占位符：

```bash
grep -r "{{" --include="*.md" .
```

#### Q: 可以删除不需要的文件吗？

可以！这是模板项目。常见可删除文件：

- `.github/` - 如果不需要贡献模板
- `CONTRIBUTING.md`, `CHANGELOG.md`, `FAQ.md` - 模板项目专用文档
- 不使用的语言规则（如 Python 项目删除 `cpp-style.md`）
- 不使用的命令

最少保留：

- `CLAUDE.md` - 核心配置
- `.claude/settings.json` - 权限设置
- 你使用的语言规则

#### Q: 需要保留 Git 历史吗？

不需要。如果想要全新开始：

```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit from Claude Code template"
```

### 钩子与脚本

#### Q: 钩子不工作，应该检查什么？

1. **检查 settings.local.json 是否存在**：

   ```bash
   ls .claude/settings.local.json
   ```

   如果不存在，从示例复制：

   ```bash
   cp .claude/settings.local.json.example .claude/settings.local.json
   ```

2. **检查脚本权限**（Linux/Mac）：

   ```bash
   chmod +x scripts/*.sh
   ```

3. **检查 Python/Bash 是否可用**：

   ```bash
   which python
   which bash
   ```

4. **检查 Claude Code 版本** - 钩子需要较新版本

#### Q: 如何禁用特定钩子？

编辑 `.claude/settings.local.json`，删除或注释掉相应的钩子配置：

```json
{
  "hooks": {
    "PreToolUse": [
      // 删除这个块来禁用
      // {
      //   "matcher": "Bash",
      //   "hooks": [...]
      // }
    ]
  }
}
```

#### Q: format_file.py 报编码错误

这通常发生在 Windows 上。解决方案：

1. 确保安装了 Python 3.8+
2. 检查文件编码是 UTF-8
3. 设置环境变量：`PYTHONUTF8=1`

### 命令相关

#### Q: /cc-best:iterate 意外停止了

检查这些停止条件：

- 用户中断（Ctrl+C 或 Escape）
- `progress.md` 中所有任务已完成
- 发生致命错误
- 需要用户决策的外部依赖

恢复方法：再次运行 `/cc-best:iterate`，它会读取 `progress.md` 继续。

#### Q: /cc-best:iterate 和 /cc-best:pair 有什么区别？

| 模式               | 控制方式 | 适用场景                 |
| ------------------ | -------- | ------------------------ |
| `/cc-best:iterate` | 完全自主 | 任务清单明确，单 session |
| `/cc-best:pair`    | 每步确认 | 学习新技术、敏感操作     |

#### Q: 命令找不到

检查以下位置：

- 命令应该在 `commands/` 目录
- 文件扩展名必须是 `.md`
- 添加新命令后重启 Claude Code

### 记忆库

#### Q: 什么时候应该更新 progress.md？

- 每个任务完成后
- 做出重要决策时
- 上下文压缩前（`/cc-best:compact-context`）
- 会话结束时

#### Q: memory-bank 文件是空的

运行初始化：

```bash
bash scripts/shell/init.sh
```

或者手动从 `memory-bank/` 中的模板创建。

### MCP 集成

#### Q: 如何配置 MCP 服务器？

1. 编辑 `.claude/settings.local.json`
2. 添加到 `enabledMcpjsonServers`：
   ```json
   {
     "enabledMcpjsonServers": ["memory", "sequential-thinking"]
   }
   ```
3. 重启 Claude Code

#### Q: MCP 工具太多导致问题

最佳实践：每个项目启用不超过 10 个 MCP 服务器。使用 `disabledMcpServers` 禁用不用的：

```json
{
  "disabledMcpServers": ["github", "vercel"]
}
```

### 故障排查

#### Q: "Permission denied" 权限错误

```bash
# Linux/Mac：修复脚本权限
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Windows：以管理员身份运行或检查执行策略
```

#### Q: Python 脚本在 Windows 上失败

```bash
# 使用 python 而不是 python3
# 或设置别名
alias python3=python
```

#### Q: 修改规则后不生效

- Claude Code 在会话开始时缓存规则
- 修改规则后重启会话
- 或使用 `/clear` 刷新上下文

---

## Windows 专用问题 / Windows Specific Issues

### Q: Windows 下出现 "ENOENT: no such file or directory" 错误

**原因**: 路径分隔符或路径中包含空格

**解决方案**:

1. **使用 Git Bash 而非 CMD/PowerShell**

   Git Bash 对 Unix 风格路径的处理更可靠。

2. **确保 Node.js 已安装并在 PATH 中**

   ```bash
   node --version
   ```

   应显示 v16 或更高版本。如未安装，从 https://nodejs.org 下载 LTS 版本。

### Q: Windows 下 Python 脚本编码错误 (UnicodeEncodeError: 'gbk')

**原因**: Windows 默认使用 GBK 编码，与 UTF-8 不兼容

**解决方案**:

**方法 1: 设置环境变量（推荐）**

PowerShell:

```powershell
$env:PYTHONUTF8="1"
```

CMD:

```cmd
set PYTHONUTF8=1
```

**方法 2: 永久设置**

在系统环境变量中添加：

- 变量名: `PYTHONUTF8`
- 变量值: `1`

**方法 3: 使用 Node.js 脚本**

本项目的 hooks 默认使用 Node.js 版本（`scripts/node/hooks/`），无编码问题。

### Q: Windows 下 SessionStart hook 显示 "hook error"

**原因**: SessionStart hook 有特殊要求

**解决方案**:

1. **检查 hook 输出是否为 JSON 格式**

   SessionStart hook 必须输出 JSON，纯文本会报错。参考: [claude-code#12671](https://github.com/anthropics/claude-code/issues/12671)

2. **检查路径是否加引号**

   ```json
   // ✅ 正确
   "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/node/hooks/session-check.js\""

   // ❌ 可能出错
   "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/node/hooks/session-check.js"
   ```

   参考: [claude-code#16152](https://github.com/anthropics/claude-code/issues/16152)

3. **检查是否有其他插件冲突**

   如果安装了多个插件，其他插件的 SessionStart hook 失败也会导致错误。使用 `claude --debug` 查看详细日志。

### Q: Windows 下 Git Bash 找不到命令

**原因**: Git 未安装或未添加到 PATH

**解决方案**:

1. 从 https://git-scm.com/download/win 下载安装 Git
2. 安装时勾选:
   - "Git Bash Here"
   - "Add Git to PATH"
3. 验证安装:
   ```bash
   git --version
   ```

### Q: ralph-loop 插件在 Windows 上不工作

**原因**: ralph-loop 的 Stop hook 使用 `.sh` 脚本，Windows 路径处理存在问题

**解决方案**:

这是上游问题，已报告: [claude-plugins-official#288](https://github.com/anthropics/claude-plugins-official/issues/288)

临时替代方案:

- 使用 `/cc-best:iterate` 命令进行自主循环（cc-best 内置，无需 ralph-loop）
- 使用 WSL (Windows Subsystem for Linux)

---

## General / 通用问题

### Q: How to update the plugin? / 如何更新插件？

**Plugin installation / 插件安装方式**:

```bash
# Reinstall to get the latest version / 重新安装获取最新版本
/plugin install cc-best@xiaobei930
```

**Clone installation / 克隆安装方式**:

```bash
cd .claude
git pull origin main
```

### Q: How to use with an existing project? / 已有项目如何使用？

CC-Best works with any existing project. After installing the plugin:

CC-Best 适用于任何已有项目。安装插件后：

1. **Initialize project configuration / 初始化项目配置**:

   ```bash
   /cc-best:setup
   ```

   This creates `CLAUDE.md`, `memory-bank/` and other project files. Existing files will NOT be overwritten.

   这会创建 `CLAUDE.md`、`memory-bank/` 等项目文件。已有文件不会被覆盖。

2. **Enable hooks (optional but recommended) / 启用 hooks（可选但推荐）**:

   ```bash
   /cc-best:setup --hooks
   ```

3. **Start working / 开始使用**:

   ```bash
   # Autonomous mode / 自主模式
   /cc-best:iterate "add dark mode support"

   # Or pair programming / 或结对编程
   /cc-best:pair
   ```

> 💡 **Tip / 提示**: Run `/cc-best:status` at any time to check your project configuration status.
> 随时运行 `/cc-best:status` 检查项目配置状态。

---

## Still Have Questions? / 还有问题？

- [Open an Issue](https://github.com/xiaobei930/claude-code-best-practices/issues/new)
- [Start a Discussion](https://github.com/xiaobei930/claude-code-best-practices/discussions)
