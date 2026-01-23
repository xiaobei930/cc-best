#!/usr/bin/env python3
"""
Claude Code Hook: 命令安全验证

在 Bash 命令执行前检查危险模式：
- 阻止危险的删除命令
- 阻止敏感文件操作
- 记录所有命令到日志

Exit codes:
- 0: 允许执行
- 2: 阻止执行（会反馈给 Claude）
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# 危险命令模式（正则表达式）
DANGEROUS_PATTERNS = [
    r"rm\s+(-rf|-fr|--force).*(/|~|\$HOME)",  # 危险的 rm
    r"chmod\s+777",  # 过于宽松的权限
    r">\s*/dev/sd[a-z]",  # 直接写磁盘
    r"mkfs\.",  # 格式化磁盘
    r"dd\s+if=.*of=/dev/",  # dd 写入设备
    r":(){ :|:& };:",  # Fork bomb
    r"del\s+/s\s+/q\s+[A-Z]:\\",  # Windows 危险删除
    r"rmdir\s+/s\s+/q\s+[A-Z]:\\",  # Windows 危险删除
    r"format\s+[A-Z]:",  # Windows 格式化
]

# 需要确认的敏感操作（警告但不阻止）
SENSITIVE_PATTERNS = [
    r"git\s+push.*--force",
    r"git\s+reset\s+--hard",
    r"drop\s+database",
    r"truncate\s+table",
]

# 日志目录
LOG_DIR = Path(".claude/logs")


def log_command(command: str, blocked: bool, reason: str = ""):
    """记录命令到日志文件"""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOG_DIR / f"commands_{datetime.now():%Y%m%d}.log"

    entry = {
        "timestamp": datetime.now().isoformat(),
        "command": command[:200],  # 截断过长命令
        "blocked": blocked,
        "reason": reason,
    }

    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def check_command(command: str) -> tuple[bool, str]:
    """
    检查命令是否危险

    Returns:
        (is_blocked, reason)
    """
    # 检查危险模式
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            return True, f"匹配危险模式: {pattern}"

    # 检查敏感操作（记录但不阻止）
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            print(f"[Hook 警告] 敏感操作: {command[:50]}...", file=sys.stderr)

    return False, ""


def main():
    try:
        input_data = json.load(sys.stdin)
        command = input_data.get("tool_input", {}).get("command", "")
    except (json.JSONDecodeError, KeyError):
        sys.exit(0)

    if not command:
        sys.exit(0)

    # 检查命令
    is_blocked, reason = check_command(command)

    # 记录日志
    log_command(command, is_blocked, reason)

    if is_blocked:
        # 输出反馈给 Claude
        print(f"[安全检查] 命令被阻止: {reason}", file=sys.stderr)
        print(f"命令: {command[:100]}...", file=sys.stderr)
        sys.exit(2)  # Exit code 2 = 阻止执行

    sys.exit(0)


if __name__ == "__main__":
    main()
