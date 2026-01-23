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

# 4. Edit CLAUDE.md - replace placeholders:
#    {{PROJECT_NAME}}, {{DATE}}, {{PROJECT_DESCRIPTION}}

# 5. Start using
/pm  # Begin with product manager role
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

#### Q: /iterate stops unexpectedly
Check these stop conditions:
- User interrupted (Ctrl+C or Escape)
- All tasks in `progress.md` completed
- Fatal error occurred
- External dependency needs user decision

To resume: Run `/iterate` again, it reads from `progress.md`.

#### Q: What's the difference between /iterate and /pair?
| Mode | Control | Use Case |
|------|---------|----------|
| `/iterate` | Fully autonomous | Clear task list, single session |
| `/pair` | Step-by-step confirmation | Learning, sensitive operations |

#### Q: Commands not found
Check these locations:
- Commands should be in `commands/`
- File extension must be `.md`
- Restart Claude Code after adding new commands

### Memory Bank

#### Q: When should I update progress.md?
- After completing each task
- When making important decisions
- Before context compression (`/compact`)
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
     "enabledMcpjsonServers": [
       "memory",
       "sequential-thinking"
     ]
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

# 4. 编辑 CLAUDE.md，替换占位符：
#    {{PROJECT_NAME}}, {{DATE}}, {{PROJECT_DESCRIPTION}}

# 5. 开始使用
/pm  # 从产品经理角色开始
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

#### Q: /iterate 意外停止了
检查这些停止条件：
- 用户中断（Ctrl+C 或 Escape）
- `progress.md` 中所有任务已完成
- 发生致命错误
- 需要用户决策的外部依赖

恢复方法：再次运行 `/iterate`，它会读取 `progress.md` 继续。

#### Q: /iterate 和 /pair 有什么区别？
| 模式 | 控制方式 | 适用场景 |
|------|---------|----------|
| `/iterate` | 完全自主 | 任务清单明确，单 session |
| `/pair` | 每步确认 | 学习新技术、敏感操作 |

#### Q: 命令找不到
检查以下位置：
- 命令应该在 `commands/` 目录
- 文件扩展名必须是 `.md`
- 添加新命令后重启 Claude Code

### 记忆库

#### Q: 什么时候应该更新 progress.md？
- 每个任务完成后
- 做出重要决策时
- 上下文压缩前（`/compact`）
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
     "enabledMcpjsonServers": [
       "memory",
       "sequential-thinking"
     ]
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

## Still Have Questions? / 还有问题？

- [Open an Issue](https://github.com/xiaobei930/claude-code-best-practices/issues/new)
- [Start a Discussion](https://github.com/xiaobei930/claude-code-best-practices/discussions)
