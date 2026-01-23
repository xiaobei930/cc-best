#!/usr/bin/env python3
"""
Claude Code 模板验证脚本
测试模板配置是否符合预期
"""

import os
import json
import yaml
import re
from pathlib import Path

# 颜色输出
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def ok(msg): print(f"{Colors.GREEN}[PASS]{Colors.END} {msg}")
def fail(msg): print(f"{Colors.RED}[FAIL]{Colors.END} {msg}")
def warn(msg): print(f"{Colors.YELLOW}[WARN]{Colors.END} {msg}")
def info(msg): print(f"{Colors.BLUE}[INFO]{Colors.END} {msg}")

def test_structure():
    """测试模板结构完整性"""
    print("\n" + "="*50)
    print("1. 结构完整性测试")
    print("="*50)

    required_files = [
        "CLAUDE.md",
        ".claude/settings.json",
        ".claude/settings.local.json.example",
        "rules/methodology.md",
        "rules/security.md",
        "commands/pm.md",
        "commands/lead.md",
        "commands/dev.md",
        "commands/qa.md",
        ".gitignore",
    ]

    base = Path(__file__).parent.parent.parent
    all_exist = True

    for f in required_files:
        path = base / f
        if path.exists():
            ok(f"存在: {f}")
        else:
            fail(f"缺失: {f}")
            all_exist = False

    return all_exist

def test_json_configs():
    """测试 JSON 配置文件格式"""
    print("\n" + "="*50)
    print("2. JSON 配置格式测试")
    print("="*50)

    base = Path(__file__).parent.parent.parent
    json_files = [
        ".claude/settings.json",
        ".claude/settings.local.json.example",
    ]

    all_valid = True
    for f in json_files:
        path = base / f
        if not path.exists():
            warn(f"跳过: {f} (文件不存在)")
            continue
        try:
            with open(path, 'r', encoding='utf-8') as fp:
                json.load(fp)
            ok(f"JSON 有效: {f}")
        except json.JSONDecodeError as e:
            fail(f"JSON 无效: {f} - {e}")
            all_valid = False

    return all_valid

def test_hookify_rules():
    """测试 Hookify 规则"""
    print("\n" + "="*50)
    print("3. Hookify 规则测试")
    print("="*50)

    base = Path(__file__).parent.parent.parent
    hookify_dir = base / ".claude"

    hookify_files = list(hookify_dir.glob("hookify.*.local.md"))

    if not hookify_files:
        warn("未找到 hookify 规则文件")
        return True

    all_valid = True
    for hf in hookify_files:
        info(f"检查: {hf.name}")
        try:
            content = hf.read_text(encoding='utf-8')
            match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
            if not match:
                fail(f"  无效的 frontmatter 格式")
                all_valid = False
                continue

            frontmatter = yaml.safe_load(match.group(1))

            # 检查必需字段
            required = ['name', 'enabled', 'event']
            for field in required:
                if field not in frontmatter:
                    fail(f"  缺少字段: {field}")
                    all_valid = False
                else:
                    ok(f"  {field}: {frontmatter[field]}")

            # 验证 pattern 是有效的正则表达式
            if 'pattern' in frontmatter:
                try:
                    re.compile(frontmatter['pattern'])
                    ok(f"  pattern: 正则有效")
                except re.error as e:
                    fail(f"  pattern: 正则无效 - {e}")
                    all_valid = False

        except Exception as e:
            fail(f"  解析失败: {e}")
            all_valid = False

    return all_valid

def test_workflow_consistency():
    """测试工作流一致性"""
    print("\n" + "="*50)
    print("4. 工作流一致性测试")
    print("="*50)

    base = Path(__file__).parent.parent.parent

    # 检查 CLAUDE.md 和 methodology.md 中的工作流是否一致
    claude_md = base / "CLAUDE.md"
    methodology = base / "rules/methodology.md"

    # 关键角色列表
    key_roles = ['/pm', '/lead', '/dev', '/qa']

    all_consistent = True
    for f in [claude_md, methodology]:
        if not f.exists():
            warn(f"跳过: {f.name}")
            continue
        content = f.read_text(encoding='utf-8')

        # 检查所有关键角色是否存在
        missing_roles = [role for role in key_roles if role not in content]

        if not missing_roles:
            ok(f"工作流包含所有关键角色: {f.name}")
        else:
            fail(f"工作流缺少角色 {missing_roles}: {f.name}")
            all_consistent = False

    return all_consistent

def test_permissions():
    """测试权限配置"""
    print("\n" + "="*50)
    print("5. 权限配置测试")
    print("="*50)

    base = Path(__file__).parent.parent.parent
    settings_example = base / ".claude/settings.local.json.example"

    if not settings_example.exists():
        warn("settings.local.json.example 不存在")
        return True

    try:
        with open(settings_example, 'r', encoding='utf-8') as f:
            config = json.load(f)

        permissions = config.get('permissions', {})
        allow = permissions.get('allow', [])
        deny = permissions.get('deny', [])

        # 检查关键权限
        required_allow = ['Read', 'Write', 'Edit', 'Bash']
        required_deny = ['Bash(rm -rf /)']

        for perm in required_allow:
            if perm in allow:
                ok(f"允许: {perm}")
            else:
                warn(f"未配置允许: {perm}")

        for perm in required_deny:
            if perm in deny:
                ok(f"拒绝: {perm}")
            else:
                warn(f"未配置拒绝: {perm}")

        return True
    except Exception as e:
        fail(f"解析失败: {e}")
        return False

def test_commands():
    """测试命令文件格式"""
    print("\n" + "="*50)
    print("6. 命令文件格式测试")
    print("="*50)

    base = Path(__file__).parent.parent.parent
    commands_dir = base / "commands"

    if not commands_dir.exists():
        warn("commands 目录不存在")
        return True

    all_valid = True
    for cmd_file in commands_dir.glob("*.md"):
        content = cmd_file.read_text(encoding='utf-8')

        # 检查是否有 frontmatter
        has_frontmatter = content.startswith('---')

        # 检查是否有角色/职责描述
        has_role = bool(re.search(r'(角色|职责|Role|Responsibility)', content, re.IGNORECASE))

        if has_frontmatter and has_role:
            ok(f"{cmd_file.name}")
        elif has_frontmatter:
            warn(f"{cmd_file.name} - 缺少角色描述")
        else:
            warn(f"{cmd_file.name} - 缺少 frontmatter")

    return all_valid

def main():
    print("="*50)
    print("Claude Code 模板验证")
    print("="*50)

    results = []

    results.append(("结构完整性", test_structure()))
    results.append(("JSON 配置", test_json_configs()))
    results.append(("Hookify 规则", test_hookify_rules()))
    results.append(("工作流一致性", test_workflow_consistency()))
    results.append(("权限配置", test_permissions()))
    results.append(("命令文件", test_commands()))

    print("\n" + "="*50)
    print("测试结果汇总")
    print("="*50)

    for name, passed in results:
        status = f"{Colors.GREEN}PASS{Colors.END}" if passed else f"{Colors.RED}FAIL{Colors.END}"
        print(f"  {name}: {status}")

    all_passed = all(r[1] for r in results)
    print("\n" + ("="*50))
    if all_passed:
        print(f"{Colors.GREEN}所有测试通过！{Colors.END}")
    else:
        print(f"{Colors.RED}部分测试失败，请检查上述输出{Colors.END}")

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())
