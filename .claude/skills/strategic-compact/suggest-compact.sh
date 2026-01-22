#!/bin/bash
# 策略性压缩建议器
# 在 PreToolUse 时运行，在逻辑间隔建议压缩
#
# Hook 配置 (在 settings.local.json 中):
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "Edit|Write",
#       "hooks": [{
#         "type": "command",
#         "command": "bash .claude/skills/strategic-compact/suggest-compact.sh"
#       }]
#     }]
#   }
# }
#
# 压缩时机:
# - 会话运行较长时间
# - 大量工具调用
# - 从研究/探索转向实现
# - 计划已最终确定

# 使用进程 ID 跟踪工具调用计数
COUNTER_FILE="/tmp/claude-tool-count-$$"
THRESHOLD=${COMPACT_THRESHOLD:-50}

# 初始化或增加计数
if [ -f "$COUNTER_FILE" ]; then
  count=$(cat "$COUNTER_FILE")
  count=$((count + 1))
  echo "$count" > "$COUNTER_FILE"
else
  echo "1" > "$COUNTER_FILE"
  count=1
fi

# 达到阈值时建议压缩
if [ "$count" -eq "$THRESHOLD" ]; then
  echo "[StrategicCompact] 已进行 $THRESHOLD 次工具调用 - 如果正在切换阶段，考虑 /compact" >&2
fi

# 超过阈值后定期提醒
if [ "$count" -gt "$THRESHOLD" ] && [ $((count % 25)) -eq 0 ]; then
  echo "[StrategicCompact] 已进行 $count 次工具调用 - 如果上下文变得陈旧，是 /compact 的好时机" >&2
fi
