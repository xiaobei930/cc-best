---
description: GitHub Issue 端到端修复闭环（分析→修复→测试→提交→关闭）
argument-hint: "[#issue-number] [--no-close]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite, Task
---

# /fix-issue - Issue 修复闭环

从 GitHub Issue 出发，端到端完成修复闭环。**核心能力是自动化 Issue 分析→代码修复→测试验证→提交→关闭的完整流程。**

> **Agent 集成**:
>
> - 代码定位使用 `exploration` 技能（Explore Agent）
> - 修复实现调用 `tdd-guide` Agent 确保测试覆盖
> - 提交前调用 `/cc-best:verify` 综合验证

## 使用方式

```bash
# 修复指定 Issue
/cc-best:fix-issue #123

# 修复 Issue 并跳过关闭（仅提交代码）
/cc-best:fix-issue #123 --no-close

# 批量修复多个 Issue
/cc-best:fix-issue #123 #124 #125
```

---

## 执行流程

### 第 0 步：守卫检查

- 确认 `gh` CLI 已安装且已认证
- 确认当前 `git status` 干净（无未提交变更）
- 确认 Issue 存在且状态为 Open

### 第 1 步：读取 Issue

```bash
gh issue view <NUMBER> --json title,body,labels,assignees,comments
```

- 提取 Issue 标题、描述、标签
- 分析 Issue 类型：`bug` / `feature` / `enhancement` / `question`
- 读取评论中的补充信息

### 第 2 步：分析与定位

- 根据 Issue 描述使用 `exploration` 技能定位相关代码
- 建立 TodoWrite 任务清单，列出需要修改的文件
- 如果 Issue 涉及多个模块，按依赖关系排序

### 第 3 步：实施修复

- **Bug 类型**: 先编写失败测试（复现问题）→ 修复代码 → 测试通过
- **Feature 类型**: 按 TDD 流程实现（调用 `tdd-guide` Agent）
- **Enhancement 类型**: 修改现有代码，确保不破坏已有测试

> **关键原则**: 最小化修改范围，不做超出 Issue 描述的额外变更

### 第 4 步：验证

调用 `/cc-best:verify` 执行综合验证：

- 构建检查（无编译错误）
- 类型检查（无类型错误）
- Lint 检查（无规范违规）
- 测试运行（全部通过）

### 第 5 步：提交

调用 `/cc-best:commit` 生成规范的提交信息：

- 提交信息格式: `fix: <简要描述> (#<ISSUE_NUMBER>)`
- Feature 类型使用 `feat:` 前缀
- 关联 Issue: 提交信息中包含 `Closes #<NUMBER>`

### 第 6 步：关闭 Issue

```bash
gh issue close <NUMBER> --comment "修复已提交: <commit-sha>\n\n变更摘要:\n- <变更列表>"
```

- 在 Issue 中评论修复摘要
- 列出修改的文件和关键变更
- 如果使用 `--no-close`，仅评论不关闭

---

## 错误处理

| 场景         | 处理方式                               |
| ------------ | -------------------------------------- |
| Issue 不存在 | 报错退出，提示检查 Issue 编号          |
| gh 未认证    | 提示执行 `gh auth login`               |
| 测试失败     | 继续修复，不跳过测试                   |
| 构建失败     | 调用 `build-error-resolver` Agent 分析 |
| 修改范围过大 | 提醒用户拆分 Issue                     |

---

## 与其他命令的关系

| 命令               | 关系                                    |
| ------------------ | --------------------------------------- |
| `/cc-best:verify`  | 第 4 步调用，综合验证                   |
| `/cc-best:commit`  | 第 5 步调用，规范提交                   |
| `/cc-best:dev`     | 类似但更通用，fix-issue 专注 Issue 闭环 |
| `/cc-best:iterate` | 可在 iterate 模式中自动调用 fix-issue   |
