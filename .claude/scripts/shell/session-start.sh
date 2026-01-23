#!/bin/bash
# SessionStart Hook - 会话启动时加载上次上下文
#
# 检查最近的会话文件并通知 Claude 有可用的上下文可加载。

SESSIONS_DIR=".claude/sessions"
MEMORY_BANK="memory-bank"

# 检查 memory-bank 中的进度文件
if [ -f "$MEMORY_BANK/progress.md" ]; then
  # 获取文件最后修改时间
  if [ "$(uname)" == "Darwin" ]; then
    last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$MEMORY_BANK/progress.md" 2>/dev/null)
  else
    last_modified=$(stat -c "%y" "$MEMORY_BANK/progress.md" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
  fi
  echo "[SessionStart] progress.md 最后更新: $last_modified" >&2
fi

# 检查是否有未完成的任务
if [ -f "$MEMORY_BANK/progress.md" ]; then
  pending_tasks=$(grep -c "^\- \[ \]" "$MEMORY_BANK/progress.md" 2>/dev/null || echo "0")
  if [ "$pending_tasks" -gt 0 ]; then
    echo "[SessionStart] 发现 $pending_tasks 个待完成任务" >&2
  fi
fi
