#!/bin/bash
# ============================================
# Claude Code 临时文件清理脚本
# ============================================
#
# 用途：清理 MCP 临时目录、过期日志和截图
#
# 用法：
#   ./cleanup.sh              # 执行清理
#   ./cleanup.sh --dry-run    # 预览模式（不实际删除）
#   ./cleanup.sh --days 7     # 清理 7 天前的文件（默认 30 天）
#   ./cleanup.sh --all        # 清理所有临时文件（不考虑时间）
#
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认参数
DRY_RUN=false
DAYS=30
CLEAN_ALL=false
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --days|-d)
            DAYS="$2"
            shift 2
            ;;
        --all|-a)
            CLEAN_ALL=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --dry-run, -n    预览模式，不实际删除"
            echo "  --days N, -d N   清理 N 天前的文件（默认 30）"
            echo "  --all, -a        清理所有临时文件（不考虑时间）"
            echo "  --help, -h       显示帮助"
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Claude Code 临时文件清理${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "项目目录: ${GREEN}$PROJECT_ROOT${NC}"
echo -e "保留天数: ${GREEN}$DAYS${NC}"
echo -e "预览模式: ${GREEN}$DRY_RUN${NC}"
echo ""

# 统计变量
TOTAL_SIZE=0
TOTAL_FILES=0

# 清理函数
cleanup_dir() {
    local dir="$1"
    local desc="$2"
    local pattern="${3:-*}"

    if [[ ! -d "$dir" ]]; then
        echo -e "${YELLOW}[跳过]${NC} $desc - 目录不存在"
        return
    fi

    echo -e "${BLUE}[检查]${NC} $desc"

    local files_found=0
    local size_found=0

    if [[ "$CLEAN_ALL" == true ]]; then
        # 清理所有文件
        while IFS= read -r -d '' file; do
            files_found=$((files_found + 1))
            local fsize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            size_found=$((size_found + fsize))

            if [[ "$DRY_RUN" == true ]]; then
                echo -e "  ${YELLOW}[预览删除]${NC} $file"
            else
                rm -f "$file"
                echo -e "  ${GREEN}[已删除]${NC} $file"
            fi
        done < <(find "$dir" -type f -name "$pattern" ! -name ".gitkeep" -print0 2>/dev/null)
    else
        # 只清理过期文件
        while IFS= read -r -d '' file; do
            files_found=$((files_found + 1))
            local fsize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            size_found=$((size_found + fsize))

            if [[ "$DRY_RUN" == true ]]; then
                echo -e "  ${YELLOW}[预览删除]${NC} $file"
            else
                rm -f "$file"
                echo -e "  ${GREEN}[已删除]${NC} $file"
            fi
        done < <(find "$dir" -type f -name "$pattern" ! -name ".gitkeep" -mtime +$DAYS -print0 2>/dev/null)
    fi

    TOTAL_FILES=$((TOTAL_FILES + files_found))
    TOTAL_SIZE=$((TOTAL_SIZE + size_found))

    if [[ $files_found -eq 0 ]]; then
        echo -e "  ${GREEN}[干净]${NC} 无需清理"
    else
        echo -e "  找到 ${files_found} 个文件"
    fi
}

# 清理 MCP 临时目录
cleanup_mcp_dir() {
    local dir="$1"
    local desc="$2"

    if [[ ! -d "$dir" ]]; then
        echo -e "${YELLOW}[跳过]${NC} $desc - 目录不存在"
        return
    fi

    echo -e "${BLUE}[检查]${NC} $desc"

    local files_found=$(find "$dir" -type f 2>/dev/null | wc -l)
    local size_found=$(du -sk "$dir" 2>/dev/null | cut -f1 || echo 0)
    size_found=$((size_found * 1024))

    TOTAL_FILES=$((TOTAL_FILES + files_found))
    TOTAL_SIZE=$((TOTAL_SIZE + size_found))

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "  ${YELLOW}[预览删除]${NC} 整个目录 ($files_found 文件)"
    else
        rm -rf "$dir"
        echo -e "  ${GREEN}[已删除]${NC} 整个目录 ($files_found 文件)"
    fi
}

echo -e "${BLUE}--- 清理 MCP 临时目录 ---${NC}"
cleanup_mcp_dir "$PROJECT_ROOT/.playwright-mcp" "Playwright MCP 临时目录"
cleanup_mcp_dir "$PROJECT_ROOT/.claude/mcp-data" "MCP 数据目录"

# 查找其他 *-mcp 目录
for mcp_dir in "$PROJECT_ROOT"/*-mcp; do
    if [[ -d "$mcp_dir" ]]; then
        cleanup_mcp_dir "$mcp_dir" "$(basename "$mcp_dir")"
    fi
done

echo ""
echo -e "${BLUE}--- 清理截图和日志 ---${NC}"
cleanup_dir "$PROJECT_ROOT/.claude/screenshots" "截图目录" "*.png"
cleanup_dir "$PROJECT_ROOT/.claude/screenshots" "截图目录" "*.jpg"
cleanup_dir "$PROJECT_ROOT/.claude/logs" "日志目录" "*.log"
cleanup_dir "$PROJECT_ROOT/.claude/sessions" "会话目录" "*"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}清理完成${NC}"
echo -e "${BLUE}================================${NC}"

# 格式化大小（不依赖 bc，使用纯 bash 算术）
format_size() {
    local size=$1
    if [[ $size -ge 1073741824 ]]; then
        local gb=$((size / 1073741824))
        local gb_rem=$(((size % 1073741824) * 100 / 1073741824))
        echo "${gb}.${gb_rem} GB"
    elif [[ $size -ge 1048576 ]]; then
        local mb=$((size / 1048576))
        local mb_rem=$(((size % 1048576) * 100 / 1048576))
        echo "${mb}.${mb_rem} MB"
    elif [[ $size -ge 1024 ]]; then
        local kb=$((size / 1024))
        local kb_rem=$(((size % 1024) * 100 / 1024))
        echo "${kb}.${kb_rem} KB"
    else
        echo "$size B"
    fi
}

echo ""
echo -e "处理文件数: ${GREEN}$TOTAL_FILES${NC}"
echo -e "释放空间: ${GREEN}$(format_size $TOTAL_SIZE)${NC}"

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo -e "${YELLOW}这是预览模式，未实际删除任何文件。${NC}"
    echo -e "${YELLOW}移除 --dry-run 参数以执行实际清理。${NC}"
fi
