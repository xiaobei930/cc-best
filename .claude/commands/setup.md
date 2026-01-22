---
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /setup - 项目初始化

初始化 Claude Code 项目配置。

## 执行步骤

### 1. 检查配置文件

```bash
# 检查 settings.local.json 是否存在
if [ ! -f ".claude/settings.local.json" ]; then
    echo "正在创建 settings.local.json..."
    cp .claude/settings.local.json.example .claude/settings.local.json
    echo "✅ settings.local.json 已创建"
else
    echo "⏭️ settings.local.json 已存在，跳过"
fi
```

### 2. 创建必要目录

```bash
mkdir -p .claude/screenshots
mkdir -p .claude/logs
mkdir -p memory-bank
mkdir -p docs/requirements
mkdir -p docs/designs
mkdir -p docs/tasks
```

### 3. 初始化 Memory Bank（如不存在）

检查并创建以下文件：
- `memory-bank/progress.md` - 项目进度
- `memory-bank/architecture.md` - 系统架构
- `memory-bank/tech-stack.md` - 技术栈

### 4. 更新 CLAUDE.md

将模板占位符替换为实际项目信息：
- `{{PROJECT_NAME}}` → 项目名称
- `{{PROJECT_DESCRIPTION}}` → 项目描述
- `{{DATE}}` → 当前日期
- `{{CURRENT_PHASE}}` → 当前阶段

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
1. 编辑 CLAUDE.md 填写项目信息
2. 编辑 memory-bank/tech-stack.md 定义技术栈
3. 运行 /pm 开始第一个需求
```
