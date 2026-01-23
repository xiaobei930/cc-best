#!/bin/bash
# Claude Code 项目初始化脚本
#
# Clone 模式用法: bash scripts/shell/init.sh
# Plugin 模式：在 Claude Code 中运行 /setup 命令

set -e

echo "🚀 Claude Code 项目初始化"
echo "=========================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检测脚本所在目录（支持 Plugin 模式）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 从 scripts/shell/ 往上两级得到项目根目录
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 检测运行模式
if [ -f "$PROJECT_ROOT/.claude-plugin/plugin.json" ] && [ ! -f ".claude/settings.json" ]; then
    # Plugin 模式：当前目录没有 .claude，但脚本来自插件
    MODE="plugin"
    TEMPLATE_ROOT="$PROJECT_ROOT"
    echo -e "${YELLOW}📦 检测到 Plugin 模式${NC}"
else
    # Clone 模式：当前目录就是项目根目录
    MODE="clone"
    TEMPLATE_ROOT="."
    echo -e "${GREEN}📁 检测到 Clone 模式${NC}"
fi

echo ""

# 1. 创建 .claude 目录
mkdir -p .claude

# 2. 创建 settings.local.json
if [ ! -f ".claude/settings.local.json" ]; then
    if [ -f "$TEMPLATE_ROOT/.claude/settings.local.json.example" ]; then
        cp "$TEMPLATE_ROOT/.claude/settings.local.json.example" .claude/settings.local.json
        echo -e "${GREEN}✅${NC} 创建 settings.local.json"
    else
        echo -e "${YELLOW}⚠️${NC} 未找到 settings.local.json.example 模板"
    fi
else
    echo -e "${YELLOW}⏭️${NC} settings.local.json 已存在"
fi

# 3. 创建 Hookify 规则文件（仅 Clone 模式，Plugin 模式由 hooks.json 提供安全功能）
if [ "$MODE" = "clone" ]; then
    for example in .claude/hookify.*.local.md.example; do
        if [ -f "$example" ]; then
            target="${example%.example}"
            if [ ! -f "$target" ]; then
                cp "$example" "$target"
                echo -e "${GREEN}✅${NC} 创建 $(basename $target)"
            else
                echo -e "${YELLOW}⏭️${NC} $(basename $target) 已存在"
            fi
        fi
    done
else
    echo -e "${YELLOW}ℹ️${NC} Plugin 模式下安全功能由 hooks.json 提供"
fi

# 3. 创建必要目录
dirs=(".claude/screenshots" ".claude/logs" "memory-bank" "docs/requirements" "docs/designs" "docs/tasks")
for dir in "${dirs[@]}"; do
    mkdir -p "$dir"
done
echo -e "${GREEN}✅${NC} 创建目录结构"

# 4. 创建 Memory Bank 文件（如不存在）
if [ ! -f "memory-bank/progress.md" ]; then
    cat > memory-bank/progress.md << 'EOF'
# 项目进度

## 当前状态
- **阶段**: 初始化
- **进度**: 0%

## 待办任务
- [ ] 完成项目初始化
- [ ] 定义技术栈
- [ ] 创建第一个需求

## 已完成
（暂无）

## 阻塞项
（暂无）
EOF
    echo -e "${GREEN}✅${NC} 创建 memory-bank/progress.md"
fi

if [ ! -f "memory-bank/architecture.md" ]; then
    cat > memory-bank/architecture.md << 'EOF'
# 系统架构

## 概述
（待定义）

## 模块划分
（待定义）

## 数据流
（待定义）
EOF
    echo -e "${GREEN}✅${NC} 创建 memory-bank/architecture.md"
fi

if [ ! -f "memory-bank/tech-stack.md" ]; then
    cat > memory-bank/tech-stack.md << 'EOF'
# 技术栈

## 后端
- **语言**: （待定义）
- **框架**: （待定义）
- **数据库**: （待定义）

## 前端
- **框架**: （待定义）
- **UI 库**: （待定义）

## 工具链
- **包管理**: （待定义）
- **构建工具**: （待定义）
- **测试框架**: （待定义）
EOF
    echo -e "${GREEN}✅${NC} 创建 memory-bank/tech-stack.md"
fi

echo ""
echo "=========================="
echo -e "${GREEN}✅ 初始化完成！${NC}"
echo ""
echo "下一步："
echo "  1. 编辑 CLAUDE.md 填写项目信息"
echo "  2. 编辑 memory-bank/tech-stack.md 定义技术栈"
echo "  3. 运行 /pm 开始第一个需求"
