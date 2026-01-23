#!/usr/bin/env python3
"""
阻止随机创建 .md 文件
在 PreToolUse Write hook 中运行，防止意外创建不必要的 markdown 文件
"""

import os
import sys
import json

# 允许创建的 markdown 文件模式
ALLOWED_MD_PATTERNS = [
    # memory-bank 目录下的文档
    "memory-bank/",
    # .claude 配置目录
    ".claude/",
    # 标准文档文件
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE.md",
    "CODE_OF_CONDUCT.md",
    # 文档目录
    "docs/",
    "documentation/",
    # API 文档
    "api-docs/",
    # 规范文件
    "specs/",
    "spec/",
]

# 必须阻止的模式
BLOCKED_MD_PATTERNS = [
    # 随机临时文件
    "temp.md",
    "tmp.md",
    "test.md",
    "notes.md",
    "scratch.md",
    "untitled.md",
    # 项目根目录下的随机 md
    # (除非是允许的标准文件)
]


def is_allowed_path(file_path: str) -> bool:
    """检查文件路径是否被允许"""
    # 标准化路径
    normalized = file_path.replace("\\", "/").lower()

    # 不是 markdown 文件，允许
    if not normalized.endswith(".md"):
        return True

    # 检查是否匹配允许的模式
    for pattern in ALLOWED_MD_PATTERNS:
        if pattern.endswith("/"):
            # 目录模式
            if pattern.lower() in normalized:
                return True
        else:
            # 文件名模式
            if normalized.endswith(pattern.lower()):
                return True

    # 检查是否是被阻止的模式
    filename = os.path.basename(normalized)
    for blocked in BLOCKED_MD_PATTERNS:
        if filename == blocked.lower():
            return False

    # 默认阻止根目录下的随机 md 文件
    # 计算相对深度
    parts = normalized.split("/")
    if len(parts) <= 2:  # 根目录或一级目录
        print(f"[BlockMD] 阻止: 不允许在项目根目录创建随机 .md 文件: {file_path}", file=sys.stderr)
        print(f"[BlockMD] 提示: 文档应放在 docs/, memory-bank/, 或 .claude/ 目录下", file=sys.stderr)
        return False

    return True


def main():
    # 从 stdin 读取 JSON 输入（Claude Code 标准方式）
    try:
        input_data = json.load(sys.stdin)
        file_path = input_data.get("tool_input", {}).get("file_path", "")
    except (json.JSONDecodeError, KeyError, TypeError):
        sys.exit(0)

    if not file_path:
        sys.exit(0)

    if not is_allowed_path(file_path):
        sys.exit(2)  # Exit code 2 = 阻止执行

    sys.exit(0)


if __name__ == "__main__":
    main()
