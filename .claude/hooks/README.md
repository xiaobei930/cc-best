# Hooks 配置指南

Claude Code 钩子系统允许在特定事件触发时执行自定义脚本，实现自动化工作流。

## 钩子类型

| 钩子事件 | 触发时机 | 典型用途 |
|----------|----------|----------|
| `PreToolUse` | 工具执行**前** | 阻止危险命令、验证操作 |
| `PostToolUse` | 工具执行**后** | 自动格式化、类型检查 |
| `SessionStart` | 会话启动时 | 环境检查、加载上下文 |
| `PreCompact` | 上下文压缩前 | 保存重要状态 |
| `Stop` | 会话结束时 | 持久化状态、学习记录 |
| `UserPromptSubmit` | 用户提交提示时 | 提示预处理 |

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
            "timeout": 5000
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

⛔ 危险命令被阻止！
```

## 推荐钩子配置

### 1. 安全防护钩子

#### 危险命令阻止
```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/validate_command.py",
    "timeout": 5000
  }],
  "description": "验证危险命令"
}
```

阻止的命令模式：
- `rm -rf /` / `rm -rf ~` - 删除系统/用户目录
- `git push --force` - 覆盖远程历史
- `git reset --hard` - 丢失本地更改
- `chmod 777` - 开放所有权限
- `mkfs.*` - 格式化磁盘

#### 敏感文件保护
```json
{
  "matcher": "Write|Edit",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/protect_files.py",
    "timeout": 3000
  }],
  "description": "保护敏感文件"
}
```

保护的文件：
- `.env` / `.env.*` - 环境变量
- `credentials.*` - 凭证文件
- `*.pem` / `*.key` - 密钥文件

### 2. 代码质量钩子

#### 自动格式化
```json
{
  "matcher": "Write|Edit",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/format_file.py",
    "timeout": 30000
  }],
  "description": "自动格式化代码"
}
```

#### TypeScript 类型检查
```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "bash .claude/scripts/typescript_check.sh",
    "timeout": 10000
  }],
  "description": "TypeScript 类型检查"
}
```

#### console.log 检查
```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/check_console_log.py",
    "timeout": 3000
  }],
  "description": "检查 console.log 语句"
}
```

### 3. 工作流钩子

#### Git Push 前确认
```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "command": "bash .claude/scripts/pause_before_push.sh",
    "timeout": 5000
  }],
  "description": "git push 前暂停确认"
}
```

#### 阻止随机创建 .md 文件
```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/block_random_md.py",
    "timeout": 3000
  }],
  "description": "阻止随机创建 .md 文件"
}
```

### 4. 会话管理钩子

#### 会话启动检查
```json
{
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "python .claude/scripts/session_check.py",
    "timeout": 5000
  }],
  "description": "会话启动健康检查"
}
```

#### 会话结束持久化
```json
{
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "bash .claude/scripts/session_end.sh",
    "timeout": 5000
  }],
  "description": "会话结束时持久化状态"
}
```

### 5. 上下文管理钩子

#### 策略性压缩建议
```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "bash .claude/skills/strategic-compact/suggest-compact.sh",
    "timeout": 3000
  }],
  "description": "策略性压缩建议"
}
```

#### 压缩前保存状态
```json
{
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "bash .claude/scripts/pre_compact.sh",
    "timeout": 5000
  }],
  "description": "压缩前保存状态"
}
```

## Hookify 规则示例

### iterate 模式检查（Stop 事件）

`.claude/hookify.iterate-continue.local.md`:
```markdown
---
name: iterate-continue-check
enabled: true
event: stop
action: warn
pattern: .*
---

# /iterate 模式检查

在自驱动模式下，只有以下情况才能停止：
- 用户主动中断
- 待办任务全部完成
- 致命错误
- 需要用户决策的外部依赖

如果还有待办任务，请继续执行！
```

### 危险命令阻止（Bash 事件）

`.claude/hookify.dangerous-commands.local.md`:
```markdown
---
name: dangerous-commands
enabled: true
event: bash
action: block
pattern: "rm\\s+-rf\\s+[/~]|git\\s+push\\s+--force|git\\s+reset\\s+--hard"
---

⛔ 危险命令被阻止！
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
- **退出码非 0**: 阻止操作（PreToolUse）或发出警告
- **stdout 输出**: 作为反馈信息显示给 Claude

### 示例脚本

`validate_command.py`:
```python
#!/usr/bin/env python3
import sys
import json
import re

# 危险命令模式
DANGEROUS_PATTERNS = [
    r'rm\s+-rf\s+[/~]',
    r'git\s+push\s+--force',
    r'git\s+reset\s+--hard',
    r'chmod\s+777',
]

def main():
    input_data = json.loads(sys.stdin.read())
    command = input_data.get('tool_input', {}).get('command', '')

    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command):
            print(f"⛔ 危险命令被阻止: {pattern}")
            sys.exit(1)

    sys.exit(0)

if __name__ == '__main__':
    main()
```

## 最佳实践

### 1. 超时设置
- 简单检查: 1000-3000ms
- 格式化/编译: 10000-30000ms
- 网络操作: 根据需要设置

### 2. 错误处理
- 脚本应优雅处理异常
- 提供清晰的错误信息
- 避免阻止正常操作

### 3. 性能考虑
- 避免在频繁触发的钩子中执行耗时操作
- 考虑使用缓存减少重复计算
- PostToolUse 比 PreToolUse 更适合耗时操作

### 4. 调试技巧
```bash
# 测试钩子脚本
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | python .claude/scripts/validate_command.py
echo $?  # 检查退出码
```

## 文件组织

```
.claude/
├── settings.local.json      # 主要钩子配置
├── hookify.*.local.md       # Hookify 规则文件
├── hooks/
│   └── README.md            # 本文档
└── scripts/
    ├── validate_command.py  # 命令验证
    ├── protect_files.py     # 文件保护
    ├── format_file.py       # 自动格式化
    ├── check_console_log.py # console.log 检查
    ├── typescript_check.sh  # TypeScript 检查
    ├── pause_before_push.sh # Push 前确认
    ├── session_check.py     # 会话检查
    ├── session_start.sh     # 会话启动
    ├── session_end.sh       # 会话结束
    └── pre_compact.sh       # 压缩前处理
```

## 注意事项

1. **Hookify 规则文件必须以 `.local.md` 结尾**，否则不会被识别
2. **settings.local.json 不应提交到 Git**，使用 .example 文件作为模板
3. **钩子脚本需要可执行权限**（Linux/macOS）
4. **Windows 下使用 Git Bash** 或 WSL 执行 shell 脚本
