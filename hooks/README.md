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

> **默认使用 Node.js 版本**，支持 Windows/macOS/Linux 跨平台运行。脚本位于 `.claude/scripts/node/hooks/` 目录。

### 安全防护 (PreToolUse)

| 脚本 (Node.js)            | 功能             | 阻止内容                |
| ------------------------- | ---------------- | ----------------------- |
| `validate-command.js`     | 验证危险命令     | `rm -rf /`, `format` 等 |
| `pause-before-push.js`    | git push 前暂停  | 给予审查时间            |
| `protect-files.js`        | 保护敏感文件     | `.env`, `.key`, `.git/` |
| `block-random-md.js`      | 阻止随机创建 .md | 非必要文档              |
| `long-running-warning.js` | 长时间运行警告   | dev server 等           |

### 代码质量 (PostToolUse)

| 脚本 (Node.js)         | 功能                | 触发条件               |
| ---------------------- | ------------------- | ---------------------- |
| `format-file.js`       | 自动格式化代码      | Write/Edit             |
| `check-console-log.js` | 检查 console.log    | Edit                   |
| `typescript-check.js`  | TypeScript 类型检查 | Write/Edit on .ts/.tsx |

### 会话生命周期

| 钩子         | 脚本 (Node.js)     | 触发时机       |
| ------------ | ------------------ | -------------- |
| SessionStart | `session-check.js` | 新会话启动     |
| SessionStart | `session-start.js` | 加载上次上下文 |
| PreCompact   | `pre-compact.js`   | 上下文压缩前   |
| Stop         | `session-end.js`   | 会话结束       |

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
            "command": "node .claude/scripts/node/hooks/validate-command.js",
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

危险命令被阻止！
```

### 方式 3: hooks.json（插件兼容）

本目录的 `hooks.json` 使用 `${PLUGIN_ROOT}` 变量，适用于插件分发：

```json
{
  "command": "node ${PLUGIN_ROOT}/.claude/scripts/node/hooks/validate-command.js"
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
# 测试钩子脚本（Node.js 版本）
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | node .claude/scripts/node/hooks/validate-command.js
echo $?  # 检查退出码
```

## 文件组织

```
.claude/
├── settings.local.json                          # 主要钩子配置（运行时）
├── settings.local.json.example                  # 配置示例（模板）
├── hookify.*.local.md                           # Hookify 规则文件（运行时）
└── scripts/
    ├── shell/                                   # Bash 脚本 (10)
    │   ├── init.sh, cleanup.sh
    │   ├── session-start.sh, session-end.sh
    │   └── pre-compact.sh, ...
    ├── python/                                  # Python 脚本 (9)
    │   ├── validate-command.py, protect-files.py
    │   ├── format-file.py, check-console-log.py
    │   └── session-check.py, ...
    └── node/                                    # Node.js（默认，跨平台）
        ├── lib/
        │   ├── utils.js                         # 27 个辅助函数
        │   └── package-manager.js               # 包管理器检测
        └── hooks/                               # 13 个生命周期钩子
            ├── validate-command.js              # 命令验证
            ├── protect-files.js                 # 文件保护
            ├── format-file.js                   # 自动格式化
            ├── check-console-log.js             # console.log 检查
            ├── typescript-check.js              # TypeScript 检查
            ├── pause-before-push.js             # Push 前确认
            ├── block-random-md.js               # 阻止随机 .md
            ├── long-running-warning.js          # 长时间运行警告
            ├── session-check.js                 # 会话检查
            ├── session-start.js                 # 会话启动
            ├── session-end.js                   # 会话结束
            ├── pre-compact.js                   # 压缩前处理
            └── init.js                          # 项目初始化

hooks/
├── hooks.json                                   # 插件兼容配置
└── README.md                                    # 本文档
```

## 注意事项

1. **Hookify 规则文件必须以 `.local.md` 结尾**，否则不会被识别
2. **`.local.json` 和 `.local.md` 不应提交到 Git**，使用 `.example` 文件作为模板
3. **钩子脚本需要可执行权限**（Linux/macOS，仅 shell/python 版本）
4. **推荐使用 Node.js 版本**，原生支持 Windows/macOS/Linux 跨平台
5. **钩子在会话启动时加载**，修改后需重启会话生效
6. **Node.js 16+ 是必需的**，用于运行 Node.js hooks
