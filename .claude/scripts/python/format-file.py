#!/usr/bin/env python3
"""
Claude Code Hook: 自动格式化代码文件

在 Write/Edit 操作后自动运行，根据文件类型选择对应的格式化工具：
- Python (.py): black + isort
- TypeScript/JavaScript (.ts, .tsx, .js, .jsx): prettier
- Vue (.vue): prettier
- C/C++ (.c, .cpp, .h, .hpp, .cc, .cxx): clang-format
- Java (.java): google-java-format
- C# (.cs): dotnet format
"""

import json
import platform
import shutil
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list, timeout: int = 30) -> bool:
    """执行命令并返回是否成功"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return False


def format_python(file_path: str) -> bool:
    """使用 black + isort 格式化 Python 文件"""
    success = True

    # isort 排序导入
    if shutil.which("isort"):
        success = run_command(["isort", "--quiet", file_path]) and success

    # black 格式化
    if shutil.which("black"):
        success = run_command(["black", "--quiet", file_path]) and success

    return success


def format_frontend(file_path: str) -> bool:
    """使用 prettier 格式化前端文件"""
    # Windows 上 npx 需要 .cmd 扩展
    npx_cmd = "npx.cmd" if platform.system() == "Windows" else "npx"

    if not shutil.which(npx_cmd.replace(".cmd", "")):
        return False

    return run_command([npx_cmd, "prettier", "--write", file_path])


def format_cpp(file_path: str) -> bool:
    """使用 clang-format 格式化 C/C++ 文件"""
    if not shutil.which("clang-format"):
        return False

    return run_command(["clang-format", "-i", file_path])


def format_java(file_path: str) -> bool:
    """使用 google-java-format 格式化 Java 文件"""
    # 尝试多种可能的命令名称
    for cmd in ["google-java-format", "gjf"]:
        if shutil.which(cmd):
            return run_command([cmd, "-i", file_path], timeout=60)

    # 尝试使用 jar 方式
    # 用户可能通过 java -jar 方式运行
    return False


def format_csharp(file_path: str) -> bool:
    """使用 dotnet format 格式化 C# 文件"""
    if not shutil.which("dotnet"):
        return False

    # dotnet format 需要在项目目录中运行
    # 尝试找到最近的 .csproj 或 .sln 文件
    path = Path(file_path)
    current = path.parent

    # 向上查找项目文件
    for _ in range(10):  # 最多向上查找 10 层
        if list(current.glob("*.csproj")) or list(current.glob("*.sln")):
            return run_command(
                ["dotnet", "format", "--include", str(path)],
                timeout=60
            )
        if current.parent == current:
            break
        current = current.parent

    return False


# 文件扩展名到格式化函数的映射
FORMATTERS = {
    # Python
    ".py": format_python,

    # 前端
    ".ts": format_frontend,
    ".tsx": format_frontend,
    ".js": format_frontend,
    ".jsx": format_frontend,
    ".vue": format_frontend,
    ".css": format_frontend,
    ".scss": format_frontend,
    ".less": format_frontend,
    ".json": format_frontend,
    ".yaml": format_frontend,
    ".yml": format_frontend,
    ".md": format_frontend,

    # C/C++
    ".c": format_cpp,
    ".cpp": format_cpp,
    ".cc": format_cpp,
    ".cxx": format_cpp,
    ".h": format_cpp,
    ".hpp": format_cpp,
    ".hxx": format_cpp,

    # Java
    ".java": format_java,

    # C#
    ".cs": format_csharp,
}


def main():
    # 从 stdin 读取 Claude Code 传入的 JSON
    try:
        input_data = json.load(sys.stdin)
        file_path = input_data.get("tool_input", {}).get("file_path", "")
    except (json.JSONDecodeError, KeyError):
        sys.exit(0)  # 静默退出

    if not file_path:
        sys.exit(0)

    path = Path(file_path)
    suffix = path.suffix.lower()

    # 根据文件类型选择格式化工具
    formatter = FORMATTERS.get(suffix)
    if formatter and formatter(file_path):
        print(f"[Hook] Formatted: {path.name}")

    sys.exit(0)


if __name__ == "__main__":
    main()
