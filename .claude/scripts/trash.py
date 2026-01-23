#!/usr/bin/env python3
"""
trash.py - 可恢复删除工具
借鉴自 @steipete/agent-scripts

功能：
- 将文件移动到回收站而非永久删除
- 支持跨平台（Windows/macOS/Linux）
- 文件名冲突时自动重命名
- 支持恢复查看

用法：
    python trash.py <file1> [file2 ...]
    python trash.py --list              # 列出回收站内容
    python trash.py --restore <file>    # 恢复文件（需要手动移回）
"""

import os
import sys
import shutil
import time
from pathlib import Path
from typing import List, Tuple


def get_trash_dir() -> Path:
    """获取回收站目录路径"""
    home = Path.home()

    if sys.platform == 'darwin':
        # macOS
        return home / '.Trash'
    elif sys.platform == 'win32':
        # Windows - 使用项目级回收站（系统回收站需要 COM 接口）
        # 优先使用当前目录下的 .trash，其次使用用户目录
        project_trash = Path.cwd() / '.trash'
        if project_trash.parent.exists():
            return project_trash
        return home / '.trash'
    else:
        # Linux
        xdg_data = os.environ.get('XDG_DATA_HOME', str(home / '.local' / 'share'))
        return Path(xdg_data) / 'Trash' / 'files'


def ensure_dir(dir_path: Path) -> None:
    """确保目录存在"""
    dir_path.mkdir(parents=True, exist_ok=True)


def unique_dest_path(trash_dir: Path, original_path: Path) -> Path:
    """生成唯一的目标路径，避免冲突"""
    base = original_path.name
    stem = original_path.stem
    ext = original_path.suffix

    candidate = trash_dir / base
    if not candidate.exists():
        return candidate

    # 添加时间戳和序号避免冲突
    nonce = int(time.time())
    for attempt in range(1, 10000):
        candidate = trash_dir / f"{stem}-{nonce}-{attempt}{ext}"
        if not candidate.exists():
            return candidate

    raise RuntimeError(f"无法为 {base} 找到可用的回收站路径")


def move_to_trash(source: Path, trash_dir: Path) -> Tuple[bool, str]:
    """将文件移动到回收站"""
    try:
        dest = unique_dest_path(trash_dir, source)
        shutil.move(str(source), str(dest))
        return True, f"已移动: {source} -> {dest}"
    except Exception as e:
        return False, f"移动失败 {source}: {e}"


def list_trash(trash_dir: Path) -> None:
    """列出回收站内容"""
    if not trash_dir.exists():
        print(f"回收站为空: {trash_dir}")
        return

    items = list(trash_dir.iterdir())
    if not items:
        print(f"回收站为空: {trash_dir}")
        return

    print(f"回收站内容 ({trash_dir}):")
    print("-" * 60)
    for item in sorted(items, key=lambda x: x.stat().st_mtime, reverse=True):
        stat = item.stat()
        mtime = time.strftime("%Y-%m-%d %H:%M", time.localtime(stat.st_mtime))
        size = stat.st_size if item.is_file() else 0
        type_indicator = "[DIR]" if item.is_dir() else "[FILE]"
        print(f"  {mtime}  {size:>10}  {type_indicator}  {item.name}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)

    trash_dir = get_trash_dir()

    # 处理命令行参数
    if sys.argv[1] == '--list':
        list_trash(trash_dir)
        sys.exit(0)

    if sys.argv[1] == '--restore':
        print(f"恢复功能提示：请手动从 {trash_dir} 移动文件到目标位置")
        list_trash(trash_dir)
        sys.exit(0)

    if sys.argv[1] == '--help':
        print(__doc__)
        sys.exit(0)

    # 移动文件到回收站
    ensure_dir(trash_dir)

    moved = 0
    errors = 0

    for arg in sys.argv[1:]:
        path = Path(arg).resolve()

        if not path.exists():
            print(f"警告: 文件不存在: {arg}")
            continue

        success, message = move_to_trash(path, trash_dir)
        print(message)

        if success:
            moved += 1
        else:
            errors += 1

    print(f"\n完成: 移动 {moved} 个，失败 {errors} 个")

    if errors > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
