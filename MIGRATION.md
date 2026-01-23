# Migration Guide / 迁移指南

[English](#english) | [中文](#中文)

---

## English

This guide helps you migrate an existing project to use this Claude Code template.

### Quick Migration (5 minutes)

#### Step 1: Backup Existing Config

```bash
# If you have existing .claude/ directory
mv .claude .claude.backup
mv CLAUDE.md CLAUDE.md.backup  # If exists
```

#### Step 2: Copy Template Files

```bash
# Clone template to temporary location
git clone https://github.com/xiaobei930/claude-code-best-practices.git /tmp/cc-template

# Copy essential files
cp -r /tmp/cc-template/.claude /path/to/your/project/
cp -r /tmp/cc-template/commands /path/to/your/project/
cp -r /tmp/cc-template/skills /path/to/your/project/
cp -r /tmp/cc-template/agents /path/to/your/project/
cp -r /tmp/cc-template/rules /path/to/your/project/
cp -r /tmp/cc-template/scripts /path/to/your/project/
cp -r /tmp/cc-template/hooks /path/to/your/project/
cp /tmp/cc-template/CLAUDE.md /path/to/your/project/

# Optional: Copy memory-bank if you want progress tracking
cp -r /tmp/cc-template/memory-bank /path/to/your/project/
```

#### Step 3: Initialize

```bash
cd /path/to/your/project
bash scripts/init.sh
```

#### Step 4: Configure CLAUDE.md

Edit `CLAUDE.md` and replace placeholders:

| Placeholder | Replace With |
|-------------|--------------|
| `{{PROJECT_NAME}}` | Your project name |
| `{{PROJECT_DESCRIPTION}}` | Brief description |
| `{{DATE}}` | Current date (YYYY-MM-DD) |
| `{{CURRENT_PHASE}}` | e.g., "Development", "MVP" |

#### Step 5: Merge Custom Settings

If you had custom settings in `.claude.backup/`:

```bash
# Compare and merge settings
diff .claude.backup/settings.json .claude/settings.json

# Copy your custom commands (if any)
cp .claude.backup/commands/my-custom-command.md commands/
```

### Selective Migration

Only want specific features? Pick what you need:

#### Just the Workflow Commands

```bash
cp -r /tmp/cc-template/commands/ commands/
```

#### Just the Coding Rules

```bash
cp -r /tmp/cc-template/rules/ rules/
```

#### Just the Hooks

```bash
cp /tmp/cc-template/.claude/settings.local.json.example .claude/
cp -r /tmp/cc-template/scripts/ scripts/
```

### Language-Specific Migration

#### Python Project

Keep these rules:
- `rules/code-style.md` (Python style)
- `rules/coding-standards.md` (Universal)
- `skills/backend-patterns/python.md`

Remove if not needed:
- `frontend-style.md`, `cpp-style.md`, `java-style.md`, etc.

#### Vue/TypeScript Project

Keep these rules:
- `rules/frontend-style.md`
- `rules/coding-standards.md`
- `skills/frontend-patterns/vue.md`

#### Multi-Language Project

Keep all rules - they auto-match based on file extensions.

### Troubleshooting

#### Hooks Not Working After Migration

1. Check `settings.local.json` exists:
   ```bash
   ls .claude/settings.local.json
   ```

2. Run init script:
   ```bash
   bash scripts/init.sh
   ```

3. Set script permissions (Linux/Mac):
   ```bash
   chmod +x scripts/*.sh
   chmod +x scripts/*.py
   ```

#### Commands Not Found

Restart Claude Code session after migration.

#### Conflicts with Existing CLAUDE.md

Merge manually - keep your project-specific constraints, adopt the template's workflow structure.

---

## 中文

本指南帮助你将现有项目迁移到使用此 Claude Code 模板。

### 快速迁移（5 分钟）

#### 步骤 1：备份现有配置

```bash
# 如果有现有的 .claude/ 目录
mv .claude .claude.backup
mv CLAUDE.md CLAUDE.md.backup  # 如果存在
```

#### 步骤 2：复制模板文件

```bash
# 克隆模板到临时位置
git clone https://github.com/xiaobei930/claude-code-best-practices.git /tmp/cc-template

# 复制必要文件
cp -r /tmp/cc-template/.claude /path/to/your/project/
cp -r /tmp/cc-template/commands /path/to/your/project/
cp -r /tmp/cc-template/skills /path/to/your/project/
cp -r /tmp/cc-template/agents /path/to/your/project/
cp -r /tmp/cc-template/rules /path/to/your/project/
cp -r /tmp/cc-template/scripts /path/to/your/project/
cp -r /tmp/cc-template/hooks /path/to/your/project/
cp /tmp/cc-template/CLAUDE.md /path/to/your/project/

# 可选：如果需要进度跟踪，复制 memory-bank
cp -r /tmp/cc-template/memory-bank /path/to/your/project/
```

#### 步骤 3：初始化

```bash
cd /path/to/your/project
bash scripts/init.sh
```

#### 步骤 4：配置 CLAUDE.md

编辑 `CLAUDE.md`，替换占位符：

| 占位符 | 替换为 |
|--------|--------|
| `{{PROJECT_NAME}}` | 项目名称 |
| `{{PROJECT_DESCRIPTION}}` | 简短描述 |
| `{{DATE}}` | 当前日期 (YYYY-MM-DD) |
| `{{CURRENT_PHASE}}` | 如 "开发中"、"MVP 阶段" |

#### 步骤 5：合并自定义设置

如果在 `.claude.backup/` 中有自定义设置：

```bash
# 比较并合并设置
diff .claude.backup/settings.json .claude/settings.json

# 复制自定义命令（如有）
cp .claude.backup/commands/my-custom-command.md commands/
```

### 选择性迁移

只需要特定功能？按需选择：

#### 只要工作流命令

```bash
cp -r /tmp/cc-template/commands/ commands/
```

#### 只要编码规则

```bash
cp -r /tmp/cc-template/rules/ rules/
```

#### 只要钩子

```bash
cp /tmp/cc-template/.claude/settings.local.json.example .claude/
cp -r /tmp/cc-template/scripts/ scripts/
```

### 按语言迁移

#### Python 项目

保留这些规则：
- `rules/code-style.md`（Python 风格）
- `rules/coding-standards.md`（通用）
- `skills/backend-patterns/python.md`

如不需要可删除：
- `frontend-style.md`、`cpp-style.md`、`java-style.md` 等

#### Vue/TypeScript 项目

保留这些规则：
- `rules/frontend-style.md`
- `rules/coding-standards.md`
- `skills/frontend-patterns/vue.md`

#### 多语言项目

保留所有规则 - 它们根据文件扩展名自动匹配。

### 故障排查

#### 迁移后钩子不工作

1. 检查 `settings.local.json` 是否存在：
   ```bash
   ls .claude/settings.local.json
   ```

2. 运行初始化脚本：
   ```bash
   bash scripts/init.sh
   ```

3. 设置脚本权限（Linux/Mac）：
   ```bash
   chmod +x scripts/*.sh
   chmod +x scripts/*.py
   ```

#### 命令找不到

迁移后重启 Claude Code 会话。

#### 与现有 CLAUDE.md 冲突

手动合并 - 保留你的项目特定约束，采用模板的工作流结构。

---

## Migration Checklist / 迁移检查清单

- [ ] Backup existing `.claude/` and `CLAUDE.md`
- [ ] Copy template files
- [ ] Run `init.sh`
- [ ] Replace placeholders in `CLAUDE.md`
- [ ] Merge custom settings (if any)
- [ ] Remove unused language rules (optional)
- [ ] Test with `/status` command
- [ ] Verify hooks work with a simple edit

---

## Need Help? / 需要帮助？

- [FAQ](FAQ.md)
- [Open an Issue](https://github.com/xiaobei930/claude-code-best-practices/issues)
