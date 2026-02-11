# 深度指南

> 深入了解 CC-Best 的方法论、决策原则和架构设计。

---

## 1. 道法术器哲学

CC-Best 建立在四层哲学之上：

```
道 (Dao)  — 哲学   → 元原则、核心价值观
法 (Fa)   — 方法   → 工作流模式、角色管线
术 (Shu)  — 实践   → 编码规范、测试规则
器 (Qi)   — 工具   → 钩子、脚本、自动化
```

### 为什么需要哲学

没有原则的 AI 编码助手会产出不一致的结果。CC-Best 在每个层级都嵌入了指导原则：

- **道** 定义 8 条核心原则（P1-P8）和 5 条自主决策原则（A1-A5）
- **法** 将原则转化为角色工作流（PM → Lead → Dev → QA）
- **术** 将标准实现为可执行规则（8 个目录中的 33 条规则）
- **器** 通过钩子自动化执行（8 个生命周期事件中的 18 个脚本）

### 元原则

| 原则                         | 说明                              |
| ---------------------------- | --------------------------------- |
| 凡是 AI 能做的，就不要人工做 | 自动化一切可自动化的              |
| 上下文是第一性要素           | 垃圾进垃圾出 — 投资于高质量上下文 |
| 先结构后代码                 | 实现前先规划架构                  |
| 奥卡姆剃刀                   | 如无必要，勿增代码 — 最简方案获胜 |

### 核心原则（P1-P8）

| ID  | 原则     | 规则                                    |
| --- | -------- | --------------------------------------- |
| P1  | 接口处理 | 调用前必须查阅文档 — **禁止猜测**       |
| P2  | 执行确认 | 执行前明确输入输出边界                  |
| P3  | 业务理解 | 逻辑必须来源于明确需求 — **禁止假设**   |
| P4  | 代码复用 | 创建新模块前检查现有实现                |
| P5  | 质量保证 | 提交前必须有可执行测试用例              |
| P6  | 架构规范 | 遵循现行架构，禁止跨层调用              |
| P7  | 诚信沟通 | 信息不完整时必须说明 — **禁止假装理解** |
| P8  | 代码修改 | 修改前分析依赖影响                      |

---

## 2. 角色管线详解

### PM：自主需求分析

PM 角色不是简单地转录用户请求 — 它自主分析：

- 阅读项目上下文（architecture.md、tech-stack.md、现有代码）
- 基于项目模式推断未明示的需求
- 记录每个决策的**置信度**（高/中/低）
- 创建结构化 REQ-XXX 文档，含验收标准
- 集成 `requirement-validator` 智能体交叉验证

**关键行为**：PM 不会中断问"你是什么意思？" — 它从上下文推断（A1）并记录置信度（A2）。

### Lead：技术设计 + PM 决策评审

Lead 角色在设计前评审 PM 的决策：

- **置信度复核**：重新评估 PM 标记为低/中置信度的决策
- 创建 DES-XXX（设计）和 TSK-XXX（任务）文档
- 将功能分解为可实现的单元
- 集成 `architect` 和 `planner` 智能体处理复杂设计
- 可调整 PM 决策（A3 下游纠偏）

### Designer：UI 指导（仅前端）

仅在前端任务时激活：

- 使用 `frontend-design` 技能生成高质量 UI 代码
- 避免 AI 通用审美（不用 Inter 字体、不用紫色渐变）
- 生成具有独特设计风格的生产级组件
- 提供设计令牌和组件规格说明

### Dev：自主问题解决

Dev 角色在不打断用户的情况下处理实现：

**问题解决框架**：

```
1. 在技术方案范围内？→ 按方案实现
2. 项目中有类似实现？→ 参考现有代码
3. 可以查文档解决？→ 查文档后实现
4. 需要技术决策？→ 选择最简方案，注释说明原因
```

**关键行为**：

- 在代码注释中记录重要决策
- 自审代码（风格、安全、性能）
- 前端代码在浏览器中验证（Playwright 集成）
- 集成 `code-simplifier` 做实现后清理
- 集成 `tdd-guide` 做测试驱动开发

### QA：Bug 分类

QA 不只是报告 Bug — 它对 Bug 进行分类：

| 类型             | 描述             | 动作                |
| ---------------- | ---------------- | ------------------- |
| **实现 Bug**     | 代码不符合设计   | 退回 Dev 修复       |
| **需求假设错误** | 设计基于错误假设 | 标记给 PM/Lead 评审 |

这种分类（A5）防止管线在"修复-测试"循环中空转——当真正的问题是需求缺陷时。

### 文档追溯链

```
REQ-001 "用户认证"
 ├→ DES-001 "基于 JWT 的认证 + refresh token"
 │   ├→ TSK-001 "实现登录接口"
 │   ├→ TSK-002 "实现 token 刷新"
 │   └→ TSK-003 "添加认证中间件"
 └→ REQ-001-clarify "密码要求"（如需要）
```

每个文档引用其父文档，形成从需求到实现的完整追溯链。

---

## 3. 自主决策原则（A1-A5）

### A1：上下文推断

**规则**：基于项目上下文推断 — 不中断循环询问用户。

**信息源**（优先级从高到低）：

1. 用户的明确描述
2. 项目现有实现模式
3. `architecture.md` 架构约束
4. `tech-stack.md` 技术栈约定
5. 行业通用惯例
6. MVP 原则（最后手段）

**示例**：如果项目各处都使用 TypeScript，新模块也应使用 TypeScript，无需询问。

### A2：决策记录

**规则**：为每个非平凡决策记录依据和置信度。

```markdown
<!-- 在 REQ 文档中 -->

**决策**：使用 WebSocket 实现实时更新
**依据**：现有聊天功能使用 WebSocket（src/ws/）；与架构一致
**置信度**：高（基于现有模式）
```

置信度等级：

- **高**：基于用户明确输入或清晰的项目模式
- **中**：从相关但不完全相同的上下文推断
- **低**：基于行业惯例或 MVP 原则 — 标注"待确认"

### A3：下游纠偏

**规则**：每个角色可以在其职责范围内纠正上游决策。

- **Lead 评审 PM**：可重新排定优先级、调整范围、标记不合理需求
- **Dev 调整 Lead 设计**：可做实现可行性的最小改动，记录原因
- **QA 区分 Bug 类型**：实现 Bug 退回 Dev；假设错误退回 PM/Lead

这创造了一个自我纠正的管线，而非僵化的流水线。

### A4：MVP 兜底

**规则**：当没有证据支持决策时，选择最小可行方案并标注"待确认"。

这可以防止：

- 分析瘫痪（在不确定的决策上浪费时间）
- 无依据假设（假装知道答案）
- 管线阻塞（停下来问用户）

### A5：问题分类

**规则**：区分实现 Bug 和需求假设错误。

| 信号                   | 分类     | 动作         |
| ---------------------- | -------- | ------------ |
| 代码不符合设计规格     | 实现 Bug | Dev 修复     |
| 设计规格与用户意图矛盾 | 假设错误 | PM/Lead 评审 |
| 测试通过但行为不正确   | 假设错误 | 重新评估需求 |
| 测试在边界情况失败     | 实现 Bug | Dev 修复     |

---

## 4. Iterate 模式精通

### 完整执行流程

```
┌─────────────────────────────────────────┐
│           迭代循环                        │
│                                          │
│  读取 progress.md                        │
│       ↓                                  │
│  选择角色（8 种状态条件）                 │
│       ↓                                  │
│  执行角色命令                            │
│       ↓                                  │
│  验证结果                                │
│       ↓                                  │
│  提交变更                                │
│       ↓                                  │
│  更新 progress.md                        │
│       ↓                                  │
│  ← 循环继续（不等待） ←                  │
│                                          │
│  停止条件：                               │
│  · 所有任务完成                           │
│  · 用户中断                              │
│  · 致命错误                              │
│  · 外部依赖                              │
│  · 上下文 > 70%（提示用户）              │
└─────────────────────────────────────────┘
```

### 角色自动选择逻辑

迭代引擎评估 8 种状态条件：

| #   | 条件               | 角色                | 动作                             |
| --- | ------------------ | ------------------- | -------------------------------- |
| 1   | 无 REQ 文档        | `/cc-best:pm`       | 需求分析                         |
| 2   | REQ 有低置信度项   | `/cc-best:clarify`  | 需求澄清                         |
| 3   | 有 REQ，无 DES     | `/cc-best:lead`     | 技术设计                         |
| 4   | 有 DES，含前端任务 | `/cc-best:designer` | UI 设计指导                      |
| 5   | 有待实现 TSK       | `/cc-best:dev`      | 编码 + 自测                      |
| 6   | 代码待验证         | `/cc-best:verify`   | 构建 + 类型 + lint + 测试 + 安全 |
| 7   | 验证通过           | `/cc-best:qa`       | 功能验收                         |
| 8   | QA 发现实现 Bug    | `/cc-best:dev`      | 修复 → 重新验证                  |

### 上下文管理策略

Iterate 模式**不主动** `/clear` — 保持对话连续性。

当上下文达到 ~70% 时：

1. 执行 `/cc-best:compact-context` 保存状态并生成摘要
2. 提示用户执行 `/clear`
3. 用户运行 `/cc-best:catchup` 恢复上下文
4. 继续迭代

> **已知问题**：Claude Code 的 auto-compact 有 bug（[#18211](https://github.com/anthropics/claude-code/issues/18211)）— 超过 ~85% 时 `/cc-best:compact-context` 可能失败。建议在 **70%** 时压缩。

### progress.md 滚动窗口

`memory-bank/progress.md` 使用滚动窗口保持可管理性：

- 活跃任务：始终可见
- 最近完成：最后 10 条记录
- 更早的完成项：文件超过 ~300 行时归档到 `memory-bank/archive/`
- `auto-archive.js` 钩子监控并提醒归档

### 故障恢复

如果 iterate 遇到错误：

1. 在 progress.md 中记录错误
2. 尝试自动解决（重试、替代方案）
3. 如果无法解决 → 标记任务为阻塞，继续下一个任务
4. 如果没有更多任务 → 停止并向用户报告

---

## 5. 结对编程精通

### 确认节点 vs 安全自主

**必须确认的操作**：
| 操作 | 风险等级 | 确认方式 |
| ---- | -------- | -------- |
| 理解需求 | — | "我理解你需要 X，对吗？" |
| 方案选择 | — | "方案 A/B？我建议 A，因为..." |
| 删除文件/数据 | 高 | "即将删除 X，确认吗？" |
| 数据库 DDL | 高 | 展示 SQL + 确认 |
| 生产环境操作 | 高 | 警告 + 确认 |
| Git 历史修改 | 中 | 解释影响 + 确认 |
| 依赖升级 | 中 | 展示变更 + 确认 |
| 配置修改 | 低 | 展示 diff + 确认 |

**可以自主执行**：

- 读取文件
- 搜索代码
- 运行测试（只读）
- 代码格式化
- 生成文档

### 沟通原则

1. **主动解释**：先说*为什么*，再说*做什么*
2. **提供选项**：给出背景和建议，让用户选择
3. **承认不确定**："这个我不太确定。可能的原因有：1... 2... 需要我深入调查吗？"

### 学习模式（`--learn`）

激活后，Claude 会：

- 每步之前解释背后的推理
- 展示中间结果
- 走查错误和调试过程
- 链接相关文档
- 鼓励提问

### 模式切换

| 场景                          | 切换到                         |
| ----------------------------- | ------------------------------ |
| Pair → 任务明确，用户信任方案 | `/cc-best:iterate`             |
| Iterate → 遇到敏感操作        | 暂停，讨论，然后恢复           |
| Iterate → 用户想学习          | 切换到 `/cc-best:pair --learn` |

---

## 6. 知识进化管线

CC-Best 通过四阶段管线从你的开发模式中学习：

### 阶段 1：观察（Observe）

`observe-patterns.js` PostToolUse 钩子自动记录：

- 工具使用模式（哪些工具、频率、顺序）
- 文件修改模式
- 错误恢复模式
- 命令使用频率

数据写入 `memory-bank/observations.jsonl`。

### 阶段 2：分析（Analyze）

`/cc-best:analyze` 挖掘多个数据源：

- 钩子产生的 `observations.jsonl`
- Git 历史（提交模式、文件修改频率）
- 错误日志
- 会话评估数据（来自 `evaluate-session.js`）

### 阶段 3：学习（Learn）

`/cc-best:learn` 提取可执行的知识：

- 值得编码化的常见模式
- 频繁的错误类型和解决方案
- 工作流瓶颈
- 需要补充的技能缺口

### 阶段 4：进化（Evolve）

`/cc-best:evolve` 将知识转化为新组件：

- 为重复工作流创建新命令
- 为常见模式创建新技能
- 为专业任务创建新智能体
- 基于学到的标准更新规则

### 新项目启动流程

1. 安装 CC-Best
2. 运行初始会话 — 钩子自动开始观察
3. ~10 次会话后，运行 `/cc-best:analyze` 获取初步洞察
4. 运行 `/cc-best:learn` 提取模式
5. 运行 `/cc-best:evolve` 生成项目专属组件

---

## 7. 记忆架构

### 三层结构

```
即时层（当前会话）
 └→ 短期层（memory-bank/progress.md）
     └→ 长期层（memory-bank/archive/、architecture.md、tech-stack.md）
```

| 层级       | 范围       | 机制                                           |
| ---------- | ---------- | ---------------------------------------------- |
| **即时层** | 当前对话   | Claude 的上下文窗口                            |
| **短期层** | 跨会话任务 | `progress.md` 滚动窗口                         |
| **长期层** | 项目知识   | `architecture.md`、`tech-stack.md`、`archive/` |

### 滚动窗口归档

`progress.md` 通过滚动归档保持可管理性：

- **阈值**：~300 行触发归档提醒（通过 `auto-archive.js` 钩子）
- **过程**：当前阶段之前的完成项移至 `archive/`
- **保留**：活跃和最近完成的项目留在 progress.md

### 压缩前状态保存

上下文压缩时，`pre-compact.js` 钩子保存：

- 当前 git 状态（分支、暂存文件、未提交变更）
- 活跃的 todo 列表
- 当前任务上下文
- 时间戳

状态保存到 `.pre-compact-state.json`，通过 `/cc-best:catchup` 恢复。

### 跨会话恢复

```bash
# 会话结束：保存上下文
/cc-best:checkpoint

# 新会话开始：恢复
/cc-best:catchup
# 读取：progress.md、.pre-compact-state.json、最近 git 日志
# 重建：当前任务、待处理工作、最近决策
```

---

## 8. 钩子系统详解

### 8 个生命周期事件

| 事件               | 触发时机     | 用途                 |
| ------------------ | ------------ | -------------------- |
| `SessionStart`     | 会话开始     | 健康检查，加载上下文 |
| `UserPromptSubmit` | 用户发送消息 | 注入项目状态         |
| `PreToolUse`       | 工具执行前   | 安全验证             |
| `PostToolUse`      | 工具执行后   | 格式化，模式观察     |
| `Stop`             | 响应完成     | 检查遗漏任务         |
| `SubagentStop`     | 子代理完成   | 追踪子代理结果       |
| `PreCompact`       | 上下文压缩前 | 保存状态             |
| `SessionEnd`       | 会话结束     | 评估并持久化         |

### 18 个钩子脚本分类

**安全类（5 个）**：
| 脚本 | 事件 | 功能 |
| ---- | ---- | ---- |
| `validate-command.js` | PreToolUse | 阻止危险命令（rm -rf、force push） |
| `pause-before-push.js` | PreToolUse | git push 前确认 |
| `check-secrets.js` | PreToolUse | 检测命令中的 API 密钥 |
| `protect-files.js` | PreToolUse | 阻止修改 .env、.key、.git/ |
| `long-running-warning.js` | PreToolUse | 警告 dev server、watch 等长命令 |

**质量类（3 个）**：
| 脚本 | 事件 | 功能 |
| ---- | ---- | ---- |
| `format-file.js` | PostToolUse | 文件写入后自动格式化 |
| `check-console-log.js` | PostToolUse | 标记 JS/TS 中的 console.log |
| `typescript-check.js` | PostToolUse | .ts 编辑后运行 tsc --noEmit |

**学习类（2 个）**：
| 脚本 | 事件 | 功能 |
| ---- | ---- | ---- |
| `observe-patterns.js` | PostToolUse | 追踪工具使用写入 observations.jsonl |
| `evaluate-session.js` | SessionEnd | 提取可学习的模式 |

**上下文管理类（5 个）**：
| 脚本 | 事件 | 功能 |
| ---- | ---- | ---- |
| `session-check.js` | SessionStart | 检查文件更新、项目配置 |
| `user-prompt-submit.js` | UserPromptSubmit | 注入项目状态信息 |
| `auto-archive.js` | PostToolUse | progress.md > 300 行时提醒 |
| `suggest-compact.js` | PostToolUse | 提醒压缩上下文 |
| `pre-compact.js` | PreCompact | 压缩前保存状态 |

**追踪类（3 个）**：
| 脚本 | 事件 | 功能 |
| ---- | ---- | ---- |
| `stop-check.js` | Stop | 检查未完成任务 |
| `subagent-stop.js` | SubagentStop | 记录子代理任务状态 |
| `session-check.js` | SessionStart | 初始会话健康检查 |

### 编写自定义钩子

钩子使用 Node.js，配合 `scripts/node/lib/utils.js` 工具库：

```javascript
#!/usr/bin/env node
const { readStdinJson } = require("../lib/utils.js");

async function main() {
  const input = await readStdinJson();
  // input: { tool_name, tool_input: { file_path, command, ... }, tool_result: { ... } }

  // 你的验证逻辑
  // 阻止：输出 JSON { "decision": "block", "reason": "..." }
  // 允许：exit 0 且无输出
}

main();
```

---

## 9. 多语言规则架构

### 结构

```
rules/
├── common/           # 7 条通用规则（无 paths 过滤）
│   ├── methodology.md
│   ├── coding-standards.md
│   ├── security.md
│   ├── testing.md
│   ├── output-style.md
│   ├── error-handling.md
│   └── performance.md
├── python/           # Python 专属
├── frontend/         # Vue/React/Angular/Svelte
├── java/             # Java/Spring
├── csharp/           # C#/.NET
├── cpp/              # C/C++
├── embedded/         # 嵌入式系统
└── ui/               # UI/UX 标准
```

### 规则激活

- `common/` 规则：**始终加载**（无 `paths` frontmatter）
- 语言规则：**条件加载**，通过 `paths` glob 模式

```markdown
---
paths:
  - "**/*.py"
---

# Python 专属规则，仅对 .py 文件激活
```

### 每种语言的四个维度

每个语言目录覆盖：

| 维度     | 文件模式           | 覆盖范围             |
| -------- | ------------------ | -------------------- |
| **风格** | `*-style.md`       | 命名、格式化、惯用法 |
| **测试** | `*-testing.md`     | 框架、覆盖率、模式   |
| **安全** | `*-security.md`    | 语言特定漏洞         |
| **性能** | `*-performance.md` | 优化、性能分析       |

### 添加新语言规则

1. 创建目录：`rules/your-lang/`
2. 添加带 `paths` frontmatter 的风格文件：
   ```markdown
   ---
   paths:
     - "**/*.rs"
   ---

   # Rust 编码规范
   ```
3. 按需添加测试、安全、性能文件
4. 更新 `ARCHITECTURE.md` 统计数据

---

## 10. 智能体策略

### 模型分配

| 模型       | 智能体                                                                | 原因                 |
| ---------- | --------------------------------------------------------------------- | -------------------- |
| **Opus**   | architect, planner, code-reviewer, code-simplifier, security-reviewer | 复杂推理、架构决策   |
| **Sonnet** | tdd-guide, build-error-resolver, requirement-validator                | 模式匹配、结构化验证 |

### 智能体能力

| 智能体                  | 用途                    | 由谁触发           |
| ----------------------- | ----------------------- | ------------------ |
| `architect`             | 系统设计、ADR 创建      | Lead 角色          |
| `planner`               | 任务分解、排期          | Lead 角色          |
| `code-reviewer`         | 质量 + 安全审计         | Dev/QA 角色        |
| `code-simplifier`       | 降低复杂度、提升可读性  | Dev 角色（实现后） |
| `security-reviewer`     | OWASP 检查、漏洞扫描    | QA 角色            |
| `tdd-guide`             | Red-Green-Refactor 指导 | Dev 角色           |
| `build-error-resolver`  | 诊断和修复构建失败      | Dev 角色（出错时） |
| `requirement-validator` | 需求一致性交叉检查      | PM 角色            |

### 智能体-技能预加载

智能体可在 frontmatter 中声明技能：

```yaml
---
name: code-reviewer
description: 代码审查智能体
tools: [Read, Glob, Grep, Bash]
skills: [security, testing]
---
```

这会将指定技能预加载到智能体上下文中，赋予其领域专业知识。

---

> **参考**：完整方法论详见 [rules/common/methodology.md](../../rules/common/methodology.md)。模式文档详见 [MODES.md](../../.claude-plugin/MODES.md)。
