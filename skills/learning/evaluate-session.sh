#!/bin/bash
# 持续学习 - 会话评估器
# 在 SessionEnd hook 时运行，从会话中提取可复用的模式
#
# Hook 配置 (在 settings.local.json 中):
# {
#   "hooks": {
#     "SessionEnd": [{
#       "matcher": "*",
#       "hooks": [{
#         "type": "command",
#         "command": "bash skills/learning/evaluate-session.sh"
#       }]
#     }]
#   }
# }

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"
LEARNED_PATH="${LEARNED_PATH:-.claude/learned}"
MIN_SESSION_LENGTH=10

# 加载配置
if [ -f "$CONFIG_FILE" ]; then
  if command -v jq >/dev/null 2>&1; then
    MIN_SESSION_LENGTH=$(jq -r '.min_session_length // 10' "$CONFIG_FILE")
    LEARNED_PATH=$(jq -r '.learned_skills_path // ".claude/learned/"' "$CONFIG_FILE")
  fi
fi

# 确保目录存在
mkdir -p "$LEARNED_PATH"/{errors,debugging,workarounds,patterns,project}

# 获取会话路径
transcript_path="${CLAUDE_TRANSCRIPT_PATH:-}"

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# 计算消息数
message_count=$(grep -c '"type":"user"' "$transcript_path" 2>/dev/null || echo "0")

# 短会话跳过
if [ "$message_count" -lt "$MIN_SESSION_LENGTH" ]; then
  echo "[ContinuousLearning] 会话过短 ($message_count 消息)，跳过" >&2
  exit 0
fi

# 提示评估
echo "[ContinuousLearning] 会话有 $message_count 消息 - 评估可提取模式" >&2
echo "[ContinuousLearning] 检查是否有:" >&2
echo "[ContinuousLearning]   - 解决的复杂 Bug (→ errors/)" >&2
echo "[ContinuousLearning]   - 调试技巧 (→ debugging/)" >&2
echo "[ContinuousLearning]   - 变通方案 (→ workarounds/)" >&2
echo "[ContinuousLearning]   - 可复用模式 (→ patterns/)" >&2
echo "[ContinuousLearning]   - 项目知识 (→ project/)" >&2
echo "[ContinuousLearning] 保存位置: $LEARNED_PATH" >&2
