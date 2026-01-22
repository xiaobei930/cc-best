#!/usr/bin/env python3
"""
Claude Code Hook: 检查 console.log 语句

在编辑 JS/TS 文件后检查是否有 console.log 语句。
"""

import json
import re
import sys
from pathlib import Path


def main():
    # 从 stdin 读取工具输入
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    file_path = input_data.get("tool_input", {}).get("file_path", "")

    # 只检查 JS/TS 文件
    if not re.search(r"\.(js|jsx|ts|tsx)$", file_path):
        sys.exit(0)

    path = Path(file_path)
    if not path.exists():
        sys.exit(0)

    # 检查 console.log
    content = path.read_text(encoding="utf-8", errors="ignore")
    console_logs = []

    for i, line in enumerate(content.split("\n"), 1):
        if "console.log" in line and not line.strip().startswith("//"):
            console_logs.append(f"  Line {i}: {line.strip()[:60]}")

    if console_logs:
        print(f"[Hook] WARNING: console.log found in {file_path}", file=sys.stderr)
        for log in console_logs[:5]:  # 最多显示 5 个
            print(log, file=sys.stderr)
        if len(console_logs) > 5:
            print(f"  ... and {len(console_logs) - 5} more", file=sys.stderr)
        print("[Hook] Remove console.log before committing", file=sys.stderr)

    sys.exit(0)


if __name__ == "__main__":
    main()
