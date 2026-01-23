---
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /setup - 项目初始化

初始化 Claude Code 项目配置。支持 **Plugin 模式** 和 **Clone 模式**。

## 执行步骤

### 1. 运行初始化脚本

使用 Node.js 脚本（跨平台兼容）执行初始化：

```bash
# 检测并运行初始化脚本
# Plugin 模式：脚本位于插件目录
# Clone 模式：脚本位于项目目录

# 优先使用 Node.js（跨平台）
if command -v node &> /dev/null; then
    # 查找脚本位置（Plugin 或 Clone 模式）
    if [ -f "scripts/node/hooks/init.js" ]; then
        node scripts/node/hooks/init.js
    fi
else
    # 回退到 Bash（仅 Unix）
    if [ -f "scripts/shell/init.sh" ]; then
        bash scripts/shell/init.sh
    fi
fi
```

初始化脚本会自动：
- 检测运行模式（Plugin/Clone）
- 创建 `.claude/settings.local.json`
- 创建必要目录结构
- 初始化 Memory Bank 文件
- Plugin 模式下从插件目录复制模板
- Clone 模式下创建 Hookify 规则文件

### 2. 更新 CLAUDE.md

将模板占位符替换为实际项目信息：
- `{{PROJECT_NAME}}` → 项目名称
- `{{PROJECT_DESCRIPTION}}` → 项目描述
- `{{DATE}}` → 当前日期 (YYYY-MM-DD)
- `{{CURRENT_PHASE}}` → 当前阶段（如"开发中"、"MVP"）

**询问用户**获取这些信息，然后使用 Edit 工具更新 CLAUDE.md。

## 输出

初始化完成后输出：
```
✅ 项目初始化完成

已创建/检查：
- [x] .claude/settings.local.json
- [x] .claude/screenshots/
- [x] .claude/logs/
- [x] memory-bank/
- [x] docs/

下一步：
1. 确认 CLAUDE.md 中的项目信息
2. 编辑 memory-bank/tech-stack.md 定义技术栈
3. 运行 /pm 开始第一个需求
```

## 模式差异

| 模式 | settings.local.json 来源 | Hookify 规则 |
|------|--------------------------|--------------|
| Plugin | 插件目录模板 | 由 hooks.json 提供 |
| Clone | 项目目录模板 | 复制 .example 文件 |
