#!/bin/bash
# 长时间运行命令提醒脚本
# 检测 dev server、watch 等可能长时间运行的命令

# 检查 jq 是否存在
if ! command -v jq &> /dev/null; then
    # jq 不存在时静默退出，不阻止操作
    exit 0
fi

# 从 stdin 读取输入
input=$(cat)

# 提取命令
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$command" ]; then
    exit 0
fi

# 长时间运行命令模式
LONG_RUNNING_PATTERNS=(
    "npm run dev"
    "npm run start"
    "npm run watch"
    "yarn dev"
    "yarn start"
    "yarn watch"
    "pnpm dev"
    "pnpm start"
    "pnpm watch"
    "nodemon"
    "ts-node-dev"
    "vite"
    "next dev"
    "nuxt dev"
    "webpack.*--watch"
    "tsc.*--watch"
    "jest.*--watch"
    "vitest.*--watch"
    "python.*manage.py runserver"
    "flask run"
    "uvicorn.*--reload"
    "cargo watch"
    "go run.*--watch"
)

for pattern in "${LONG_RUNNING_PATTERNS[@]}"; do
    if echo "$command" | grep -qE "$pattern"; then
        echo ""
        echo "⚠️  检测到长时间运行命令: $command"
        echo ""
        echo "建议:"
        echo "  - 使用 run_in_background: true 在后台运行"
        echo "  - 或在单独的终端窗口中手动启动"
        echo ""
        echo "如果需要在前台运行，请确保设置合适的 timeout"
        echo ""
        # 不阻止，只是警告
        exit 0
    fi
done

exit 0
