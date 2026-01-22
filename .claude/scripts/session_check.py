#!/usr/bin/env python3
"""
Claude Code Hook: 会话启动检查

在每次会话开始时自动执行健康检查：
1. 检查 CLAUDE.md 文件大小（过大会影响性能）
2. 检查 memory-bank 文档是否过期
3. 提醒未完成的任务

输出提示信息供 Claude 参考。
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# 配置
PROJECT_ROOT = Path(".")
CLAUDE_MD_SIZE_WARN = 10 * 1024  # 10KB 警告阈值
CLAUDE_MD_SIZE_LIMIT = 15 * 1024  # 15KB 建议精简
DOC_STALE_DAYS = 7  # 文档超过 7 天未更新视为过期


def check_claude_md():
    """检查 CLAUDE.md 文件"""
    claude_md = PROJECT_ROOT / "CLAUDE.md"
    issues = []

    if not claude_md.exists():
        issues.append("CLAUDE.md 不存在，建议运行 /init 初始化")
        return issues

    size = claude_md.stat().st_size
    if size > CLAUDE_MD_SIZE_LIMIT:
        issues.append(f"CLAUDE.md 过大 ({size // 1024}KB)，建议精简到 15KB 以内")
    elif size > CLAUDE_MD_SIZE_WARN:
        issues.append(f"CLAUDE.md 较大 ({size // 1024}KB)，考虑精简")

    return issues


def check_memory_bank():
    """检查 memory-bank 文档状态"""
    memory_bank = PROJECT_ROOT / "memory-bank"
    issues = []

    if not memory_bank.exists():
        # 项目初期可能没有 memory-bank
        return issues

    now = datetime.now()
    stale_threshold = now - timedelta(days=DOC_STALE_DAYS)

    key_docs = ["progress.md", "architecture.md", "tech-stack.md"]

    for doc_name in key_docs:
        doc_path = memory_bank / doc_name
        if doc_path.exists():
            mtime = datetime.fromtimestamp(doc_path.stat().st_mtime)
            if mtime < stale_threshold:
                days_old = (now - mtime).days
                issues.append(f"{doc_name} 已 {days_old} 天未更新，可能需要同步")

    return issues


def check_git_status():
    """检查 Git 状态"""
    import subprocess

    issues = []

    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=PROJECT_ROOT,
        )
        if result.returncode == 0:
            changes = result.stdout.strip()
            if changes:
                line_count = len(changes.split("\n"))
                if line_count > 10:
                    issues.append(f"有 {line_count} 个未提交的变更，建议定期提交")
    except Exception:
        pass

    return issues


def main():
    """主函数"""
    all_issues = []

    # 执行各项检查
    all_issues.extend(check_claude_md())
    all_issues.extend(check_memory_bank())
    all_issues.extend(check_git_status())

    # 输出检查结果（会显示在 Claude 的上下文中）
    if all_issues:
        print("\n[Session Check]")
        for issue in all_issues:
            print(f"  - {issue}")
        print()
    else:
        # 一切正常时静默
        pass

    sys.exit(0)


if __name__ == "__main__":
    main()
