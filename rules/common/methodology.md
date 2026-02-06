---
paths:
  - "**/*"
alwaysApply: true
---

# Development Methodology | 开发方法论（道法术器）

> This document defines project development philosophy and methodology standards.
> 本文档定义项目的开发哲学和方法规范，适用于所有开发活动。

---

## 道 (Dao) - Philosophy | 开发哲学

### Meta Principles | 元原则
- **Let AI do what AI can do** 凡是 AI 能做的，就不要人工做
- **Ask AI everything** 一切问题问 AI
- **Context is king, garbage in garbage out** 上下文是第一性要素，垃圾进垃圾出
- **Structure before code** 先结构后代码，规划好框架再实现
- **Occam's Razor: no unnecessary code** 奥卡姆剃刀：如无必要，勿增代码

### Core Principles | 核心原则

| ID | Principle 原则 | Description 说明 |
|----|----------------|------------------|
| P1 | API Handling 接口处理 | Must read docs before API calls 调用前必须查阅文档，**NO guessing 禁止猜测** |
| P2 | Execution Confirmation 执行确认 | Clarify I/O boundaries before execution 执行前明确输入输出边界 |
| P3 | Business Understanding 业务理解 | Logic must come from clear requirements 必须来源于明确需求，**NO assumptions 禁止假设** |
| P4 | Code Reuse 代码复用 | Check existing implementations before creating new 创建新模块前必须检查现有实现 |
| P5 | Quality Assurance 质量保证 | Must have executable test cases before commit 提交前必须具备可执行测试用例 |
| P6 | Architecture Compliance 架构规范 | Follow current architecture, no cross-layer calls 必须遵循现行架构规范 |
| P7 | Honest Communication 诚信沟通 | Must clarify when info is incomplete 信息不完整时必须说明，**NO pretending 禁止假装理解** |
| P8 | Code Modification 代码修改 | Analyze dependencies before changes, keep rollback path 修改前必须分析依赖影响 |

### Autonomous Decision Principles | 自主决策原则（自循环模式）

> **Core idea: Infer from context, don't interrupt to ask; Record decisions, don't assume baseless**
> **核心理念：基于上下文推断，而非中断询问；记录决策，而非凭空假设**

| ID | Principle 原则 | Description 说明 |
|----|----------------|------------------|
| A1 | Context Inference 上下文推断 | Infer from project context (architecture, tech stack, existing code) 基于项目上下文推断，**don't interrupt 不中断循环询问用户** |
| A2 | Decision Recording 决策记录 | Record **rationale** and **confidence** (high/medium/low) 记录**依据**和**置信度** |
| A3 | Downstream Correction 下游纠偏 | Lead can adjust PM decisions, QA can identify assumption errors 形成闭环 |
| A4 | MVP Fallback 兜底 | Use minimal viable approach when uncertain, mark "TBD" 无依据时采用最小可行方案，标注"待确认" |
| A5 | Issue Classification 问题分类 | Distinguish "implementation bugs" vs "requirement assumption errors" 区分"实现Bug"和"需求假设错误" |

### Decision Priority | 决策依据优先级

```
1. User's explicit description    → Highest priority 最高优先级
2. Existing project implementation → Reference existing patterns 参考已有模式
3. Architecture constraints       → Follow architecture.md 遵循架构约束
4. Tech stack conventions         → Follow tech-stack.md 遵循技术栈约定
5. Industry conventions           → Use common practices 采用通用做法
6. MVP principle                  → Minimal viable approach 最小可行方案
```

### Design Philosophy | 设计哲学

| ID | Philosophy 哲学 | Requirement 要求 |
|----|-----------------|------------------|
| CP1 | Good Taste 好品味 | Eliminate special cases through better modeling; refactor if branches≥3 通过更通用建模消除特殊情况 |
| CP2 | Don't Break User Space 不破坏用户空间 | Provide compatibility layer or migration path for API changes 接口变更需提供兼容层 |
| CP3 | Pragmatism 实用主义 | Solve real problems first, avoid over-engineering 优先解决真实问题 |
| CP4 | Simplicity Obsession 简洁执念 | Single responsibility, complexity≤10, nesting≤3 函数单一职责 |
| CP5 | Deep Thinking 深度思考 | Execute ultrathink before important changes 重要变更前执行 ultrathink 预检 |

### Sub-Agent Principles | 子代理使用原则

| ID | Principle 原则 | Description 说明 |
|----|----------------|------------------|
| SA1 | Depth Limit 深度限制 | Sub-agent nesting depth ≤ 2 levels 子代理嵌套深度不超过 2 层 |
| SA2 | Task Decomposition 任务分解 | Decompose complex tasks into independent subtasks 复杂任务分解为独立子任务 |
| SA3 | Result Verification 结果验证 | Sub-agent results must be verified in main task 子代理结果必须在主任务中验证 |
| SA4 | Context Isolation 上下文隔离 | Sub-agents have independent context, pass info explicitly 需显式传递必要信息 |
| SA5 | Failure Handling 失败处理 | Main task needs fallback plan when sub-agent fails 子代理失败时需有备选方案 |

### Failure Recovery | 失败恢复流程

| Failure Type 失败类型 | Recovery Flow 恢复流程 |
|-----------------------|------------------------|
| **Test Failure 测试失败** | Save state → Analyze → Targeted fix → Retest 保存失败状态 → 分析原因 → 定向修复 → 重新测试 |
| **Build Failure 编译失败** | Rollback → Incremental change → Verify 回滚到上一个工作状态 → 增量修改 → 验证编译 |
| **Assumption Error 假设错误** | Record in progress.md → Continue → Fix in next iteration 记录 → 继续当前任务 → 后续迭代修正 |
| **Missing Dependency 依赖缺失** | Mark blocked → Record → Try mock or skip 标记阻塞 → 记录依赖项 → 尝试 Mock |
| **Context Lost 上下文丢失** | Execute `/cc-best:catchup` → Read progress.md → Restore state 执行 `/cc-best:catchup` → 恢复状态 |
| **Frontend Render Failure 前端渲染失败** | Check console → Screenshot → Locate component → Fix 检查 Console → 截图 → 定位组件 → 修复 |

---

## 法 (Fa) - Method | 开发方法

### Method Rules | 方法规则
- **One-liner goal + non-goals** 一句话目标 + 非目标 - Define boundaries clearly 明确边界
- **Copy don't write** 能抄不写 - Prefer existing solutions 优先使用现成轮子
- **Read official docs** 看官方文档 - Feed docs to AI 把文档喂给 AI
- **Split by responsibility** 按职责拆模块 - Single responsibility 单一职责
- **Interface first, implementation later** 接口先行，实现后补
- **One module at a time** 一次只改一个模块
- **Docs are context** 文档即上下文，不是事后补

### Minimum Work Unit | 最小工作单元

Do one thing at a time 每次只做一件事：
- Create one file 创建一个文件
- Implement one function 实现一个函数
- Fix one bug 修复一个 bug
- Add one test 添加一个测试

### Role Collaboration Flow | 角色协作流程

```
/cc-best:pm  → Analyze requirements autonomously, output REQ (with decision records + confidence)
       自主分析需求，输出 REQ（含决策记录+置信度）
  ↓
/cc-best:clarify → Clarify pending items (if needed, when pending items ≥ 1 or low confidence decisions ≥ 1)
           澄清待确认项（如需，待澄清项≥1 或 低置信度决策≥1 时触发）
  ↓
/cc-best:lead → Review PM decisions, can adjust, output DES + TSK (organized by User Story)
        评审 PM 决策，可调整，输出 DES + TSK（按 User Story 组织）
  ↓
/cc-best:designer → [Frontend tasks] UI design review, output design guidance (optional)
            【前端任务】UI 设计审查，输出设计指导（可选）
  ↓
/cc-best:dev  → Implement autonomously, record implementation decisions
        自主实现，记录实现决策
  ↓
/cc-best:qa   → Distinguish issue types (implementation bug vs assumption error)
        区分问题类型（实现bug vs 假设错误）
  ↓
/cc-best:commit → /clear → Next task 下一任务
```

> **Note**: `/cc-best:designer` role intervenes for frontend UI tasks, pure backend tasks can skip.
> **注意**: `/cc-best:designer` 角色在涉及前端 UI 的任务时介入，纯后端任务可跳过。

---

## 术 (Shu) - Practice | 开发技术

### Debug Standards | Debug 规范

Only provide: **Expected vs Actual + Minimal reproduction**
只给：**预期 vs 实际 + 最小复现**

### Pre-Execution Checklist | 执行前检查清单

Before each task execution 每次执行任务前，确认：
- [ ] Read relevant docs and confirmed API specs 已阅读相关文档并确认接口规范 (P1)
- [ ] Clarified task boundaries and expected output 已明确任务边界与输出预期 (P2)
- [ ] Checked reusable modules or code 已核对可复用模块或代码 (P4)
- [ ] Prepared test plan 已准备测试方案 (P5)
- [ ] Confirmed architecture compliance 已确认符合架构规范 (P6)
- [ ] Nesting ≤ 3, single responsibility 嵌套层级 ≤ 3，函数单一职责 (CP4)

### Autonomous Decision Checklist | 自主决策检查清单

In autonomous mode, before making decisions 在自循环模式中，做决策前确认：
- [ ] Read project context (progress.md, architecture.md, tech-stack.md) 已读取项目上下文
- [ ] Searched for similar implementations in project 已搜索项目中类似实现
- [ ] Decision has clear rationale (not baseless assumption) 决策有明确依据（非凭空假设）
- [ ] Confidence level marked 已标注决策置信度
- [ ] Low confidence decisions marked "TBD" 低置信度决策已标注"待确认"

### UltraThink Pre-check Template | UltraThink 预检模板

Execute before important changes 重要变更前执行：
```
1. Problem restatement: What am I doing? 问题重述：我要做什么？
2. Constraints & goals: What limits? What success criteria? 约束与目标：有哪些限制？成功标准是什么？
3. Boundaries & counterexamples: What not to handle? What's wrong? 边界与反例：什么情况不处理？什么是错误的做法？
4. Simpler model: Is there a simpler approach? 更简模型：有没有更简单的方案？
5. Risks & rollback: What could go wrong? How to rollback? 风险与回退：可能出什么问题？如何回退？
```

---

## 器 (Qi) - Tools | 开发工具

### Claude Code Tips | Claude Code 使用技巧

#### Context Management | 上下文管理

**Normal Development Mode 普通开发模式**:
- **Use `/clear` frequently** 频繁使用 `/clear` - Clear context after completing a feature 完成一个功能后清除上下文

**`/cc-best:iterate` Autonomous Loop Mode 自主循环模式**:
- **Don't `/clear` proactively** 不主动 `/clear` - Maintain loop continuity 保持循环连续性，unless context usage > 80%
- Save state to progress.md before clear when approaching limit 上下文接近上限时，保存状态后再 clear

**`/cc-best:pair` Pair Programming Mode 结对编程模式**:
- Maintain conversation continuity, don't `/clear` proactively 保持对话连贯性，不主动 `/clear`
- User decides when to clear context 用户决定何时清理上下文

**General Rules 通用规则**:
- **Don't overload MCPs** MCP 不要贪多 - Enable no more than 10 simultaneously 同时启用不超过 10 个
- **Use `@` for quick context** 使用 `@` 快速添加上下文 - `@filepath` adds file
- **Use `!` for commands** 使用 `!` 执行命令 - `!git status` is faster than asking Claude

#### Planning Mode | 规划模式
- **Plan complex tasks first** 复杂任务先规划 - Use Plan Mode to align before coding
- **Pause to confirm** 暂停确认 - Tell Claude "Give me the plan first, don't write code"
- **Review proposal** 方案评审 - Discuss and refine plan before green light

#### Shortcuts | 快捷键
- `Escape` - Stop Claude 停止 Claude
- `Ctrl+V` - Paste image 粘贴图片
- `#` - Quick add instruction to CLAUDE.md 快速添加指令到 CLAUDE.md

### Model Selection Strategy | 模型选择策略

| Scenario 场景 | Model 模型 | Reason 原因 |
|---------------|------------|-------------|
| Architecture design 架构设计 | Opus | Strong complex reasoning 复杂推理能力强 |
| Code implementation 代码实现 | Opus/Sonnet | High code quality 代码质量高 |
| Code review 代码审查 | Opus | Accurate architecture judgment 架构判断准确 |
| Simple queries 简单查询 | Sonnet | Cost optimization 成本优化 |
| Quick tasks 快速任务 | Haiku | Speed priority 速度优先 |

### Frontend Verification Tools (Playwright) | 前端验证工具

#### Core Tools | 核心工具

| Tool 工具 | Purpose 用途 | Use Case 使用场景 |
|-----------|--------------|-------------------|
| `browser_navigate` | Navigate to URL 导航到 URL | Open target page 打开目标页面 |
| `browser_snapshot` | Get page structure 获取页面结构 | Check element existence 检查元素存在性 |
| `browser_take_screenshot` | Screenshot 截图 | Record verification results 记录验证结果 |
| `browser_console_messages` | Console logs | Check frontend errors 检查前端错误 |
| `browser_click` | Click element 点击元素 | Interaction testing 交互测试 |
| `browser_type` | Input text 输入文本 | Form testing 表单测试 |
| `browser_wait_for` | Wait for condition 等待条件 | Async operation verification 异步操作验证 |

#### When to Use | 使用时机
- **Dev self-test Dev 自测**: Quick verification after frontend code completion 前端代码完成后快速验证
- **QA acceptance QA 验收**: Frontend functionality completeness testing 前端功能完整性测试
- **Bug location Bug 定位**: Screenshot + Console logs assist debugging 截图 + Console 日志辅助调试

#### Permission Configuration | 权限配置

Add in `settings.local.json` (refer to `settings.local.json.example`)
需在 `settings.local.json` 中添加（参考 `settings.local.json.example`）

#### Screenshot Management | 截图管理

| Config 配置 | Description 说明 |
|-------------|------------------|
| **Directory 存放目录** | `.claude/screenshots/` |
| **Git ignore** | Configured in `.gitignore` 已在 `.gitignore` 中配置 |
| **Naming convention 命名规范** | `{page-name}-{timestamp}.png` |
| **Cleanup timing 清理时机** | After `/clear` or `/cc-best:checkpoint` |

Example 截图示例：
```bash
browser_take_screenshot → .claude/screenshots/login-page-20250122.png
```

#### Login State Handling | 登录状态处理

For projects requiring login 对于需要登录的项目：

**Method 1: Manual login (Recommended) 手动登录（推荐）**
```
1. browser_navigate to login page 到登录页
2. Manually complete login in the popup browser 手动在弹出的浏览器中完成登录
3. Browser will maintain session state after login 登录后浏览器会保持会话状态
4. Subsequent operations auto-reuse that session 后续操作自动复用该会话
```

**Method 2: Automated login 自动化登录**
```
1. browser_navigate to login page 到登录页
2. browser_type username/password (read from env vars) 输入用户名/密码（从环境变量读取）
3. browser_click login button 点击登录按钮
4. browser_wait_for login completion 等待登录完成
```

**Notes 注意事项**：
- Don't hardcode credentials, use environment variables 凭证不要硬编码，使用环境变量
- Add login state files to `.gitignore` 登录状态文件加入 `.gitignore`
- Delete sensitive operation screenshots promptly 敏感操作截图及时删除
