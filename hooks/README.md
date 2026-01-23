# Hooks 配置指南

Claude Code 钩子系统允许在特定事件触发时执行自定义脚本，实现自动化工作流。

## 快速开始

```bash
# 复制示例配置
cp .claude/settings.local.json.example .claude/settings.local.json
```

## 钩子类型（10 个生命周期事件）

| 钩子事件            | 触发时机                          | 典型用途                 |
| ------------------- | --------------------------------- | ------------------------ |
| `Setup`             | `--init` / `--maintenance` 启动时 | 项目初始化、环境配置     |
| `SessionStart`      | 会话启动时                        | 环境检查、加载上下文     |
| `UserPromptSubmit`  | 用户提交提示时                    | 验证/添加上下文          |
| `PreToolUse`        | 工具执行**前**                    | 允许、拒绝或修改工具调用 |
| `PermissionRequest` | 权限对话框出现时                  | 自动批准/拒绝权限请求    |
| `PostToolUse`       | 工具执行**后**                    | 验证结果、运行后检查     |
| `Stop`              | Claude 完成响应时                 | 决定是否继续             |
| `SubagentStop`      | 子代理完成时                      | 评估子代理任务是否完成   |
| `PreCompact`        | 上下文压缩前                      | 保存重要状态             |
| `SessionEnd`        | 会话终止时                        | 清理任务、日志记录       |

## 钩子脚本分类

### 安全防护 (PreToolUse)

| 脚本                   | 功能             | 阻止内容                |
| ---------------------- | ---------------- | ----------------------- |
| `validate_command.py`  | 验证危险命令     | `rm -rf /`, `format` 等 |
| `pause_before_push.sh` | git push 前暂停  | 给予审查时间            |
| `protect_files.py`     | 保护敏感文件     | `.env`, `.key`, `.git/` |
| `block_random_md.py`   | 阻止随机创建 .md | 非必要文档              |

### 代码质量 (PostToolUse)

| 脚本                   | 功能                | 触发条件               |
| ---------------------- | ------------------- | ---------------------- |
| `format_file.py`       | 自动格式化代码      | Write/Edit             |
| `check_console_log.py` | 检查 console.log    | Edit                   |
| `typescript_check.sh`  | TypeScript 类型检查 | Write/Edit on .ts/.tsx |

### 会话生命周期

| 钩子         | 脚本                  | 触发时机       |
| ------------ | --------------------- | -------------- |
| SessionStart | `session_check.py`    | 新会话启动     |
| SessionStart | `session_start.sh`    | 加载上次上下文 |
| PreCompact   | `pre_compact.sh`      | 上下文压缩前   |
| Stop         | `session_end.sh`      | 会话结束       |
| Stop         | `evaluate-session.sh` | 提取可复用模式 |

### 策略性钩子

| 脚本                  | 功能         | 位置                                  |
| --------------------- | ------------ | ------------------------------------- |
| `suggest-compact.sh`  | 建议压缩时机 | `.claude/skills/strategic-compact/`   |
| `evaluate-session.sh` | 提取模式     | `.claude/skills/continuous-learning/` |

## 配置方式

### 方式 1: settings.local.json（推荐）

在 `.claude/settings.local.json` 中配置 `hooks` 字段：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/scripts/validate_command.py",
            "timeout": 5
          }
        ],
        "description": "验证危险命令"
      }
    ]
  }
}
```

### 方式 2: Hookify 规则文件

使用 `.claude/hookify.{name}.local.md` 文件定义规则：

```markdown
---
name: dangerous-commands
enabled: true
event: bash
action: block
pattern: "rm\\s+-rf\\s+/"
---

危险命令被阻止！
```

### 方式 3: hooks.json（插件兼容）

本目录的 `hooks.json` 使用 `${PLUGIN_ROOT}` 变量，适用于插件分发：

```json
{
  "command": "python ${PLUGIN_ROOT}/.claude/scripts/validate_command.py"
}
```

## 编写钩子脚本

### 脚本输入

钩子脚本通过 stdin 接收 JSON 格式的上下文信息：

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm run build"
  },
  "session_id": "xxx",
  "working_directory": "/path/to/project"
}
```

### 脚本输出

- **退出码 0**: 允许操作继续
- **退出码 2**: 阻止操作（PreToolUse）并向 Claude 反馈
- **其他退出码**: 发出警告但不阻止
- **stdout 输出**: 作为反馈信息显示给 Claude

### 示例脚本

```python
#!/usr/bin/env python3
import sys
import json
import re

DANGEROUS_PATTERNS = [
    r'rm\s+-rf\s+[/~]',
    r'git\s+push\s+--force',
]

def main():
    input_data = json.loads(sys.stdin.read())
    command = input_data.get('tool_input', {}).get('command', '')

    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command):
            print(f"危险命令被阻止: {pattern}")
            sys.exit(2)  # Exit code 2 = 阻止操作

    sys.exit(0)

if __name__ == '__main__':
    main()
```

## 最佳实践

### 超时设置

- 简单检查: 1-3 秒
- 格式化/编译: 10-30 秒
- 网络操作: 根据需要设置（单位：秒）

### 错误处理

- 脚本应优雅处理异常
- 提供清晰的错误信息
- 避免阻止正常操作

### 性能考虑

- 避免在频繁触发的钩子中执行耗时操作
- 考虑使用缓存减少重复计算
- PostToolUse 比 PreToolUse 更适合耗时操作

### 调试技巧

```bash
# 测试钩子脚本
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | python .claude/scripts/validate_command.py
echo $?  # 检查退出码
```

## 文件组织

```
.claude/
├── settings.local.json                          # 主要钩子配置（运行时）
├── settings.local.json.example                  # 配置示例（模板）
├── hookify.*.local.md                           # Hookify 规则文件（运行时）
└── scripts/
    ├── validate_command.py                      # 命令验证
    ├── protect_files.py                         # 文件保护
    ├── format_file.py                           # 自动格式化
    ├── check_console_log.py                     # console.log 检查
    ├── typescript_check.sh                      # TypeScript 检查
    ├── pause_before_push.sh                     # Push 前确认
    ├── session_check.py                         # 会话检查
    ├── session_start.sh                         # 会话启动
    ├── session_end.sh                           # 会话结束
    └── pre_compact.sh                           # 压缩前处理

hooks/
├── hooks.json                                   # 插件兼容配置
└── README.md                                    # 本文档
```

## 注意事项

1. **Hookify 规则文件必须以 `.local.md` 结尾**，否则不会被识别
2. **`.local.json` 和 `.local.md` 不应提交到 Git**，使用 `.example` 文件作为模板
3. **钩子脚本需要可执行权限**（Linux/macOS）
4. **Windows 下使用 Git Bash** 或 WSL 执行 shell 脚本
5. **钩子在会话启动时加载**，修改后需重启会话生效
