#!/usr/bin/env bash
# committer.sh - 安全 git 提交助手
# 借鉴自 @steipete/agent-scripts
#
# 功能：
# - 禁止 git add .（强制显式列出文件）
# - 验证文件存在性
# - 支持删除文件的 staging
# - 自动处理 git lock 文件
#
# 用法：
#   committer.sh "commit message" "file1" "file2" ...
#   committer.sh --force "commit message" "file1" ...  # 强制清除 lock 文件

set -euo pipefail
# 禁用 glob 展开，处理文件名中的特殊字符
set -f

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo -e "${YELLOW}用法:${NC} $(basename "$0") [--force] \"commit message\" \"file\" [\"file\" ...]"
    echo ""
    echo "参数:"
    echo "  --force    强制清除 .git/index.lock 文件（如果存在）"
    echo "  message    提交信息（必须非空）"
    echo "  file       要提交的文件列表（禁止使用 \".\"）"
    echo ""
    echo "示例:"
    echo "  committer.sh \"feat: add login\" src/auth.ts src/login.vue"
    echo "  committer.sh --force \"fix: resolve bug\" src/fix.ts"
    exit 2
}

if [ "$#" -lt 2 ]; then
    usage
fi

force_delete_lock=false
if [ "${1:-}" = "--force" ]; then
    force_delete_lock=true
    shift
fi

if [ "$#" -lt 2 ]; then
    usage
fi

commit_message=$1
shift

# 验证提交信息非空
if [[ "$commit_message" != *[![:space:]]* ]]; then
    echo -e "${RED}错误:${NC} 提交信息不能为空" >&2
    exit 1
fi

# 防止误把文件路径当作提交信息
if [ -e "$commit_message" ]; then
    echo -e "${RED}错误:${NC} 第一个参数看起来是文件路径 (\"$commit_message\")；请先提供提交信息" >&2
    exit 1
fi

if [ "$#" -eq 0 ]; then
    usage
fi

files=("$@")

# 禁止使用 "." - 这会暂存整个仓库，违背安全初衷
for file in "${files[@]}"; do
    if [ "$file" = "." ]; then
        echo -e "${RED}错误:${NC} 禁止使用 \".\"；请明确列出要提交的文件" >&2
        exit 1
    fi
done

last_commit_error=''

run_git_commit() {
    local stderr_log
    stderr_log=$(mktemp)
    if git commit -m "$commit_message" -- "${files[@]}" 2> >(tee "$stderr_log" >&2); then
        rm -f "$stderr_log"
        last_commit_error=''
        return 0
    fi

    last_commit_error=$(cat "$stderr_log")
    rm -f "$stderr_log"
    return 1
}

# 验证所有文件存在（允许已删除但在 git 中跟踪的文件）
for file in "${files[@]}"; do
    if [ ! -e "$file" ]; then
        # 允许 staging 删除：文件可能已从磁盘删除但仍在 git 索引或 HEAD 中
        if ! git ls-files --error-unmatch -- "$file" >/dev/null 2>&1; then
            if ! git cat-file -e "HEAD:$file" >/dev/null 2>&1; then
                echo -e "${RED}错误:${NC} 文件不存在: $file" >&2
                exit 1
            fi
        fi
    fi
done

# 先取消所有暂存，然后只添加指定文件
git restore --staged :/ 2>/dev/null || true
git add -A -- "${files[@]}"

# 检查是否有实际变更
if git diff --staged --quiet; then
    echo -e "${YELLOW}警告:${NC} 没有检测到暂存的变更: ${files[*]}" >&2
    exit 1
fi

committed=false
if run_git_commit; then
    committed=true
elif [ "$force_delete_lock" = true ]; then
    # 尝试清除 lock 文件
    lock_path=$(
        printf '%s\n' "$last_commit_error" |
            awk -F"'" '/Unable to create .*\.git\/index\.lock/ { print $2; exit }'
    )

    if [ -n "$lock_path" ] && [ -e "$lock_path" ]; then
        rm -f "$lock_path"
        echo -e "${YELLOW}已移除过期的 git lock:${NC} $lock_path" >&2
        if run_git_commit; then
            committed=true
        fi
    fi
fi

if [ "$committed" = false ]; then
    exit 1
fi

echo -e "${GREEN}已提交${NC} \"$commit_message\"，包含 ${#files[@]} 个文件"
