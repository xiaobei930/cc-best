---
description: 检查点管理，保存和恢复进度
argument-hint: "[save|restore|list] [--archive]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# /checkpoint - 检查点管理

任务完成时执行检查点，确保状态持久化到文档。**核心原则：文档是上下文的持久化存储。**

## 核心理念

> **/clear 后 Claude 只能从文档了解项目状态，检查点是跨会话记忆的关键**

---

## 检查点流程

```
验证 → 提交 → 更新文档 → 保存会话状态 → 建议 /clear
```

### 1. 验证

```bash
# 代码验证（根据项目类型选择）
# Python
python -m py_compile <file.py>
pytest <test_file.py> -v

# TypeScript/Node
npm run build
npm test

# 通用
git diff --check  # 检查空白错误
```

### 2. 提交

```bash
# 检查变更
git status
git diff

# 提交（Conventional Commits）
git add <files>
git commit -m "type(scope): description"
```

**提交类型：**

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具

### 3. 更新文档（最重要！）

**必须更新 `memory-bank/progress.md`：**

```markdown
# 项目进度

## 当前状态

- **阶段**: [阶段名称]
- **最后更新**: [YYYY-MM-DD HH:MM]
- **last_checkpoint**: [YYYY-MM-DD HH:MM]

## 已完成

- [x] 完成的任务1
- [x] 完成的任务2

## 进行中

- [ ] 当前任务（如有）

## 待办

- [ ] 下一个任务
- [ ] 后续任务

## 下一步

[明确说明下一个要做什么]

## 决策记录

| 日期 | 角色 | 决策 | 依据 | 置信度 |
| ---- | ---- | ---- | ---- | ------ |

## 检查点历史

| 时间 | 完成内容 | Git Commit |
| ---- | -------- | ---------- |
```

**文档更新原则：**

- 写给 /clear 后的下一个 Claude 实例看
- 包含足够的上下文让它能继续工作
- 明确说明下一步是什么

### 4. 保存会话状态（可选）

如果启用了 Memory Persistence hooks，会话状态会自动保存到 `~/.claude/sessions/`。

**手动保存会话笔记：**

```markdown
# 会话笔记 - YYYY-MM-DD

## 本次会话完成

- [完成的内容]

## 遇到的问题

- [问题及解决方案]

## 下次会话注意

- [需要注意的事项]

## 需要加载的上下文

- memory-bank/progress.md
- [其他相关文件]
```

### 5. 建议 /clear

任务完成后，告知用户：

```
检查点完成。文档已更新。

建议执行 /clear 清除上下文，然后 /cc-best:iterate 继续下一个任务。

下一个任务: [具体任务名称]
```

---

## 检查清单

### 代码检查点

- [ ] 无语法错误
- [ ] 可以正常导入/构建
- [ ] 相关测试通过

### 前端检查点（如涉及）

- [ ] 页面正常渲染
- [ ] Console 无 Error 级别日志
- [ ] 关键交互功能正常

### Git 检查点

- [ ] 变更已提交
- [ ] commit message 符合规范
- [ ] 无敏感信息

### 文档检查点（最重要！）

- [ ] progress.md 已更新
- [ ] 记录了完成的内容
- [ ] 明确了下一步任务
- [ ] 重要决策已记录

---

## 使用方式

```bash
/cc-best:checkpoint          # 执行完整检查点流程
/cc-best:checkpoint verify   # 只验证，不提交
/cc-best:checkpoint docs     # 只更新文档
/cc-best:checkpoint restore  # 从上一个检查点恢复状态
/cc-best:checkpoint --archive  # 归档旧记录（当 progress.md 过大时）
```

---

## 自动归档机制

### 触发条件

当 `progress.md` 满足以下任一条件时，建议执行归档：

- 文件超过 **300 行**
- "最近完成" 超过 **5 项**
- "最近决策" 超过 **10 条**
- "最近检查点" 超过 **5 个**

### `/cc-best:checkpoint --archive` 流程

1. **检测文件大小**

   ```bash
   wc -l memory-bank/progress.md
   ```

2. **移动旧记录到归档**
   - "最近完成" 中超过 5 项的 → `progress-archive.md` 的 "已完成任务"
   - "最近决策" 中超过 5 条的 → `progress-archive.md` 的 "决策记录归档"
   - "最近检查点" 中超过 5 个的 → `progress-archive.md` 的 "检查点历史"

3. **更新归档日志**
   在 `progress-archive.md` 的 "归档日志" 表格添加记录

4. **验证**
   确保 `progress.md` 行数 < 150 行

### 滚动窗口策略

| 区域       | 保留数量 | 超出处理              |
| ---------- | -------- | --------------------- |
| 最近完成   | 5 项     | 移到归档              |
| 最近决策   | 5 条     | 移到归档              |
| 最近检查点 | 5 个     | 移到归档              |
| 待办       | 10 项    | 超出的移到 backlog.md |

### 为什么需要归档？

```
❌ 问题场景:
progress.md 累积 10000+ 行 → 无法一次读取 → /cc-best:iterate 失败

✅ 解决方案:
滚动窗口 + 自动归档 → progress.md 始终 < 300 行 → 快速读取
```

---

## 恢复功能

### /cc-best:checkpoint restore 流程

当上下文丢失或需要从检查点恢复时：

1. **读取检查点信息**
   - 读取 `memory-bank/progress.md`
   - 获取 `last_checkpoint` 时间
   - 获取检查点历史

2. **恢复状态**
   - 读取"下一步"部分
   - 确定当前应该做的任务
   - 读取相关的任务文档

3. **验证代码状态**

   ```bash
   git log --oneline -5    # 确认最近提交
   git status              # 检查工作区状态
   ```

4. **输出恢复报告**

---

## Hooks 配置（可选）

在 `settings.local.json` 中配置自动检查点提醒：

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Checkpoint] 建议更新 progress.md 再结束会话'"
          }
        ]
      }
    ]
  }
}
```

---

## 为什么文档更新最重要？

```
会话1: 完成任务A → 更新 progress.md → /clear

会话2: /cc-best:iterate → 读取 progress.md → 知道任务A已完成 → 继续任务B
```

如果不更新文档：

```
会话1: 完成任务A → 没更新文档 → /clear

会话2: /cc-best:iterate → 读取 progress.md → 不知道任务A完成了 → 重复工作！
```

---

> **记住**：检查点不仅是保存代码，更是保存上下文。好的检查点让下一个 Claude 实例能无缝继续工作。
