# 工具清单

本文档列出项目中可用的工具和脚本，供 Claude 和开发者参考。

## 脚本工具

### 安全相关

| 工具                 | 路径                                  | 用途                            |
| -------------------- | ------------------------------------- | ------------------------------- |
| **committer**        | `.claude/scripts/committer.sh`        | 安全 git 提交，禁止 `git add .` |
| **trash**            | `.claude/scripts/trash.py`            | 可恢复删除，移动到回收站        |
| **validate_command** | `.claude/scripts/validate_command.py` | 验证危险 bash 命令              |
| **protect_files**    | `.claude/scripts/protect_files.py`    | 保护敏感文件不被修改            |

### 格式化相关

| 工具                  | 路径                                   | 用途                   |
| --------------------- | -------------------------------------- | ---------------------- |
| **format_file**       | `.claude/scripts/format_file.py`       | 自动格式化代码文件     |
| **check_console_log** | `.claude/scripts/check_console_log.py` | 检查遗留的 console.log |
| **typescript_check**  | `.claude/scripts/typescript_check.sh`  | TypeScript 类型检查    |

### 会话相关

| 工具              | 路径                               | 用途                 |
| ----------------- | ---------------------------------- | -------------------- |
| **session_start** | `.claude/scripts/session_start.sh` | 会话开始时加载上下文 |
| **session_end**   | `.claude/scripts/session_end.sh`   | 会话结束时保存状态   |
| **session_check** | `.claude/scripts/session_check.py` | 会话健康检查         |
| **pre_compact**   | `.claude/scripts/pre_compact.sh`   | 上下文压缩前保存状态 |

### 项目管理

| 工具              | 路径                               | 用途         |
| ----------------- | ---------------------------------- | ------------ |
| **init**          | `.claude/scripts/init.sh`          | 项目初始化   |
| **cleanup**       | `.claude/scripts/cleanup.sh`       | 清理临时文件 |
| **test_template** | `.claude/scripts/test_template.py` | 模板验证测试 |

## 使用示例

### committer - 安全提交

```bash
# 基本用法：提交特定文件
.claude/scripts/committer.sh "feat: add login" src/auth.ts src/login.vue

# 强制模式：清除 lock 文件后重试
.claude/scripts/committer.sh --force "fix: resolve bug" src/fix.ts

# 错误示例：禁止使用 "."
.claude/scripts/committer.sh "feat: all changes" .  # ❌ 会被拒绝
```

### trash - 可恢复删除

```bash
# 删除文件到回收站
python .claude/scripts/trash.py old_file.ts deprecated/

# 查看回收站内容
python .claude/scripts/trash.py --list

# 恢复提示
python .claude/scripts/trash.py --restore
```

### cleanup - 清理临时文件

```bash
# 预览将被清理的内容
bash .claude/scripts/cleanup.sh --dry-run

# 执行清理
bash .claude/scripts/cleanup.sh
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

1. 将脚本放置在 `.claude/scripts/` 目录
2. 确保有执行权限：`chmod +x script.sh`
3. 在此文档添加条目
4. 如需钩子触发，在 `settings.local.json` 中配置

## 注意事项

- 所有 shell 脚本必须使用 **LF 换行符**（通过 .gitattributes 强制）
- Python 脚本使用 **UTF-8 编码**
- 钩子脚本的 **timeout 单位是秒**（不是毫秒）
- 阻止操作使用 **exit code 2**
