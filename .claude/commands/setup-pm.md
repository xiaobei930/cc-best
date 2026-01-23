---
description: 配置项目首选包管理器 (npm/pnpm/yarn/bun)
disable-model-invocation: true
---

# /setup-pm - 包管理器配置

配置项目或全局的首选包管理器。

## 快速使用

```bash
# 检测当前配置
node .claude/scripts/node/setup-package-manager.js --detect

# 设置项目首选为 pnpm
node .claude/scripts/node/setup-package-manager.js --project pnpm

# 设置全局首选为 bun
node .claude/scripts/node/setup-package-manager.js --global bun

# 列出所有可用选项
node .claude/scripts/node/setup-package-manager.js --list
```

## 检测优先级

系统按以下顺序检测包管理器：

| 优先级 | 来源                                      | 说明                    |
| ------ | ----------------------------------------- | ----------------------- |
| 1      | 环境变量 `CLAUDE_PACKAGE_MANAGER`         | 最高优先级              |
| 2      | 项目配置 `.claude/package-manager.json`   | 项目级覆盖              |
| 3      | `package.json` 的 `packageManager`        | 标准字段                |
| 4      | Lock 文件检测                             | 自动检测                |
| 5      | 全局配置 `~/.claude/package-manager.json` | 用户默认                |
| 6      | 回退                                      | pnpm > bun > yarn > npm |

## 配置文件格式

### 项目配置 (.claude/package-manager.json)

```json
{
  "packageManager": "pnpm",
  "updatedAt": "2024-01-23T10:00:00.000Z"
}
```

### 全局配置 (~/.claude/package-manager.json)

```json
{
  "packageManager": "bun",
  "updatedAt": "2024-01-23T10:00:00.000Z"
}
```

### package.json 标准字段

```json
{
  "name": "my-project",
  "packageManager": "pnpm@8.15.0"
}
```

## 环境变量

设置 `CLAUDE_PACKAGE_MANAGER` 环境变量可覆盖所有配置：

```bash
# Windows PowerShell
$env:CLAUDE_PACKAGE_MANAGER = "pnpm"

# macOS/Linux
export CLAUDE_PACKAGE_MANAGER=pnpm
```

## 支持的包管理器

| 包管理器 | Lock 文件         | 特点               |
| -------- | ----------------- | ------------------ |
| **npm**  | package-lock.json | Node.js 自带       |
| **pnpm** | pnpm-lock.yaml    | 快速、节省磁盘空间 |
| **yarn** | yarn.lock         | 稳定、广泛使用     |
| **bun**  | bun.lockb         | 极快、新一代运行时 |

## 在 Hooks 中使用

Node.js hooks 会自动使用检测到的包管理器：

```javascript
const { detect, getRunCommand } = require("./lib/package-manager");

const pm = detect();
console.log(`使用 ${pm.name} (来源: ${pm.source})`);

// 获取运行命令
const devCmd = getRunCommand("dev"); // -> "pnpm dev" 或 "npm run dev"
const testCmd = getRunCommand("test"); // -> "pnpm test" 或 "npm test"
```
