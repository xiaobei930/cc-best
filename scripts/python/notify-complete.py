#!/usr/bin/env python3
"""
Claude Code Hook: 任务完成通知

当 Claude 完成响应时发送桌面通知。
适用于长时间运行的任务。

支持平台：
- Windows: 使用 PowerShell 或 msg 命令
- macOS: 使用 osascript
- Linux: 使用 notify-send
"""

import json
import platform
import subprocess
import sys


def send_notification(title: str, message: str):
    """发送桌面通知"""
    system = platform.system()

    try:
        if system == "Windows":
            # Windows: 使用 msg 命令发送简单通知
            subprocess.run(
                ["msg", "*", f"{title}: {message}"],
                capture_output=True,
                timeout=5
            )
        elif system == "Darwin":
            # macOS
            subprocess.run([
                "osascript", "-e",
                f'display notification "{message}" with title "{title}"'
            ], timeout=5)
        else:
            # Linux
            subprocess.run([
                "notify-send", title, message
            ], timeout=5)
    except Exception:
        pass  # 通知失败不影响主流程


def main():
    try:
        input_data = json.load(sys.stdin)
        # Stop 事件的数据结构
        stop_reason = input_data.get("stop_reason", "unknown")
    except (json.JSONDecodeError, KeyError):
        stop_reason = "unknown"

    # 根据停止原因定制消息
    messages = {
        "end_turn": "Claude 已完成响应",
        "max_tokens": "达到 token 上限",
        "stop_sequence": "遇到停止序列",
        "unknown": "任务已完成",
    }

    message = messages.get(stop_reason, "任务已完成")
    send_notification("Claude Code", message)

    sys.exit(0)


if __name__ == "__main__":
    main()
