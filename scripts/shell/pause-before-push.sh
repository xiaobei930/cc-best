#!/bin/bash
# Git push 前暂停确认
# 在 PreToolUse Bash hook 中运行，检测 git push 命令

# 获取即将执行的命令
COMMAND="${CLAUDE_TOOL_INPUT:-}"

# 检查是否是 git push 命令
if echo "$COMMAND" | grep -qE 'git\s+push'; then
  # 检查是否是推送到 main/master 分支
  if echo "$COMMAND" | grep -qE 'git\s+push.*\s+(main|master)'; then
    echo "[GitPush] 警告: 正在推送到主分支，请确认：" >&2
    echo "[GitPush]   - 所有测试已通过？" >&2
    echo "[GitPush]   - 代码已审查？" >&2
    echo "[GitPush]   - CI/CD 流水线正常？" >&2
  else
    echo "[GitPush] 检测到 git push 命令，确认推送..." >&2
  fi

  # 检查是否有未暂存的更改
  if git diff --quiet 2>/dev/null; then
    :
  else
    echo "[GitPush] 提示: 存在未暂存的更改" >&2
  fi

  # 检查是否有未提交的更改
  if git diff --cached --quiet 2>/dev/null; then
    :
  else
    echo "[GitPush] 提示: 存在已暂存但未提交的更改" >&2
  fi
fi

exit 0
