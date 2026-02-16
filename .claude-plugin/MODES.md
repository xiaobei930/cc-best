# Working Modes | 工作模式使用指南

> **English** | [中文](#中文版)

This guide explains the different working modes available in CC-Best and helps you choose the right mode for your workflow.

---

## Overview | 模式概览

| Mode                | Purpose              | User Involvement            | Best For                           |
| ------------------- | -------------------- | --------------------------- | ---------------------------------- |
| `/cc-best:iterate`  | Autonomous iteration | Minimal (only when blocked) | Clear task lists, batch execution  |
| `/cc-best:pair`     | Pair programming     | Continuous collaboration    | Learning, sensitive operations     |
| `/cc-best:cc-ralph` | Long-running loop    | Minimal (cross-session)     | Hour-level projects                |
| `/cc-best:mode`     | Behavior adjustment  | N/A (modifier)              | Fine-tuning Claude's approach      |
| `/cc-best:model`    | Model strategy       | One-time selection          | Switching quality/balanced/economy |

### Quick Decision Guide

```
Do you have a clear task list?
├─ YES → Are tasks relatively safe (no production DB, etc.)?
│        ├─ YES → /cc-best:iterate
│        └─ NO  → /cc-best:pair
└─ NO  → Do you need to learn or discuss?
         ├─ YES → /cc-best:pair
         └─ NO  → /cc-best:pm first, then /cc-best:iterate
```

---

## /cc-best:iterate - Autonomous Iteration

**What it does**: Claude works through tasks autonomously, moving from one to the next without waiting for your input.

### When to Use

✅ **Good fit:**

- You have a clear task list in `progress.md`
- Tasks have well-defined completion criteria
- Risk is manageable (can be reverted)
- You don't need to review each step

❌ **Not recommended:**

- Learning a new codebase
- Sensitive operations (production, data migration)
- Unclear requirements
- You want to understand each decision

### How to Start

```bash
# Basic: Claude reads progress.md and continues
/cc-best:iterate

# With specific goal
/cc-best:iterate "implement user authentication"

# Plugin users
/cc-best:iterate "implement user authentication"
```

### Pipeline Modes

Iterate supports two pipeline modes (configured in `memory-bank/config.json`):

| Mode   | Pipeline                        | Best For            |
| ------ | ------------------------------- | ------------------- |
| `full` | PM → Lead → Designer → Dev → QA | Complete projects   |
| `lite` | Dev → Verify → Commit           | Quick coding, fixes |

**Lite mode** skips role selection and goes straight to Dev → Verify → Commit. Use `/cc-best:setup --interactive` to switch.

### What Happens

```
1. Claude reads memory-bank/progress.md
2. Selects the next task
3. Chooses appropriate role (/cc-best:pm, /cc-best:lead, /cc-best:dev, /cc-best:qa)
4. Executes the task
5. Runs verification (/cc-best:verify)
6. Commits changes
7. Updates progress.md
8. IMMEDIATELY starts next task (no waiting)
```

### How to Control

| Action               | Method                                         |
| -------------------- | ---------------------------------------------- |
| **Pause**            | Press `Ctrl+C` or `Esc`                        |
| **Interrupt**        | Type any message                               |
| **Resume**           | Say "continue" or run `/cc-best:iterate` again |
| **Stop permanently** | Press `Ctrl+C` and don't resume                |

### Stop Conditions

Claude stops automatically when:

1. ✅ All tasks in progress.md are complete
2. ✅ You interrupt (Ctrl+C / Escape)
3. ✅ Fatal error that cannot be auto-resolved
4. ✅ External dependency requiring your decision
5. ✅ Context window approaching limit (>80%)

### Best Practices

1. **Prepare progress.md first** - Clear tasks = smooth iteration
2. **Don't manually `/clear`** - Let Claude manage context
3. **Check commits after** - Review the git log when done
4. **Use for batches** - Most effective with multiple small tasks

### Example Session

```bash
# You prepared tasks in progress.md:
# - [ ] TSK-001: Setup authentication routes
# - [ ] TSK-002: Implement JWT middleware
# - [ ] TSK-003: Add login endpoint
# - [ ] TSK-004: Add logout endpoint

/cc-best:iterate

# Claude works through all 4 tasks automatically
# ~30 minutes later, all tasks complete with commits

# Check what happened:
git log --oneline -10
```

---

## /cc-best:pair - Pair Programming

**What it does**: Claude works WITH you, asking for confirmation at each key decision point.

### When to Use

✅ **Good fit:**

- 🎓 Learning new technology
- 💬 Design discussions
- ⚠️ Sensitive operations (DB migration, production)
- 🔍 Code review with explanations
- 🐛 Complex debugging
- 📝 Unclear requirements

❌ **Not recommended:**

- Simple, repetitive tasks
- When you're confident in the approach
- Batch execution of clear tasks

### How to Start

```bash
# Basic
/cc-best:pair

# With context
/cc-best:pair "help me implement user auth"

# Learning mode
/cc-best:pair --learn "teach me how to write unit tests"

# Plugin users
/cc-best:pair "refactor this function with me"
```

### Confirmation Points

Claude will ask for your input at:

| Point               | Example Question                          |
| ------------------- | ----------------------------------------- |
| Understanding       | "I understand you need X. Correct?"       |
| Multiple options    | "Option A or B? I recommend A because..." |
| Destructive actions | "About to delete X. Confirm?"             |
| External calls      | "Will call production API. Proceed?"      |
| Commits             | "Commit message: '...'. OK?"              |

### What Claude Does Autonomously

Even in pair mode, Claude can:

- Read files
- Search code
- Run tests (read-only)
- Format code
- Generate documentation

### Communication Style

Claude will:

- Explain WHY before doing
- Provide options with pros/cons
- Admit uncertainty
- Ask clarifying questions

### Example Session

```
You: /cc-best:pair help me refactor this function

Claude: Let me look at the function...

I see these issues:
1. Too long (80 lines)
2. Mixed responsibilities
3. Deep nesting (4 levels)

I suggest:
A) Extract validation logic
B) Use early returns
C) Split into 3 functions

Which should I start with?

You: Start with A

Claude: OK, extracting validation...

[shows code change]

Here's the extracted function. Changes:
- Lines 15-30 moved to validate_input()
- Main function now calls validate_input()
- Tests still pass

Look good? Continue with B?
```

---

## /cc-best:cc-ralph - Long-Running Loop

**What it does**: Autonomous development that persists across sessions. Uses the `ralph-loop` plugin for cross-session continuity.

### Prerequisites

```bash
# Install ralph-loop plugin first
/plugin install ralph-loop@claude-plugins-official
```

> ⚠️ **Windows users**: ralph-loop requires bash. Use WSL or Git Bash, or stick with `/cc-best:iterate`.

### When to Use

✅ **Good fit:**

- Multi-hour development tasks
- Projects spanning multiple sessions
- You want to start a task and come back later

❌ **Not recommended:**

- Quick fixes (<30 min)
- When you want to watch progress
- Learning or exploration

### /cc-best:cc-ralph vs /cc-best:iterate

| Aspect        | /cc-best:iterate | /cc-best:cc-ralph   |
| ------------- | ---------------- | ------------------- |
| Session scope | Single session   | Cross-session       |
| Resume        | Manual           | Automatic           |
| Best for      | <2h tasks        | Hour-level projects |
| Requires      | Nothing extra    | ralph-loop plugin   |

### How to Start

```bash
# Auto-continue from progress.md
/cc-best:cc-ralph

# Specific task
/cc-best:cc-ralph "implement user authentication"

# With mode
/cc-best:cc-ralph --mode full-feature "implement user auth"
/cc-best:cc-ralph --mode bug-fix "fix login timeout"
/cc-best:cc-ralph --mode refactor "refactor auth module"

# With iteration limit
/cc-best:cc-ralph "complete Phase 2" --max-iterations 20

# Plugin users
/cc-best:cc-ralph "implement feature X"
```

### Available Modes

| Mode           | Purpose                                 | Completion Signal   |
| -------------- | --------------------------------------- | ------------------- |
| `full-feature` | Complete feature (req→design→code→test) | `FEATURE_COMPLETE`  |
| `iterate`      | Progress through tasks in progress.md   | `PHASE_COMPLETE`    |
| `bug-fix`      | Locate and fix a bug                    | `BUG_FIXED`         |
| `refactor`     | Improve code quality                    | `REFACTOR_COMPLETE` |
| `fix-tests`    | Make failing tests pass                 | `TESTS_PASSING`     |
| `doc-gen`      | Generate/update documentation           | `DOCS_COMPLETE`     |

### How to Stop

```bash
/ralph-loop:cancel-ralph
```

### Setup Local Templates (Optional)

```bash
# Copy templates for customization
/cc-best:cc-ralph --setup

# Templates created in .claude/ralph-prompts/
```

---

## /cc-best:mode - Behavior Adjustment

**What it does**: Adjusts Claude's working style without changing the task or role.

### Available Modes

#### `dev` - Development Mode (Default)

```bash
/cc-best:mode dev
```

**Behavior:**

- Code first, explain later
- Working solution over perfect solution
- Run tests after changes
- Keep commits atomic

**Best for:** Implementing features, fixing bugs, rapid iteration

#### `research` - Research Mode

```bash
/cc-best:mode research
```

**Behavior:**

- Understand first, act later
- Ask clarifying questions
- Document findings as you go
- Don't write code until requirements are clear

**Best for:** New project understanding, architecture analysis, tech research

#### `review` - Review Mode

```bash
/cc-best:mode review
```

**Behavior:**

- Read thoroughly before commenting
- Prioritize issues (Critical > High > Medium > Low)
- Suggest fixes, not just problems
- Check for security vulnerabilities

**Best for:** PR reviews, code analysis, quality assessment

#### `planning` - Planning Mode

```bash
/cc-best:mode planning
```

**Behavior:**

- Don't underestimate complexity
- Identify dependencies and risks
- Make plans concrete and actionable
- When in doubt, over-plan

**Best for:** Feature design, refactoring planning, architecture decisions

### Mode + Role Combinations

Modes change HOW Claude works. Roles change WHAT Claude does.

| Mode       | Best Combined With             |
| ---------- | ------------------------------ |
| `dev`      | `/cc-best:dev`                 |
| `research` | `/cc-best:lead`, `/cc-best:pm` |
| `review`   | `/cc-best:qa`                  |
| `planning` | `/cc-best:lead`, `/cc-best:pm` |

### Example Workflow

```bash
# Planning phase
/cc-best:mode planning
/cc-best:pm "analyze user authentication requirements"

# Development phase
/cc-best:mode dev
/cc-best:dev "implement JWT authentication"

# Review phase
/cc-best:mode review
/cc-best:qa "review authentication module"

# Research phase
/cc-best:mode research
/cc-best:lead "investigate OAuth 2.0 best practices"
```

---

## FAQ

### Which mode should I use as a beginner?

Start with `/cc-best:pair`. It helps you learn how Claude works and understand each decision.

### Can I switch modes mid-task?

Yes. Just run the new mode command:

```bash
# Started with iterate, want to discuss something
/cc-best:pair  # Switches to pair mode
```

### What if /cc-best:iterate gets stuck?

Claude will:

1. Try 3 times to resolve
2. Record the blocker in progress.md
3. Ask for your input

You can also interrupt with `Ctrl+C` and use `/cc-best:pair` to debug together.

### Can I combine /cc-best:iterate with /mode?

Yes! `/cc-best:mode` affects how Claude works within any execution mode:

```bash
/cc-best:mode dev
/cc-best:iterate "implement features"
```

### How do I resume after interrupting /iterate?

Just run `/cc-best:iterate` again. Claude reads progress.md and continues from where it left off.

### /cc-best:cc-ralph vs just running /cc-best:iterate multiple times?

`/cc-best:cc-ralph` with ralph-loop plugin:

- Automatically resumes across terminal sessions
- Better for overnight/multi-hour tasks
- Tracks iteration count

`/cc-best:iterate`:

- Simpler, no extra plugin needed
- Good for tasks you'll complete in one sitting

---

# 中文版

本指南详细说明 CC-Best 中各种工作模式的使用方法，帮助你选择最适合的模式。

---

## 模式概览

| 模式                | 用途       | 用户参与度       | 适用场景           |
| ------------------- | ---------- | ---------------- | ------------------ |
| `/cc-best:iterate`  | 自主迭代   | 最低（仅阻塞时） | 明确任务、批量执行 |
| `/cc-best:pair`     | 结对编程   | 持续协作         | 学习、敏感操作     |
| `/cc-best:cc-ralph` | 长时间循环 | 最低（跨会话）   | 小时级项目         |
| `/cc-best:mode`     | 行为调整   | N/A（修饰符）    | 微调工作风格       |
| `/cc-best:model`    | 模型策略   | 一次性选择       | 切换质量/均衡/经济 |

### 快速选择指南

```
你有明确的任务清单吗？
├─ 有 → 任务相对安全吗？（无生产数据库操作等）
│       ├─ 是 → /cc-best:iterate
│       └─ 否 → /cc-best:pair
└─ 没有 → 需要学习或讨论吗？
          ├─ 是 → /cc-best:pair
          └─ 否 → 先 /pm，再 /cc-best:iterate
```

---

## /cc-best:iterate - 自主迭代

**作用**: Claude 自主执行任务，完成一个立即开始下一个，不等待你的输入。

### 何时使用

✅ **适合:**

- progress.md 中有明确的任务清单
- 任务有清晰的完成标准
- 风险可控（可回滚）
- 不需要逐步审查

❌ **不推荐:**

- 学习新代码库
- 敏感操作（生产环境、数据迁移）
- 需求不明确
- 需要理解每个决策

### 如何启动

```bash
# 基本用法：Claude 读取 progress.md 继续执行
/cc-best:iterate

# 指定目标
/cc-best:iterate "实现用户认证功能"

# 插件用户
/cc-best:iterate "实现用户认证功能"
```

### 管线模式

Iterate 支持两种管线模式（通过 `memory-bank/config.json` 配置）：

| 模式   | 管线                            | 适用场景         |
| ------ | ------------------------------- | ---------------- |
| `full` | PM → Lead → Designer → Dev → QA | 完整项目开发     |
| `lite` | Dev → Verify → Commit           | 快速编码、小改动 |

**Lite 模式** 跳过角色选择，直接 Dev → Verify → Commit。使用 `/cc-best:setup --interactive` 切换。

### 执行流程

```
1. Claude 读取 memory-bank/progress.md
2. 选择下一个任务
3. 选择合适的角色（/cc-best:pm, /cc-best:lead, /cc-best:dev, /qa）
4. 执行任务
5. 运行验证（/verify）
6. 提交变更
7. 更新 progress.md
8. 立即开始下一个任务（不等待）
```

### 如何控制

| 操作         | 方法                                  |
| ------------ | ------------------------------------- |
| **暂停**     | 按 `Ctrl+C` 或 `Esc`                  |
| **中断**     | 输入任何消息                          |
| **恢复**     | 说"继续"或重新运行 `/cc-best:iterate` |
| **永久停止** | 按 `Ctrl+C` 后不恢复                  |

### 停止条件

Claude 在以下情况自动停止：

1. ✅ progress.md 中所有任务完成
2. ✅ 你主动中断（Ctrl+C / Escape）
3. ✅ 无法自动解决的致命错误
4. ✅ 需要你决策的外部依赖
5. ✅ 上下文窗口接近上限（>80%）

### 最佳实践

1. **先准备 progress.md** - 清晰的任务 = 顺畅的迭代
2. **不要手动 `/clear`** - 让 Claude 管理上下文
3. **事后检查提交** - 完成后查看 git log
4. **用于批量任务** - 多个小任务时最有效

### 示例会话

```bash
# 你在 progress.md 中准备了任务：
# - [ ] TSK-001: 设置认证路由
# - [ ] TSK-002: 实现 JWT 中间件
# - [ ] TSK-003: 添加登录接口
# - [ ] TSK-004: 添加登出接口

/cc-best:iterate

# Claude 自动完成所有 4 个任务
# ~30 分钟后，所有任务完成并提交

# 查看发生了什么：
git log --oneline -10
```

---

## /cc-best:pair - 结对编程

**作用**: Claude 与你协作，在每个关键决策点询问确认。

### 何时使用

✅ **适合:**

- 🎓 学习新技术
- 💬 设计讨论
- ⚠️ 敏感操作（数据库迁移、生产环境）
- 🔍 需要解释的代码审查
- 🐛 复杂调试
- 📝 需求不明确

❌ **不推荐:**

- 简单重复的任务
- 你对方案很有信心
- 明确任务的批量执行

### 如何启动

```bash
# 基本用法
/cc-best:pair

# 带上下文
/cc-best:pair "帮我实现用户认证"

# 学习模式
/cc-best:pair --learn "教我如何写单元测试"

# 插件用户
/cc-best:pair "和我一起重构这个函数"
```

### 确认节点

Claude 会在以下节点询问你：

| 节点       | 示例问题                          |
| ---------- | --------------------------------- |
| 理解需求   | "我理解你需要 X，对吗？"          |
| 多个选项   | "方案 A 还是 B？我推荐 A 因为..." |
| 破坏性操作 | "即将删除 X，确认吗？"            |
| 外部调用   | "将调用生产 API，继续吗？"        |
| 提交       | "提交信息：'...'，确认吗？"       |

### Claude 可自主执行的操作

即使在结对模式，Claude 也可以：

- 读取文件
- 搜索代码
- 运行测试（只读）
- 格式化代码
- 生成文档

### 示例会话

```
你: /cc-best:pair 帮我重构这个函数

Claude: 让我看看这个函数...

我发现这些问题：
1. 太长（80 行）
2. 职责混杂
3. 嵌套过深（4 层）

我建议：
A) 提取验证逻辑
B) 使用早返回
C) 拆分为 3 个函数

从哪个开始？

你: 从 A 开始

Claude: 好的，提取验证逻辑...

[展示代码变更]

这是提取后的函数。变更点：
- 第 15-30 行移到了 validate_input()
- 主函数现在调用 validate_input()
- 测试仍然通过

看起来对吗？继续 B 吗？
```

---

## /cc-best:cc-ralph - 长时间循环

**作用**: 跨会话持续的自主开发。使用 `ralph-loop` 插件实现跨会话连续性。

### 前置条件

```bash
# 先安装 ralph-loop 插件
/plugin install ralph-loop@claude-plugins-official
```

> ⚠️ **Windows 用户**: ralph-loop 需要 bash。使用 WSL 或 Git Bash，或者坚持使用 `/cc-best:iterate`。

### 何时使用

✅ **适合:**

- 多小时的开发任务
- 跨多个会话的项目
- 你想启动任务后稍后回来

❌ **不推荐:**

- 快速修复（<30 分钟）
- 你想观察进度
- 学习或探索

### /cc-best:cc-ralph vs /cc-best:iterate

| 方面     | /cc-best:iterate | /cc-best:cc-ralph |
| -------- | ---------------- | ----------------- |
| 会话范围 | 单会话           | 跨会话            |
| 恢复方式 | 手动             | 自动              |
| 适合     | <2h 任务         | 小时级项目        |
| 依赖     | 无额外依赖       | ralph-loop 插件   |

### 如何启动

```bash
# 从 progress.md 自动继续
/cc-best:cc-ralph

# 指定任务
/cc-best:cc-ralph "实现用户认证"

# 指定模式
/cc-best:cc-ralph --mode full-feature "实现用户认证"
/cc-best:cc-ralph --mode bug-fix "修复登录超时"
/cc-best:cc-ralph --mode refactor "重构认证模块"

# 限制迭代次数
/cc-best:cc-ralph "完成 Phase 2" --max-iterations 20

# 插件用户
/cc-best:cc-ralph "实现功能 X"
```

### 可用模式

| 模式           | 用途                            | 完成信号            |
| -------------- | ------------------------------- | ------------------- |
| `full-feature` | 完整功能（需求→设计→编码→测试） | `FEATURE_COMPLETE`  |
| `iterate`      | 推进 progress.md 中的任务       | `PHASE_COMPLETE`    |
| `bug-fix`      | 定位并修复 Bug                  | `BUG_FIXED`         |
| `refactor`     | 改善代码质量                    | `REFACTOR_COMPLETE` |
| `fix-tests`    | 让测试通过                      | `TESTS_PASSING`     |
| `doc-gen`      | 生成/更新文档                   | `DOCS_COMPLETE`     |

### 如何停止

```bash
/ralph-loop:cancel-ralph
```

---

## /cc-best:mode - 行为调整

**作用**: 调整 Claude 的工作风格，不改变任务或角色。

### 可用模式

#### `dev` - 开发模式（默认）

```bash
/cc-best:mode dev
```

**行为:**

- 先写代码再解释
- 可用方案优于完美方案
- 变更后运行测试
- 保持提交原子化

**适合:** 实现功能、修复 Bug、快速迭代

#### `research` - 研究模式

```bash
/cc-best:mode research
```

**行为:**

- 先理解再行动
- 提出澄清问题
- 边探索边记录
- 需求清晰前不写代码

**适合:** 新项目理解、架构分析、技术调研

#### `review` - 审查模式

```bash
/cc-best:mode review
```

**行为:**

- 彻底阅读后再评论
- 按严重性排序（关键 > 高 > 中 > 低）
- 建议修复方案，不仅指出问题
- 检查安全漏洞

**适合:** PR 审查、代码分析、质量评估

#### `planning` - 规划模式

```bash
/cc-best:mode planning
```

**行为:**

- 不低估任务复杂度
- 识别依赖和风险
- 计划具体可执行
- 宁可过度规划

**适合:** 功能设计、重构规划、架构决策

### 模式 + 角色组合

模式改变 Claude 的工作方式，角色改变做什么。

| 模式       | 推荐组合                       |
| ---------- | ------------------------------ |
| `dev`      | `/cc-best:dev`                 |
| `research` | `/cc-best:lead`, `/cc-best:pm` |
| `review`   | `/cc-best:qa`                  |
| `planning` | `/cc-best:lead`, `/cc-best:pm` |

### 示例工作流

```bash
# 规划阶段
/cc-best:mode planning
/cc-best:pm "分析用户认证需求"

# 开发阶段
/cc-best:mode dev
/cc-best:dev "实现 JWT 认证"

# 审查阶段
/cc-best:mode review
/cc-best:qa "审查认证模块"

# 研究阶段
/cc-best:mode research
/cc-best:lead "调研 OAuth 2.0 最佳实践"
```

---

## 常见问题

### 初学者应该用哪个模式？

从 `/cc-best:pair` 开始。它帮助你了解 Claude 的工作方式，理解每个决策。

### 可以中途切换模式吗？

可以。直接运行新的模式命令：

```bash
# 开始用 iterate，想讨论某事
/cc-best:pair  # 切换到结对模式
```

### /cc-best:iterate 卡住了怎么办？

Claude 会：

1. 尝试 3 次解决
2. 在 progress.md 记录阻塞原因
3. 询问你的输入

你也可以用 `Ctrl+C` 中断，然后用 `/cc-best:pair` 一起调试。

### 可以组合 /cc-best:iterate 和 /cc-best:mode 吗？

可以！`/cc-best:mode` 影响任何执行模式中的工作方式：

```bash
/cc-best:mode dev
/cc-best:iterate "实现功能"
```

### 中断 /cc-best:iterate 后如何恢复？

重新运行 `/cc-best:iterate`。Claude 读取 progress.md，从中断处继续。

### /cc-best:cc-ralph 和多次运行 /cc-best:iterate 有什么区别？

`/cc-best:cc-ralph` 配合 ralph-loop 插件：

- 自动跨终端会话恢复
- 适合过夜/多小时任务
- 跟踪迭代次数

`/cc-best:iterate`：

- 更简单，无需额外插件
- 适合一次会话内完成的任务
