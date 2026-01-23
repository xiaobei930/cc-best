# 工具清单

本文档列出项目中可用的工具和脚本，供 Claude 和开发者参考。

## 目录结构

脚本按语言分类存放在 `scripts/` 目录下：

```
scripts/
├── shell/      # Bash 脚本
├── python/     # Python 脚本
└── node/       # Node.js 脚本和工具库
    ├── lib/    # 工具库
    └── hooks/  # 跨平台 hooks
```

## Shell 脚本 (scripts/shell/)

### 安全相关

| 工具                     | 文件                      | 用途                            |
| ------------------------ | ------------------------- | ------------------------------- |
| **committer**            | `committer.sh`            | 安全 git 提交，禁止 `git add .` |
| **pause-before-push**    | `pause-before-push.sh`    | git push 前暂停确认             |
| **long-running-warning** | `long-running-warning.sh` | 长时间运行命令提醒              |

### 会话相关

| 工具                 | 文件                  | 用途                 |
| -------------------- | --------------------- | -------------------- |
| **session-start**    | `session-start.sh`    | 会话开始时加载上下文 |
| **session-end**      | `session-end.sh`      | 会话结束时保存状态   |
| **pre-compact**      | `pre-compact.sh`      | 上下文压缩前保存状态 |
| **typescript-check** | `typescript-check.sh` | TypeScript 类型检查  |

### 项目管理

| 工具        | 文件         | 用途           |
| ----------- | ------------ | -------------- |
| **init**    | `init.sh`    | 项目初始化     |
| **cleanup** | `cleanup.sh` | 清理临时文件   |
| **ralph**   | `ralph.sh`   | 长时间运行循环 |

## Python 脚本 (scripts/python/)

### 安全相关

| 工具                 | 文件                  | 用途                     |
| -------------------- | --------------------- | ------------------------ |
| **validate-command** | `validate-command.py` | 验证危险 bash 命令       |
| **protect-files**    | `protect-files.py`    | 保护敏感文件不被修改     |
| **trash**            | `trash.py`            | 可恢复删除，移动到回收站 |

### 格式化相关

| 工具                  | 文件                   | 用途                   |
| --------------------- | ---------------------- | ---------------------- |
| **format-file**       | `format-file.py`       | 自动格式化代码文件     |
| **check-console-log** | `check-console-log.py` | 检查遗留的 console.log |
| **block-random-md**   | `block-random-md.py`   | 阻止随机创建 .md 文件  |

### 会话相关

| 工具                | 文件                 | 用途         |
| ------------------- | -------------------- | ------------ |
| **session-check**   | `session-check.py`   | 会话健康检查 |
| **notify-complete** | `notify-complete.py` | 任务完成通知 |

### 项目管理

| 工具              | 文件               | 用途         |
| ----------------- | ------------------ | ------------ |
| **test-template** | `test-template.py` | 模板验证测试 |

## Node.js 工具 (scripts/node/)

为解决 Windows/macOS/Linux 兼容性问题，提供 Node.js 版本的工具库和 hooks。

### 工具库 (node/lib/)

| 模块                   | 文件                     | 用途                |
| ---------------------- | ------------------------ | ------------------- |
| **utils.js**           | `lib/utils.js`           | 跨平台文件/系统操作 |
| **package-manager.js** | `lib/package-manager.js` | 包管理器自动检测    |

### 跨平台 Hooks (node/hooks/)

**会话生命周期**

| Hook              | 文件                     | 用途                 |
| ----------------- | ------------------------ | -------------------- |
| **session-start**    | `hooks/session-start.js`    | 会话启动时加载上下文 |
| **session-end**      | `hooks/session-end.js`      | 会话结束时保存状态   |
| **pre-compact**      | `hooks/pre-compact.js`      | 上下文压缩前保存状态 |
| **init**             | `hooks/init.js`             | 项目初始化           |
| **session-check**    | `hooks/session-check.js`    | 会话健康检查         |
| **protect-files**    | `hooks/protect-files.js`    | 保护敏感文件         |
| **block-random-md**  | `hooks/block-random-md.js`  | 阻止随机创建 .md     |
| **format-file**      | `hooks/format-file.js`      | 自动格式化代码       |
| **check-console-log**| `hooks/check-console-log.js`| 检查 console.log     |

**命令验证 (PreToolUse:Bash)**

| Hook                     | 文件                            | 用途                     |
| ------------------------ | ------------------------------- | ------------------------ |
| **validate-command**     | `hooks/validate-command.js`     | 验证危险命令（阻止执行） |
| **pause-before-push**    | `hooks/pause-before-push.js`    | git push 前暂停确认      |
| **long-running-warning** | `hooks/long-running-warning.js` | 长时间运行命令提醒       |

**代码检查 (PostToolUse:Edit|Write)**

| Hook                 | 文件                        | 用途                |
| -------------------- | --------------------------- | ------------------- |
| **typescript-check** | `hooks/typescript-check.js` | TypeScript 类型检查 |

### CLI 工具

| 工具                      | 文件                       | 用途             |
| ------------------------- | -------------------------- | ---------------- |
| **setup-package-manager** | `setup-package-manager.js` | 包管理器配置工具 |

## 选择指南

| 环境        | 推荐版本        | 原因                       |
| ----------- | --------------- | -------------------------- |
| Windows     | Node.js (`.js`) | 避免 CRLF 和 bash 兼容问题 |
| macOS/Linux | 均可            | 两者都兼容                 |
| CI/CD       | Node.js (`.js`) | 更好的跨平台支持           |

## 使用示例

### committer - 安全提交

```bash
# 基本用法：提交特定文件
scripts/shell/committer.sh "feat: add login" src/auth.ts src/login.vue

# 强制模式：清除 lock 文件后重试
scripts/shell/committer.sh --force "fix: resolve bug" src/fix.ts

# 错误示例：禁止使用 "."
scripts/shell/committer.sh "feat: all changes" .  # ❌ 会被拒绝
```

### trash - 可恢复删除

```bash
# 删除文件到回收站
python scripts/python/trash.py old_file.ts deprecated/

# 查看回收站内容
python scripts/python/trash.py --list

# 恢复提示
python scripts/python/trash.py --restore
```

### cleanup - 清理临时文件

```bash
# 预览将被清理的内容
bash scripts/shell/cleanup.sh --dry-run

# 执行清理
bash scripts/shell/cleanup.sh
```

### setup-package-manager - 包管理器配置

```bash
# 检测当前配置
node scripts/node/setup-package-manager.js --detect

# 设置项目首选为 pnpm
node scripts/node/setup-package-manager.js --project pnpm

# 设置全局首选为 bun
node scripts/node/setup-package-manager.js --global bun

# 列出所有可用选项
node scripts/node/setup-package-manager.js --list
```

## 外部工具依赖

根据项目技术栈，可能需要以下外部工具：

### 通用

| 工具       | 安装                                 | 用途       |
| ---------- | ------------------------------------ | ---------- |
| `jq`       | `brew install jq` / `apt install jq` | JSON 处理  |
| `prettier` | `npm install -g prettier`            | 代码格式化 |
| `eslint`   | `npm install -g eslint`              | JS/TS 检查 |

### Python 项目

| 工具    | 安装                | 用途           |
| ------- | ------------------- | -------------- |
| `black` | `pip install black` | Python 格式化  |
| `ruff`  | `pip install ruff`  | Python linting |
| `mypy`  | `pip install mypy`  | 类型检查       |

### Vue/React 项目

| 工具      | 安装     | 用途            |
| --------- | -------- | --------------- |
| `vue-tsc` | 项目依赖 | Vue 类型检查    |
| `tsc`     | 项目依赖 | TypeScript 编译 |

### iOS 项目

| 工具          | 安装                       | 用途           |
| ------------- | -------------------------- | -------------- |
| `xcodebuild`  | Xcode                      | 构建项目       |
| `xctrace`     | Xcode                      | 性能分析       |
| `swiftlint`   | `brew install swiftlint`   | Swift 代码检查 |
| `swiftformat` | `brew install swiftformat` | Swift 格式化   |

## 添加新工具

1. 根据语言将脚本放置在对应目录：
   - Bash 脚本 → `scripts/shell/`
   - Python 脚本 → `scripts/python/`
   - Node.js 脚本 → `scripts/node/`
2. 确保有执行权限：`chmod +x script.sh`
3. 在此文档添加条目
4. 如需钩子触发，在 `settings.local.json` 中配置

## 注意事项

- 所有 shell 脚本必须使用 **LF 换行符**（通过 .gitattributes 强制）
- Python 脚本使用 **UTF-8 编码**
- 钩子脚本的 **timeout 单位是秒**（不是毫秒）
- 阻止操作使用 **exit code 2**
- Windows 用户建议使用 **Node.js 版本**的 hooks
