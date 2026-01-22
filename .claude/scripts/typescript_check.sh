#!/bin/bash
# TypeScript 类型检查
# 在 PostToolUse Edit|Write hook 中运行

# 获取修改的文件路径
FILE_PATH="${CLAUDE_FILE_PATH:-}"

# 如果没有文件路径，尝试从工具输入获取
if [ -z "$FILE_PATH" ]; then
  FILE_PATH="${CLAUDE_TOOL_INPUT:-}"
fi

# 检查是否是 TypeScript 文件
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$'; then
  # 检查是否存在 tsconfig.json
  if [ -f "tsconfig.json" ]; then
    # 检查是否安装了 TypeScript
    if command -v npx >/dev/null 2>&1; then
      # 只检查修改的文件（快速检查）
      echo "[TSCheck] 检查 TypeScript 类型: $FILE_PATH" >&2

      # 使用 tsc --noEmit 进行类型检查
      # --skipLibCheck 加速检查
      result=$(npx tsc --noEmit --skipLibCheck "$FILE_PATH" 2>&1)
      exit_code=$?

      if [ $exit_code -ne 0 ]; then
        echo "[TSCheck] 类型错误:" >&2
        echo "$result" | head -20 >&2
        # 不阻止操作，只警告
        # exit 1
      else
        echo "[TSCheck] 类型检查通过" >&2
      fi
    fi
  fi
fi

exit 0
