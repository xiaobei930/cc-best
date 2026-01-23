#!/bin/bash
# Stop Hook - 会话结束时持久化状态
#
# 在会话结束时运行，提醒保存重要信息。

MEMORY_BANK="memory-bank"

# 检查 progress.md 是否存在
if [ -f "$MEMORY_BANK/progress.md" ]; then
  echo "[SessionEnd] 请确保已更新 progress.md" >&2
fi

# 检查是否有未提交的变更
if git rev-parse --git-dir > /dev/null 2>&1; then
  uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$uncommitted" -gt 0 ]; then
    echo "[SessionEnd] 有 $uncommitted 个未提交的变更" >&2
  fi
fi
