---
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /setup - 项目初始化

初始化 Claude Code 项目配置。支持 **Plugin 模式** 和 **Clone 模式**。

## 使用方式

```bash
# 完整初始化（默认）
/setup

# 仅配置 hooks（修复插件 hooks 问题）
/setup --hooks

# 配置 hooks 到全局
/setup --hooks --global

# 配置 hooks 到项目
/setup --hooks --project

# 验证 hooks 配置是否正确
/setup --verify
```

---

## 参数说明

| 参数        | 说明                                     |
| ----------- | ---------------------------------------- |
| `--hooks`   | 仅配置 hooks，跳过其他初始化步骤         |
| `--global`  | 配置到全局 `~/.claude/settings.json`     |
| `--project` | 配置到项目 `.claude/settings.local.json` |
| `--verify`  | 验证 hooks 配置是否正确（诊断模式）      |

---

## 执行步骤

### 0. 检查 --verify 参数

如果使用 `--verify` 参数，执行验证模式：

```bash
# 运行 hooks 验证脚本
node <SCRIPT_PATH>/verify-hooks.js
```

验证脚本会检查：

- ✅ 脚本路径是否存在
- ✅ timeout 是否在合理范围 (1ms - 10min)
- ✅ matcher 语法是否正确
- ✅ 生命周期事件是否有效

验证完成后输出诊断报告和修复建议，然后退出。

### 1. 检测运行模式

```
如果存在 scripts/node/hooks/ 目录：
  → Clone 模式
否则：
  → Plugin 模式，定位插件缓存目录
```

### 2. 运行初始化脚本

使用 Node.js 脚本（跨平台兼容）执行初始化：

```bash
# 检测并运行初始化脚本
# Plugin 模式：脚本位于插件目录
# Clone 模式：脚本位于项目目录

# 优先使用 Node.js（跨平台）
if command -v node &> /dev/null; then
    # 查找脚本位置（Plugin 或 Clone 模式）
    if [ -f "scripts/node/hooks/init.js" ]; then
        node scripts/node/hooks/init.js
    fi
else
    # 回退到 Bash（仅 Unix）
    if [ -f "scripts/shell/init.sh" ]; then
        bash scripts/shell/init.sh
    fi
fi
```

初始化脚本会自动：

- 检测运行模式（Plugin/Clone）
- 创建 `.claude/settings.local.json`
- 创建必要目录结构
- 初始化 Memory Bank 文件
- Plugin 模式下从插件目录复制模板
- Clone 模式下创建 Hookify 规则文件

### 3. 清理旧版本 Hooks 配置

> ⚠️ **v0.5.3 升级**: 如果从旧版本升级，全局 settings.json 可能有冗余的 hooks 配置需要清理。

**检查并清理**：

1. 读取全局配置 `~/.claude/settings.json`
2. 检查是否存在 `hooks` 字段，且包含 `${CLAUDE_PLUGIN_ROOT}/scripts/node/hooks/` 路径
3. 如果存在，这是旧版本遗留配置，应该删除 `hooks` 字段
4. 告知用户：「已清理旧版本 hooks 配置，现在通过插件内置 hooks/hooks.json 自动生效」

```javascript
// 清理逻辑示例
const settingsPath = path.join(os.homedir(), ".claude/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

if (settings.hooks) {
  const hasOldHooks = JSON.stringify(settings.hooks).includes(
    "scripts/node/hooks/",
  );
  if (hasOldHooks) {
    delete settings.hooks;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log("✅ 已清理旧版本 hooks 配置");
  }
}
```

### 4. 配置 Hooks（Plugin 模式）

> ℹ️ **v0.5.3+**: Hooks 现在通过插件内置 `hooks/hooks.json` 自动生效，无需手动配置。
> 如果需要自定义或覆盖，可以使用 `/setup --hooks` 手动配置。

**自动生效的 Hooks**：

插件安装后，以下 hooks 自动启用：

| Hook                   | 触发条件        | 功能         |
| ---------------------- | --------------- | ------------ |
| `validate-command.js`  | Bash 命令执行前 | 阻止危险命令 |
| `pause-before-push.js` | git push 前     | 推送确认     |
| `protect-files.js`     | 文件写入前      | 保护敏感文件 |
| `format-file.js`       | 文件写入后      | 自动格式化   |
| `session-check.js`     | 会话启动时      | 项目健康检查 |

**手动配置（可选）**：

如果插件内置 hooks 不生效，可以运行 `/setup --hooks` 手动配置。

配置位置选择：

1. 全局配置 (`~/.claude/settings.json`) - 所有项目生效（推荐）
2. 项目配置 (`.claude/settings.local.json`) - 仅当前项目生效

**路径获取方式**（跨平台）：

```javascript
const os = require("os");
const path = require("path");

// 获取插件绝对路径
const homeDir = os.homedir();
const pluginVersion = "0.5.3"; // 当前版本
const pluginPath = path.join(
  homeDir,
  ".claude/plugins/cache/claude-code-best-practices/cc-best",
  pluginVersion,
);
// Windows: C:\Users\<user>\.claude\plugins\cache\claude-code-best-practices\cc-best\0.5.3
// macOS:   /Users/<user>/.claude/plugins/cache/claude-code-best-practices/cc-best/0.5.3
// Linux:   /home/<user>/.claude/plugins/cache/claude-code-best-practices/cc-best/0.5.3
```

**Hooks 配置模板**：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node <PLUGIN_PATH>/scripts/node/hooks/validate-command.js",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

⚠️ **注意**: 路径**不要用引号包裹**（如 `\"...\"`），否则 Windows 下会失败

### 5. 更新 CLAUDE.md

将模板占位符替换为实际项目信息：

- `{{PROJECT_NAME}}` → 项目名称
- `{{PROJECT_DESCRIPTION}}` → 项目描述
- `{{DATE}}` → 当前日期 (YYYY-MM-DD)
- `{{CURRENT_PHASE}}` → 当前阶段（如"开发中"、"MVP"）

**询问用户**获取这些信息，然后使用 Edit 工具更新 CLAUDE.md。

---

## 输出

初始化完成后输出：

```
✅ 项目初始化完成

已创建/检查：
- [x] .claude/settings.local.json
- [x] .claude/screenshots/
- [x] .claude/logs/
- [x] memory-bank/
- [x] docs/

Hooks 配置：
- [x] 已写入 ~/.claude/settings.json（全局）
- 包含：validate-command, pause-before-push, protect-files, format-file, session-check

下一步：
1. 确认 CLAUDE.md 中的项目信息
2. 编辑 memory-bank/tech-stack.md 定义技术栈
3. 运行 /pm 开始第一个需求
```

---

## 模式差异

| 模式   | settings.local.json 来源 | Hooks 配置                     | Hookify 规则       |
| ------ | ------------------------ | ------------------------------ | ------------------ |
| Plugin | 插件目录模板             | 需要手动配置（此命令自动处理） | 由 hooks.json 提供 |
| Clone  | 项目目录模板             | 使用相对路径                   | 复制 .example 文件 |

---

## 配置层次

```
优先级（高 → 低）：
1. .claude/settings.local.json（项目本地，不提交）
2. .claude/settings.json（项目级，可提交）
3. ~/.claude/settings.json（全局用户配置）
```

**推荐策略**：

- **安全类 hooks**（validate-command, protect-files）→ 全局配置
- **格式化 hooks**（format-file）→ 项目配置（不同项目可能有不同格式化规则）
