#!/bin/bash
# PreCompact Hook - 上下文压缩前保存状态
#
# 在 Claude 压缩上下文前运行，保存重要状态避免丢失。

SESSIONS_DIR=".claude/sessions"
COMPACTION_LOG="$SESSIONS_DIR/compaction-log.txt"

mkdir -p "$SESSIONS_DIR"

# 记录压缩事件
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Context compaction triggered" >> "$COMPACTION_LOG"

echo "[PreCompact] 上下文压缩前状态已保存" >&2
