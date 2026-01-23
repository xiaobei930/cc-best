#!/bin/bash
# Claude Code 项目初始化脚本
# 用法: bash .claude/scripts/init.sh

set -e

echo "🚀 Claude Code 项目初始化"
echo "=========================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 创建 settings.local.json
if [ ! -f ".claude/settings.local.json" ]; then
    cp .claude/settings.local.json.example .claude/settings.local.json
    echo -e "${GREEN}✅${NC} 创建 settings.local.json"
else
    echo -e "${YELLOW}⏭️${NC} settings.local.json 已存在"
fi

# 2. 创建 Hookify 规则文件
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
