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

> **默认使用 Node.js 版本**，支持 Windows/macOS/Linux 跨平台运行。脚本位于 `scripts/node/hooks/` 目录。

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
| SessionEnd   | `session-end.js`   | 会话终止       |

### 策略性钩子

| 脚本                  | 功能         | 位置               |
| --------------------- | ------------ | ------------------ |
| `suggest-compact.sh`  | 建议压缩时机 | `skills/compact/`  |
| `evaluate-session.sh` | 提取模式     | `skills/learning/` |

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
            "command": "node scripts/node/hooks/validate-command.js",
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
  "command": "node ${PLUGIN_ROOT}/scripts/node/hooks/validate-command.js"
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

## 异步钩子（进阶）

异步钩子允许后台执行，不阻塞主会话流程。适用于日志记录、统计分析等非关键操作。

### 配置方式

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/node/hooks/observe-patterns.js",
            "async": true,
            "timeout": 30
          }
        ],
        "description": "异步记录编辑模式（不阻塞）"
      }
    ]
  }
}
```

### 关键字段

| 字段      | 类型    | 说明                     |
| --------- | ------- | ------------------------ |
| `async`   | boolean | 设为 `true` 启用异步执行 |
| `timeout` | number  | 异步操作超时时间（秒）   |

### 适用场景

| 场景         | 同步/异步 | 原因               |
| ------------ | --------- | ------------------ |
| 危险命令检查 | 同步      | 必须在执行前阻止   |
| 代码格式化   | 同步      | 需要立即反馈结果   |
| 日志记录     | 异步      | 不影响主流程       |
| 模式观察     | 异步      | 后台分析，不阻塞   |
| 统计信息收集 | 异步      | 非关键，可后台执行 |

### 注意事项

- 异步钩子的返回值**不会**影响工具执行
- 异步钩子的 stdout 输出**不会**显示给用户
- 超时后异步进程会被终止
- 适合"fire and forget"场景

---

## 最佳实践

### 超时设置

- 简单检查: 1-3 秒
- 格式化/编译: 10-30 秒
- 网络操作: 根据需要设置（单位：秒）
- 异步操作: 可适当延长，但设置上限

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
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | node scripts/node/hooks/validate-command.js
echo $?  # 检查退出码
```

## 文件组织

```
项目根目录/
├── .claude/
│   ├── settings.local.json                      # 主要钩子配置（运行时）
│   ├── settings.local.json.example              # 配置示例（模板）
│   └── hookify.*.local.md                       # Hookify 规则文件（运行时）
│
├── scripts/                                     # 脚本目录（根目录）
│   ├── shell/                                   # Bash 脚本 (10)
│   │   ├── init.sh, cleanup.sh
│   │   ├── session-start.sh, session-end.sh
│   │   └── pre-compact.sh, ...
│   ├── python/                                  # Python 脚本 (9)
│   │   ├── validate-command.py, protect-files.py
│   │   ├── format-file.py, check-console-log.py
│   │   └── session-check.py, ...
│   └── node/                                    # Node.js（默认，跨平台）
│       ├── lib/
│       │   ├── utils.js                         # 27 个辅助函数
│       │   └── package-manager.js               # 包管理器检测
│       └── hooks/                               # 13 个生命周期钩子
│           ├── validate-command.js              # 命令验证
│           ├── protect-files.js                 # 文件保护
│           ├── format-file.js                   # 自动格式化
│           ├── check-console-log.js             # console.log 检查
│           ├── typescript-check.js              # TypeScript 检查
│           ├── pause-before-push.js             # Push 前确认
│           ├── block-random-md.js               # 阻止随机 .md
│           ├── long-running-warning.js          # 长时间运行警告
│           ├── session-check.js                 # 会话检查
│           ├── session-start.js                 # 会话启动
│           ├── session-end.js                   # 会话结束
│           ├── pre-compact.js                   # 压缩前处理
│           └── init.js                          # 项目初始化
│
└── hooks/
    ├── hooks.json                               # 插件兼容配置
    └── README.md                                # 本文档
```

## 注意事项

1. **Hookify 规则文件必须以 `.local.md` 结尾**，否则不会被识别
2. **`.local.json` 和 `.local.md` 不应提交到 Git**，使用 `.example` 文件作为模板
3. **钩子脚本需要可执行权限**（Linux/macOS，仅 shell/python 版本）
4. **推荐使用 Node.js 版本**，原生支持 Windows/macOS/Linux 跨平台
5. **钩子在会话启动时加载**，修改后需重启会话生效
6. **Node.js 16+ 是必需的**，用于运行 Node.js hooks

## 已知问题与兼容性

### SessionStart Hook 特殊要求

> ⚠️ **重要**: SessionStart hook 有特殊的输出格式要求，与其他 hooks 不同。

1. **必须输出 JSON 格式**
   - SessionStart hook 的 stdout 必须是有效的 JSON，否则会显示 `hook error`
   - 即使执行成功，输出纯文本也会被视为错误
   - 参考: [claude-code#12671](https://github.com/anthropics/claude-code/issues/12671)

   ```javascript
   // ✅ 正确：输出 JSON
   console.log(
     JSON.stringify({
       hookSpecificOutput: {
         hookEventName: "SessionStart",
         additionalContext: "检查通过",
       },
     }),
   );

   // ✅ 正确：无内容时输出空 JSON
   console.log("{}");

   // ❌ 错误：输出纯文本
   console.log("Session check passed");
   ```

2. **matcher 配置**
   - 使用 `startup|resume|clear|compact` 而不是 `*`
   - `*` 匹配符可能导致意外行为

3. **Windows 路径引号**
   - 路径中使用 `${CLAUDE_PLUGIN_ROOT}` 时需要加引号
   - 参考: [claude-code#16152](https://github.com/anthropics/claude-code/issues/16152)

   ```json
   // ✅ 正确：路径加引号
   "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/node/hooks/session-check.js\""

   // ❌ 可能出错：路径无引号（Windows 空格路径问题）
   "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/node/hooks/session-check.js"
   ```

### 多插件 SessionStart Hook 冲突

当多个插件都注册了 SessionStart hook 时，任一插件的 hook 失败都会显示 `hook error`，即使其他插件的 hook 成功执行。

**已知受影响的插件:**

- **superpowers** - Windows 上 SessionStart hook 存在兼容性问题
  - Issue: [obra/superpowers#369](https://github.com/obra/superpowers/issues/369)
  - 临时解决方案：如果不需要 superpowers 的 SessionStart 功能，可暂时禁用该插件

**调试方法:**

```bash
# 使用 debug 模式查看详细的 hook 执行日志
claude --debug

# 日志文件位置（Windows）
# C:\Users\<用户名>\.claude\debug\<session-id>.txt
```

在 debug 日志中查找：

- `Parsed initial response: {}` - hook 执行成功
- `Hook output does not start with {` - hook 输出格式错误（非 JSON）
