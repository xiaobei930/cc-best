#!/usr/bin/env python3
"""
Claude Code Hook: 敏感文件保护

在 Edit/Write 操作前检查目标文件：
- 阻止修改 .env 和密钥文件
- 阻止修改锁定文件（package-lock.json 等）
- 阻止修改 .git 目录

Exit codes:
- 0: 允许执行
- 2: 阻止执行
"""

import json
import sys
from pathlib import Path

# 禁止修改的文件/目录模式
PROTECTED_PATTERNS = [
    # 取消注释以启用保护
    # ".env",
    # ".env.local",
    # ".env.production",
    # "*.key",
    # "*.pem",
    # "credentials.json",
    # "secrets.json",
    ".git/",
]

# 需要警告但允许的文件
WARN_PATTERNS = [
    "*.md",  # 文档文件修改时提醒
]


def is_protected(file_path: str) -> tuple[bool, str]:
    """检查文件是否受保护"""
    path = Path(file_path)
    name = path.name.lower()
    path_str = str(path).lower()

    for pattern in PROTECTED_PATTERNS:
        if pattern.startswith("*"):
            # 通配符匹配扩展名
            if name.endswith(pattern[1:]):
                return True, f"受保护的文件类型: {pattern}"
        elif pattern.endswith("/"):
            # 目录匹配
            if pattern[:-1] in path_str:
                return True, f"受保护的目录: {pattern}"
        else:
            # 精确匹配
            if name == pattern.lower():
                return True, f"受保护的文件: {pattern}"

    return False, ""


def main():
    try:
        input_data = json.load(sys.stdin)
        file_path = input_data.get("tool_input", {}).get("file_path", "")
    except (json.JSONDecodeError, KeyError):
        sys.exit(0)

    if not file_path:
        sys.exit(0)

    is_blocked, reason = is_protected(file_path)

    if is_blocked:
        print(f"[文件保护] 操作被阻止: {reason}", file=sys.stderr)
        print(f"文件: {file_path}", file=sys.stderr)
        print("如果确实需要修改，请手动操作。", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
