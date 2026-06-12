# Changelog / 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🚀 Roadmap / 路线图

### v0.5.x ✅ (Released 2025-01-25 ~ 2026-02-05) - 质量保证与架构优化

**核心目标**: 提升可靠性、扩大受众、完善架构

- [x] Hook 验证脚本（配置正确性自动检测）
- [x] GitHub Actions CI（frontmatter、路径自动验证）
- [x] Skills 父子结构重组（17 个技能，42 个文件）
- [x] 数据库专属最佳实践（PostgreSQL、MySQL、Oracle、SQLite）
- [x] `/designer` 命令 + `architecture` 技能
- [x] Windows 兼容性修复
- [x] 文档审计与一致性修复
- [ ] ~~核心命令英文版~~ → 官方暂无插件级 i18n（原跟踪 issue #7233 已失效）；英文用户可设置 settings.json `"language": "english"` 让 Claude 输出英文作为变通

### v0.6.x ✅ (Released 2026-02-08 ~ 2026-02-12) - 综合审计 + 学习管线 + 架构增强 + 文档升级

**核心目标**: 修复已知 bug + 全面审计规范化 + 自动学习闭环 + CI 自动发布

- [x] 修复 16 个 rules frontmatter `alwaysApply` bug
- [x] 学习管线闭环（observe-patterns.js → observations.jsonl → /learn）
- [x] CI 自动发布（tag push → GitHub Release）
- [x] Agent 能力增强（exploration/learning 技能扩展）
- [x] 脚本黑盒化（5 个 hook 脚本 --help 支持）
- [x] Python Rules 补齐（testing/security/performance 3 个规则文件）
- [x] Skill 子文件提取（6 个命令知识内容→独立子文件，减少命令体积）
- [x] Git Skill 拆分（SKILL.md → 3 个子文件，584→<480 行）
- [x] 综合审计修复（Agent 格式规范化、Commands argument-hint/交叉引用、Rules 路径扩展、Legacy 脚本清理、SKILL.md 引用补全）

### v0.7.x ✅ (Released 2026-02-13 ~ 2026-02-24) - Lite 模式 + 模型策略 + 综合审计修复

**核心目标**: 降低上手门槛 + Token 成本控制 + 全面审计修复

- [x] **Lite 模式** - iterate 管线行为精简（跳过 PM/Lead/Designer/QA，直接 Dev→Verify→Commit）
- [x] **三档模型策略** - Quality（全 Opus）/ Balanced（设计 Opus + 执行 Sonnet）/ Economy（核心 Sonnet + 其余 Haiku），交互式切换
- [x] **Hotfix 快速通道** - 精简管线（Dev→Verify→Commit），跳过 PM/Lead 分析
- [x] **Mermaid 流程图** - 管线角色决策树、异常回退路径可视化
- [x] **综合审计修复** - Hook --help 全覆盖、闭合总结全覆盖、孤儿脚本清理、竞争条件修复
- [ ] 常见错误诊断与修复建议

### v0.8.0 ~ v0.8.2 ✅ (Released 2026-02-26 ~ 2026-03-05) - 模型策略 + Token 优化 + 会话智能

**核心目标**: Token 成本控制 + 会话智能闭环 + 生态扩展

- [x] **Smart Routing** - Mode Context 模板 + 任务→模型推荐矩阵 (v0.8.0)
- [x] **Token 加载优化** - 始终加载 -30%，testing.md 拆分，CLAUDE.md 精简 (v0.8.1)
- [x] **Session Intelligence** - Session 摘要持久化 + 自动恢复上下文 (v0.8.2)
- [x] **Instinct 追踪** - pattern_id 聚合 + 动态置信度 + 高置信度候选标记 (v0.8.2)
- [x] **De-Sloppify** - iterate 管线 QA 后自动触发 code-simplifier 清理 (v0.8.2)
- [x] **红旗自动化** - 红旗 #4 PostToolUse 实时检测 (v0.8.2)
- [x] **压缩抑制** - 调试循环中自动抑制 compact 建议 (v0.8.2)
- [x] **CI 审计加固** - 共享 parse-frontmatter、MIN_EXPECTED 守卫、CRLF 兼容 (v0.8.2)

### v0.9.x - 官方合规 + 自身完善

**核心目标**: 对齐 Claude Code v2.1.76 官方变更 + 语言规则补齐

- [x] **4 个新 Hook 事件** - PostCompact、PostToolUseFailure、Notification、SubagentStart (v0.9.0)
- [x] **Agent frontmatter 增强** - background、isolation、memory 新字段 (v0.9.0)
- [x] **Hook Profile 系统** - 3 档控制（minimal/standard/full），环境变量切换 (v0.9.0)
- [x] **置信度决策门控** - Lead/Dev 嵌入检查点 (v0.9.0)
- [x] **自治循环增强** - Stall 检测 + PDCA 学习闭环 (v0.9.0)
- [x] **证据要求完成** - QA 4 个强制验证问题 + 幻觉红旗检测 (v0.9.0)
- [x] **Rust + Go 语言规则** - 8 个新规则文件 (v0.9.0)
- [x] **组件按需安装清单** - 15 个组件家族 + 3 个预设 (v0.9.0)
- [x] **plugin settings.json** - Agent 默认配置 (v0.9.0)

### v0.10.x ✅ (Released 2026-04-09) - 对齐 Claude Code v2.1.97

**核心目标**: 同步 Claude Code v2.1.97 新特性 + 插件规范增强

- [x] **7 个新 Hook 事件** - PermissionRequest、PermissionDenied、InstructionsLoaded、FileChanged、CwdChanged、ConfigChange、TaskCompleted，事件总数 12→19 (v0.10.0)
- [x] **7 个新 Hook 脚本** - 权限追踪、文件变更检测、目录切换、配置变更、指令加载验证、任务完成追踪，脚本总数 23→30 (v0.10.0)
- [x] **Agent frontmatter 增强** - effort（推理深度）、disallowedTools（工具黑名单）新字段 (v0.10.0)
- [x] **Rules description 字段** - 43 个规则文件全部添加 description，提升规则加载精准度 (v0.10.0)
- [x] **plugin.json 新字段** - hooks 显式声明、userConfig 用户配置、bin 可执行文件 (v0.10.0)
- [x] **${CLAUDE_PLUGIN_DATA} 支持** - utils.js 新增 getPluginDataDir()，向前兼容 fallback 到 memory-bank (v0.10.0)
- [x] **bin/ 诊断工具** - cc-best-info 命令行工具，输出插件版本和组件统计 (v0.10.0)
- [x] **Skill 渐进式加载** - frontend/security/git SKILL.md 精简 82%，详细内容提取到子文件 (v0.10.0)
- [x] **模型路由增强** - 任务性质维度 + inherit 模型层级，3 个 agent 继承用户模型 (v0.10.0)
- [x] **置信度门控强化** - Lead 可行性检查升级为 MUST，<60% 自动回退 PM (v0.10.0)
- [x] **并行执行指南** - Dev 命令新增 Wave→Checkpoint→Wave 模式 (v0.10.0)
- [x] **CI 反模式检测** - SKILL.md 行数/引用断裂检查 + agent description 质量检查 (v0.10.0)
- [x] **方法论增强** - "组装优于创建"原则 + AI 审美反模式表 (v0.10.0)
- [x] **角色工具边界** - PM/Lead/Designer 明确禁止修改源代码，仅允许 .md 文档 (v0.10.0)
- [x] **Token 消耗优化** - coding-standards.md -85%，common rules 总计 -35% (v0.10.0)

### v0.11.x (Current) - 对齐 Claude Code v2.1.173 + 生态扩展

**核心目标**: 同步 Claude Code v2.1.98→v2.1.173 官方变更 + 生态扩展

- [x] **MessageDisplay Hook 事件** - 显示层敏感信息打码，事件总数 19→20 (v0.11.0)
- [x] **SessionStart sessionTitle** - 自动以"目录:分支"命名会话 (v0.11.0)
- [x] **角色命令 disallowed-tools** - pm/lead/designer/clarify 强制移除 Bash (v0.11.0)
- [x] **模型别名文档更新** - Opus 4.8 默认 high effort、Fable 5 (claude-fable-5) 说明 (v0.11.0)
- [ ] **npm 分发** - 发布到 npm registry，支持 `npx cc-best` 安装
- [ ] **Skill 评估体系** - 参考 PluginEval，为 skill/agent 建立质量评分和基准测试
- [ ] **跨会话学习增强** - Reflexion 模式，错误模式跨会话持久化和自动预防
- [ ] **剩余 Skill 渐进式加载** - learning(359行) 等中等 SKILL.md 精简
- [ ] **Hook HTTP 模式** - 支持 hook POST 到远程端点（通知、监控集成）
- [ ] **MCP 配置模板** - 按语言/框架提供常用 MCP 服务器配置模板
- [ ] 持续跟进 Claude Code 官方变更

### v1.0.0 (Future) - 稳定版

**核心目标**: 生产级可靠 + 生态完整

- [ ] 稳定的插件 API（无破坏性变更）
- [ ] Memory-bank 云同步（可选）
- [ ] 团队协作支持（多人共享配置）
- [ ] 完整 i18n（官方仅有 `language` 回复语言设置，暂无插件组件级 i18n 机制）

---

## Recent Changes / 近期变更

### [0.11.0] - 2026-06-11

#### Theme / 主题: 对齐 Claude Code v2.1.173

同步 Claude Code v2.1.98→v2.1.173 的官方变更：新增 MessageDisplay hook 事件、SessionStart 会话自动命名、角色命令 disallowed-tools 强制工具边界，并更新模型别名文档（Opus 4.8 / Fable 5）。

#### Added / 新增

- **MessageDisplay Hook 事件**（v2.1.152+）— 新增 `message-display.js`，在助手消息显示时打码 API 密钥、Token、JWT 等敏感信息（仅影响屏幕显示，不影响 transcript 和 Claude 上下文），Hook 事件从 19 个扩展至 20 个，脚本总数从 29 增加到 30
- **SessionStart `sessionTitle`**（v2.1.152+）— `session-check.js` 自动以"目录名:分支名"命名会话（等效 /rename，仅 startup/resume 时生效）
- **角色命令 `disallowed-tools`**（v2.1.152+）— pm/lead/designer/clarify 四个角色命令添加 `disallowed-tools: Bash`，强制执行角色工具边界（官方确认 skills/commands 的 `allowed-tools` 存在不限制工具的 bug，`disallowed-tools` 为有效替代）

#### Changed / 变更

- **兼容性基线** — 从 Claude Code v2.1.97 更新到 v2.1.173
- **Hook Profile 注册表** — HOOK_PROFILES 新增 message-display（safety 类）
- **模型别名文档**（/model 命令）— 说明 `opus` 别名当前指向 Opus 4.8（v2.1.154+ 默认 high effort）；Fable 5（`claude-fable-5`，v2.1.170+，1M 上下文/128k 输出）需显式写完整模型 ID
- **stop-check.js 注释** — 记录 v2.1.145+ Stop hook `additionalContext` 能力及有意不使用的原因（避免常驻未完成任务导致无限继续循环）
- **文档同步** — plugin.json/marketplace.json/manifests 版本 0.11.0；ARCHITECTURE.md、hooks/README.md、llms.txt×2、docs/index.html、docs/guides/advanced.md 统计更新（20 事件/30 脚本）

#### Fixed / 修复

- **插件安装失败**（#4）— `plugin.json` 的 `userConfig.hookProfile` 使用了验证器不支持的 `enum`/`description` 键且缺少必需的 `title`，导致 Claude Code 2.1.x 上 manifest 校验失败、无法安装；改为 `title` + `type` + `default` 格式

#### Notes / 备注（官方新能力，无需插件改动）

- `/reload-skills`（v2.1.152+）— 开发 skill 时免重启重扫描
- `/cd`（v2.1.169+）— 切换工作目录且不打断 prompt cache
- `--safe-mode` / `disableBundledSkills`（v2.1.169+）— 故障排查时禁用自定义/内置 skills
- 管理设置 `requiredMinimumVersion`/`requiredMaximumVersion`（v2.1.163+）

### [0.10.0] - 2026-04-09

#### Theme / 主题: 对齐 Claude Code v2.1.97 + 插件规范增强

同步 Claude Code v2.1.76→v2.1.97 的官方变更，新增 7 个 hook 事件和脚本，增强 agent/rules 元数据，引入 plugin.json 新字段和 bin/ 可执行文件支持。融入社区最佳实践：渐进式加载、任务类型路由、inherit 模型层级、置信度门控、并行执行、CI 反模式检测。

#### Added / 新增

- **7 个新 Hook 事件** — PermissionRequest（权限请求记录）、PermissionDenied（权限拒绝追踪）、InstructionsLoaded（指令加载验证）、FileChanged（外部文件变更检测）、CwdChanged（工作目录变更记录）、ConfigChange（配置文件变更提醒）、TaskCompleted（任务完成追踪），Hook 事件从 12 个扩展至 19 个
- **7 个新 Hook 脚本** — `permission-request.js`、`permission-denied.js`、`instructions-loaded.js`、`file-changed.js`、`cwd-changed.js`、`config-change.js`、`task-completed.js`，脚本总数从 23 个增加到 30 个
- **Agent `effort` 字段** — 8 个 agent 全部添加推理深度控制（high/medium/low）
- **Agent `disallowedTools` 字段** — code-reviewer、security-reviewer、requirement-validator 添加工具黑名单，防止审查类 agent 直接修改代码
- **Rules `description` 字段** — 43 个规则文件全部添加 description frontmatter，帮助 Claude Code 精准判断何时加载规则
- **plugin.json `hooks` 字段** — 显式声明 hooks.json 路径
- **plugin.json `userConfig` 字段** — 声明 hookProfile 用户配置项
- **plugin.json `bin` 字段** — 注册 bin/ 目录可执行文件
- **`bin/cc-best-info`** — 插件诊断工具，输出版本、组件统计、hook profile 等信息
- **`getPluginDataDir()` 函数** — utils.js 新增，优先使用官方 `${CLAUDE_PLUGIN_DATA}` 环境变量，向前兼容 fallback 到 memory-bank/

#### Changed / 变更

- **Hook Profile 注册表扩展** — HOOK_PROFILES 新增 7 个 hook 映射（safety: permission-request, quality: file-changed/cwd-changed/config-change/instructions-loaded, learning: permission-denied/task-completed）
- **install-components.json** — baseline 家族新增 permission-request，quality 家族新增 4 个质量 hook，learning 家族新增 2 个学习 hook
- **兼容性基线** — 从 Claude Code v2.1.76 更新到 v2.1.97
- **Skill 渐进式加载** — frontend/security/git SKILL.md 精简（1195→217 行，-82%），详细内容提取到子文件（patterns.md、owasp-patterns.md）
- **模型路由增强** — routing-matrix 新增任务性质维度（背景/推理/长上下文/模式化）+ Agent 模型策略文档
- **Agent inherit 层级** — build-error-resolver/tdd-guide/requirement-validator 移除 model 字段，继承用户当前模型
- **置信度门控强化** — Lead 步骤 7 从"推荐"升级为"MUST"，可行性 <60% 自动回退 PM
- **并行执行指南** — Dev 命令新增 Wave→Checkpoint→Wave 并行执行原则
- **方法论增强** — 新增"Assemble don't create"原则（AI 时代组装 > 创建）
- **Designer AI Slop 反模式** — 新增 6 个具体 AI 审美反模式及替代方案表
- **CI 反模式检测** — validate-skills 新增 SKILL.md 行数警告（>400）和子文件引用断裂检查；validate-agents 新增 description 质量检查
- **Hook Profile 全量执行** — 16 个早期 hook 补齐 `shouldRunInProfile()` 检查，profile 系统现在对全部 29 个注册 hook 生效
- **init.js 迁移** — 从 hooks/ 移至 scripts/node/（非 hook 脚本，不应放在 hooks 目录）
- **工作流顺序修正** — CLAUDE.md 和 methodology.md 管线顺序从 dev→qa→verify 纠正为 dev→verify→qa
- **角色工具边界** — PM/Lead/Designer NEVER 指令明确禁止修改源代码，methodology.md 新增角色工具边界表
- **Token 消耗优化** — coding-standards.md 从 385→58 行（-85%），common rules 总计 -35%
- **文档同步** — 修复 7 处过时组件计数（status.md、README、quickstart、index.html 等）

### [0.9.0] - 2026-03-16

#### Theme / 主题: 官方合规 + 能力增强 + 自身完善

基于 Claude Code v2.1.76 官方变更调研，从官方合规性、能力增强、自身完善三个维度的全面升级。

#### Added / 新增

- **4 个新 Hook 事件** — PostCompact（压缩后恢复状态）、PostToolUseFailure（工具失败学习）、Notification（通知处理）、SubagentStart（Agent 启动追踪），Hook 事件从 8 个扩展至 12 个
- **4 个新 Hook 脚本** — `post-compact.js`、`post-tool-failure.js`、`notification-handler.js`、`subagent-start.js`
- **Hook Profile 系统** — 3 档控制（minimal/standard/full），通过 `CC_BEST_HOOK_PROFILE` 环境变量切换，utils.js 新增 `shouldRunInProfile()` 函数
- **证据要求完成机制** — QA 命令新增 4 个强制验证问题 + 幻觉红旗检测模式
- **Stall 检测** — iterate 命令新增 3 种卡住模式检测（重复失败/进度停滞/工具失败），stop-check.js 新增 `detectStallPatterns()` 和 `detectHallucinationRedFlags()`
- **PDCA 学习闭环** — iterate 命令嵌入 Plan→Do→Check→Act 循环概念
- **Rust 语言规则** — 4 个规则文件（style/testing/security/performance），覆盖 `**/*.rs`
- **Go 语言规则** — 4 个规则文件（style/testing/security/performance），覆盖 `**/*.go`
- **组件按需安装清单** — `manifests/install-components.json`，15 个组件家族 + 3 个预设（minimal/standard/full）
- **Plugin settings.json** — `.claude-plugin/settings.json` Agent 默认配置（background、isolation）

#### Changed / 变更

- **Agent frontmatter 增强** — code-reviewer/security-reviewer 添加 `background: true`，architect 添加 `isolation: worktree`，5 个 agent 添加 `memory: project`
- **Lead 命令** — 新增 Step 7 置信度检查点（`/cc-best:confidence-check --pre`）
- **Dev 命令** — 新增 Step 2.5 置信度检查点（复杂任务）
- **iterate 命令** — 新增 Stall 检测章节 + PDCA 学习闭环章节 + 停止条件 #7（Stall 触发）
- **QA 命令** — 新增"证据要求完成"章节（4 个强制问题 + 幻觉红旗）
- **stop-check.js** — 新增幻觉红旗检测 + Stall 模式检测
- **plugin.json** — 版本 0.8.2 → 0.9.0，描述更新（23 hook scripts, hook profiles）
- **ARCHITECTURE.md** — 版本更新，组件计数同步，官方特性兼容性更新至 v2.1.76

#### Stats / 统计

- Hook scripts: 19 → 23 (+4 新脚本)
- Hook events: 8 → 12 (+4 新事件)
- Hook configured: 18 → 22 (+4)
- Rules: 35 → 43 (+8 新规则文件, +2 目录 rust/go)
- Rules dirs: 8 → 10
- 新增文件: 13 个（4 hooks + 8 rules + 1 manifest）
- 修改文件: ~25 个

---

### [0.8.2] - 2026-03-05

#### Theme / 主题: Session Intelligence（会话智能）

#### Added / 新增

- **F10: Session 摘要持久化** - SessionEnd 自动写入 `memory-bank/sessions/YYYY-MM-DD-HHmm.md`，SessionStart 自动恢复最近 session 上下文
- **F4: Instinct 自动化追踪** - pattern_id 生成 + 会话内 occurrence 统计 + 动态置信度（0.3→0.5→0.7→0.9）+ 全局聚合 + 高置信度候选标记
- **F11: De-Sloppify 自动清理** - iterate 管线 QA 通过后、Commit 前，full 模式 + 3+ 文件修改时自动触发 code-simplifier Agent
- **F12: 红旗 #4 自动化检测** - 同文件 Edit 3+ 次 + Bash 错误 2+ 次时自动输出 `[RedFlag]` 警告
- **F6a: 压缩抑制** - 检测到 fix_retry 模式时抑制 compact 建议，避免中断调试循环
- **F6b: Token 预算文档** - compact SKILL.md 新增 Token Budget Strategy 章节 + memory.md 渐进加载最佳实践
- **`skills/learning/instinct-tracker.md`** - 动态置信度规则 + 演化路径参考文档
- **3 个新测试文件** - observe-patterns.test.js、evaluate-session.test.js、session-check.test.js

#### Changed / 变更

- **evaluate-session.js** - 从 158 行重构为 ~280 行（transcript 解析 + session 文件写入 + 过期清理 + pattern 聚合）
- **observe-patterns.js** - 新增 pattern_id 生成 + 动态置信度 + 红旗检测独立步骤（+100 行）
- **session-check.js** - 新增上次 session 摘要恢复（+35 行）
- **suggest-compact.js** - 新增 fix_retry 检测抑制逻辑（+35 行）
- **hooks.json** - evaluate-session.js timeout 10→30 秒
- **iterate.md** - Step 1 决策表新增 Simplify 阶段
- **code-simplifier.md** - 新增 iterate 管线集成说明
- **learn.md** - Step 0 增加 pattern_id 聚合统计
- **self-check.md** - 增加红旗自动化检测说明 + iterate 推荐频率

#### Fixed / 修复

- **plugin.json description** - rules 计数 33→35（v0.8.1 漏更新）
- **CHANGELOG.md roadmap** - v0.8.x 路线图更新为实际发布内容
- **CI 共享 YAML 解析器** - 提取 `scripts/ci/lib/parse-frontmatter.js`，消除 3 个 CI 脚本中的重复解析器（H3）
- **CI MIN_EXPECTED 守卫** - validate-agents.js 新增最低数量检查，防止静默丢失 agent 文件（H2）
- **check-console-log.js** - 新增 `/* */` 块注释状态机跟踪，避免注释内容误报（M1）
- **utils.js CRLF 兼容** - `getGitModifiedFiles()` 使用 `/\r?\n/` 分割，修复 Windows 环境下路径解析（M2）
- **embedded rules glob 扩展** - 4 个嵌入式规则文件新增通用 `**/*.c`/`**/*.h` 匹配（M4）
- **llms.txt 计数同步** - L83 处 "33 coding rules" → "35 coding rules"（v0.8.1 遗漏）

#### Stats / 统计

- Hook scripts: 功能增强 4 个（无新增脚本，计数不变 19）
- 新增测试: 3 个文件（~60 个测试用例）
- 组件计数不变: 44 commands, 19 skills, 8 agents, 35 rules

---

### [0.8.1] - 2026-02-26

#### Changed / 变更

- **Token 加载优化（-30% always-loaded）**: 始终加载 token 从 ~14,000 降至 ~9,800/轮
- **testing.md 拆分**: `rules/common/testing.md` 从 488 行裁剪至 31 行，5 种语言测试内容迁入各 `{lang}-testing.md`（按文件类型自动加载）
- **methodology.md 精简**: Playwright 工具章节提取为 `rules/frontend/frontend-tools.md`（按前端文件类型自动加载）
- **CLAUDE.md 精简**: 原则描述从 16 行详述压缩为 4 行 ID 速查 + methodology.md 引用
- **frontend SKILL.md 精简**: 设计美学 + 测试模式替换为子文件引用（-117 行）
- **devops SKILL.md 精简**: 部署策略 ASCII 图 + IaC 示例替换为简表 + 引用（-124 行）

#### Added / 新增

- **`rules/frontend/frontend-e2e.md`**: Playwright E2E 测试规范（窄路径：仅 `e2e/**`、`*.spec.ts` 触发）
- **`rules/frontend/frontend-tools.md`**: 前端验证工具规范（Playwright 浏览器工具、截图管理、登录状态处理）

#### Stats / 统计

- Rules: 33 → 35 (+frontend-e2e, +frontend-tools)
- 始终加载: ~47 KB → ~33 KB（-30%）
- 始终加载: ~14,000 → ~9,800 tokens/turn（-4,200 tokens）

---

### [0.8.0] - 2026-02-26

#### Added / 新增

- **Model Skill（模型选择技能）**: 新增 `skills/model/` 目录，包含 SKILL.md 和 routing-matrix.md，利用 Claude Code skill 自动调用机制实现任务级模型智能路由
- **Mode Context 模板**: 新增 4 个模式上下文模板（`skills/session/context-{dev,research,review,planning}.md`），为每个工作模式注入行为指令和工具偏好

#### Changed / 变更

- **commands/model.md**: 新增 Model Skill 引用章节，说明全局策略与 skill 细粒度建议的关系
- **commands/mode.md**: 新增 Context 模板章节，切换模式时自动加载对应上下文

#### Fixed / 修复

- **跨组件调用补全**: 4 个 Agent frontmatter 补充缺失 skills（code-reviewer +frontend/backend、tdd-guide +debug、code-simplifier/requirement-validator +exploration）
- **命令流程补全**: 6 个命令补充下游角色/Agent 调用路径（lead、hotfix、pr、test、analyze、dev）
- **断裂引用修复**: exploration/SKILL.md `/cc-best:debug` → `/cc-best:fix`（debug 是 skill 不是 command）
- **ARCHITECTURE.md 目录计数**: "9 目录" → "8 目录"（1 common + 7 语言）
- **fix.md 闭合总结位置**: 从 Agent 节前移至文件末尾（符合规范）

#### Improved / 改进

- **CI 孤儿脚本检测**: validate-hooks.js 新增 `detectOrphanScripts()` 函数，检测未注册的 hook 脚本
- **CI 安全扫描前置**: validate.yml 将 Security Scan 加入主 validate job 关键路径
- **CI 计数断言**: validate-commands.js/validate-skills.js 新增最低数量检查（防止误删导致组件丢失）

#### Stats / 统计

- Skills: 18 → 19 (+model)
- 新增文件: 6 个（2 skill + 4 context 模板）
- 修改文件: ~50 个（命令/Agent/技能/CI/文档/版本同步）

---

### [0.7.5] - 2026-02-24

#### Fixed / 修复

- **Hook --help 全覆盖**: 18/19 hook 脚本支持 `--help` 早退（24% → 95%，排除 init.js 工具脚本）
- **孤儿脚本清理**: 删除冗余的 session-start.js 和 session-end.js（与 session-check.js/evaluate-session.js 功能重叠）
- **block-random-md.js 注册**: 将未注册的 hook 脚本加入 hooks.json PreToolUse 事件
- **闭合总结全覆盖**: 44/44 命令 + 18/18 技能全部添加 `> **记住**` 闭合总结（25%/50% → 100%）
- **observe-patterns.js 竞争条件**: 历史记录存储从 JSON read-modify-write 改为 JSONL append（原子写入）
- **embedded rule 命名规范**: esp32-c-style.md → embedded-style.md，统一 `-style.md` 命名模式
- **advanced.md 分类修复**: Safety 类别补充 block-random-md.js，Tracking 去除 session-check.js 重复
- **文档计数同步**: hook 脚本 21→19，已配置 17→18，覆盖 ~15 文件 ~20 处

---

### [0.7.4] - 2026-02-24

#### Added / 新增

- **综合审计**: 6 维度自动化审计（frontmatter 100%、CI 100%、引用 100%、版本 100%）

#### Fixed / 修复

- **docs/index.html 比较区域**: Commands 42→44、Skills 17→18 计数同步

---

### [0.7.3] - 2026-02-24

#### Added / 新增

- **check-secrets.js 增强**: 支持 30+ 云服务商密钥模式检测，新增 Anthropic/OpenAI/AWS/GCP 等格式

---

### [0.7.2] - 2026-02-24

#### Added / 新增

- **hooks.json 插件级 hooks**: 迁移 hooks 配置从 settings.local.json 到 hooks/hooks.json，支持插件自带 hooks

---

### [0.7.1] - 2026-02-24

#### Fixed / 修复

- **Agent skill 全限定名**: 8 个 agent 共 26 处 skill 引用从裸名改为 `cc-best:xxx` 全限定名格式，修复 v2.1.47+ 下 skill 静默加载失败

---

### [0.7.0] - 2026-02-13

#### Added / 新增

- **Lite 模式**: iterate 支持 full/lite 两种管线模式，lite 跳过 PM/Lead/Designer/QA 直接 Dev→Verify→Commit
- **模型策略切换**: `/cc-best:model` 命令，交互式选择 quality/balanced/economy 三档策略，修改 agent frontmatter
- **Hotfix 快速通道**: `/cc-best:hotfix` 命令，紧急修复直接 Dev→Verify→Commit
- **Mermaid 流程图**: ARCHITECTURE.md 新增管线角色决策树和异常回退路径可视化

#### Fixed / 修复

- **计数一致性**: 修复 7 处历史遗留计数 bug（.claude-plugin/README.md 35→42, README/index.html 38→42 等）

---

### [0.6.5] - 2026-02-13

#### Added / 新增

- **管线容错机制**: QA↔Dev 熔断保护（fix_count ≤ 3 次上限）+ 各角色异常回退路径
- **Bugfix 模式**: `/cc-best:dev --bugfix` 正式 bugfix 工作流，区分正常开发和 bug 修复
- **iterate 自动压缩**: 上下文压力时自动保存状态 + 生成摘要，用户操作缩减为 1 步
- **Roadmap 更新**: v0.7.0（Lite 模式 + 三档模型策略）/ v0.8.0（示例项目 + 社区扩展）

#### Changed / 变更

- **qa.md**: 问题分类新增"高影响假设回退 PM"，Bug 输出含修复轮次和熔断模板
- **iterate.md**: 角色选择表新增 bugfix/熔断/假设回退行，上下文管理改为自动压缩
- **lead.md**: 新增异常回退表（需求模糊/可行性低/熔断升级/技术栈不支持）
- **verify.md/commit.md**: 新增失败后操作和提交后下一步指引
- **suggest-compact.js**: Hook 提醒改为 iterate 模式友好格式

### [0.6.4] - 2026-02-12

#### Added / 新增

- **Giscus 社区评论**: 首页集成 GitHub Discussions 评论系统
- **Pipeline Statusline**: Node.js 跨平台状态栏脚本，显示管线阶段（PM→Lead→Dev→QA）和活跃任务
- **Config Security Audit**: `scripts/ci/security-audit.js` 配置安全扫描（密钥泄露、权限过宽等 5 维度检测）
- **Confidence Check Hook**: `scripts/node/hooks/confidence-check.js` 置信度检查，拦截低置信度操作

#### Fixed / 修复

- **session-end.js**: 修复 `runCommand` 调用签名错误（数组参数导致 git 无参数执行，永远误报未提交变更）
- **文档计数同步**: 修复 ARCHITECTURE.md、README.zh-CN.md、quickstart.zh-CN.md、status.md、llms.txt 中命令/Hook 数量不一致（38→40 命令、18/24→21 Hook）
- **rules 路径规范**: analyze.md、learn.md 中建议路径改为 `rules/common/` 子目录，符合现有目录结构
- **convert-to-local.js**: 扩展处理范围覆盖 `docs/` 和 `rules/` 目录（148 处额外引用）
- **settings.example 同步**: 新增 Hook 配置同步到 `.claude/settings.local.json.example`
- **首页性能**: 修复 Hero 动画过度 DOM 操作导致页面冻结

### [0.6.3] - 2026-02-10

#### Added / 新增

- **Quick Start Guide（双语）**: 新建 `docs/guides/quickstart.md` + `quickstart.zh-CN.md`，5 分钟上手三大核心特色
- **Advanced Guide（双语）**: 新建 `docs/guides/advanced.md` + `advanced.zh-CN.md`，10 章深度方法论解析（道法术器、A1-A5、iterate/pair 精通、知识进化管线、Hook 系统、Agent 策略）
- **llms.txt**: 新建 LLM 可读项目摘要，遵循 llms-txt.org 标准

#### Changed / 变更

- **README 核心特色强化（双语）**: 新增 "What Makes CC-Best Different" 章节（角色驱动管线、自主迭代引擎、知识自进化管线）、iterate 角色选择表 + pair 确认节点折叠块、架构图修正（Agents 6→8、新增 Safety Hooks 层）
- **CI 防护增强**: `validate-agents.js` 新增 plugin.json agents 字段格式验证（数组检查、.md 后缀、文件存在、数量一致）；`validate-plugin.yml` 新增 agents/hooks 交叉验证
- **CONTRIBUTING.md 增强（双语）**: 新增本地测试指南、新增语言规则 4 步模板、新增命令/技能/智能体添加规范、Hook 脚本编写约定

#### Fixed / 修复

- **plugin.json**: 移除导致插件无法加载的 `hooks` 字段（v0.6.2 hotfix 已单独提交）
- **README 架构图**: Agents 数量 6→8 修正，补全 Safety Hooks 展示层
- **README 统计数据**: 补齐 `33 rules` · `18 hooks` · `8 lifecycle events`

### [0.6.2] - 2026-02-09

#### Added / 新增

- **Python Rules 补齐**: 新增 3 个 Python 规则文件（30 → 33 rules）
  - `python-testing.md` — pytest, fixtures, parametrize, coverage
  - `python-security.md` — SQL 注入, 输入验证, 密钥管理, 依赖安全
  - `python-performance.md` — asyncio, GIL, profiling, 缓存策略
- **Skill 子文件新增**: 6 个命令知识提取为独立 Skill 子文件
  - `skills/architecture/lead-methodology.md` — 技术方案设计方法论
  - `skills/architecture/pm-methodology.md` — 需求分析方法论
  - `skills/frontend/design-guide.md` — UI/UX 设计原则
  - `skills/testing/qa-methodology.md` — 测试策略和检查清单
  - `skills/security/verify-checklist.md` — 安全验证维度
  - `skills/learning/extraction-guide.md` — 模式提取流程
- **Git Skill 拆分**: SKILL.md 拆分为 3 个子文件（584 → <480 行）
  - `skills/git/pr-workflow.md` — PR 创建和模板
  - `skills/git/hooks-guide.md` — pre-commit/commit-msg 钩子
  - `skills/git/delegation.md` — Agent 委派指南
- **Hook 注册补全**: 3 个孤儿脚本注册到 hooks.json（14 → 17 已配置）
  - `long-running-warning.js` → PreToolUse (Bash) 长时间命令警告
  - `check-console-log.js` → PostToolUse (Write|Edit) 调试日志检查
  - `typescript-check.js` → PostToolUse (Write|Edit) TypeScript 类型检查

#### Changed / 变更

- **Rules frontmatter 规范化**: 移除所有非官方字段（`alwaysApply`、`description`），common/ 规则改为无条件加载
- **Agent 模型统一**: build-error-resolver haiku → sonnet，requirement-validator opus → sonnet
- **Agent 工具补全**: architect 添加 Bash，code-simplifier 添加 Bash，build-error-resolver 添加 Write
- **Agent maxTurns**: 全部 8 个 Agent 添加 maxTurns 限制（10-25）
- **超大命令重构**: 6 个命令知识内容提取到 Skill 子文件（lead 656→~150, learn 597→~120, qa 533→~150, verify 401→~120, designer 399→~120, pm 360→~120）
- **命令重命名**: `git.md` → `git-guide.md`、`compact.md` → `compact-context.md`（避免与同名 Skill 冲突）
- **plugin.json 优化**: agents 改为目录引用 `["./agents/"]`，添加 `hooks` 显式声明
- **Rules 路径补齐**: csharp 添加 `*.csx`，frontend 添加 `*.css`/`*.html`
- **code-reviewer Agent**: 重写 prompt 移除 Bash 命令引用，保持只读安全
- **Agent 格式规范化（审计修复）**: 全部 8 个 Agent 添加 `<example>` 自动触发块、tools 改为 YAML 数组格式、修复非标准颜色（orange→yellow, pink→magenta, purple→magenta）
- **Commands argument-hint 补齐（审计修复）**: 8 个接受参数的命令添加 `argument-hint`（checkpoint、context、evolve、memory、pair、service、setup、setup-pm）
- **Commands 交叉引用（审计修复）**: 7 个功能重叠命令添加互相引用说明（context↔memory、commit↔git-guide、run↔service、build↔fix）
- **Frontend Rules 路径扩展（审计修复）**: 4 个前端规则文件新增 `*.scss`/`*.less`/`*.svelte` 路径匹配
- **Hooks 错误处理（审计修复）**: suggest-compact.js、user-prompt-submit.js 添加顶层 try/catch 静默失败
- **Skills README 完整同步（审计修复）**: 更新目录树（补齐 15+ 缺失子文件）、修正技能概览表文件计数

#### Fixed / 修复

- **pause-before-push.js**: `--force`/`-f` 推送现在被阻止（exit 2），与 CLAUDE.md 禁止操作一致
- **session-check.js**: 修复双重转义 `\\n` → `\n` 导致的输出格式错误
- **check-secrets.js**: 修复注释中退出码 `process.exit(1)` → `process.exit(2)`
- **evaluate-session.js**: 移除本地重复函数定义，改为从 utils.js 导入
- **typescript-check.js**: 添加 Windows `npx.cmd` 兼容处理
- **hooks.json**: 为 6 个非工具事件补齐 `matcher: ".*"` 字段
- **git-workflow rule**: 移除无效 `paths: ["**/.git/**"]`（永不触发）
- **commands/setup-pm.md**: 移除无效字段 `disable-model-invocation`
- **commands/catchup.md**: `/init` → `/cc-best:setup`
- **commands/iterate.md**: `/ralph-loop` → `/cc-best:cc-ralph`
- **commands/train.md**: `data/cc-best:train` → `data/train`
- **skills/exploration/SKILL.md**: `/debug` → `/cc-best:debug`
- **skills/README**: `parent-skill:` → `parent:`
- **commands/dev.md（审计修复）**: 工作流交接 `/cc-best:qa` → `/cc-best:verify`，与 CLAUDE.md 流程定义一致
- **rules/common/testing.md（审计修复）**: 移除 common/ 规则中无效的 `paths` 字段（common 规则应无条件加载）
- **commands/setup.md（审计修复）**: 版本号 `0.5.8` → `0.6.2`（4 处）
- **SKILL.md 子文件引用（审计修复）**: 4 个技能主文件补齐对孤儿子文件的引用（architecture→lead/pm-methodology、frontend→design-guide、testing→qa-methodology、learning→extraction-guide）
- **Legacy 脚本清理（审计修复）**: 删除 2 个已被 Node.js Hook 替代的 bash 脚本（`compact/suggest-compact.sh`、`learning/evaluate-session.sh`）
- **learning/SKILL.md（审计修复）**: bash 脚本引用改为 Node.js Hook 引用（evaluate-session.js）

### [0.6.1] - 2026-02-09

#### Changed / 变更

- **Rules Token 优化**: 精简 3 个 alwaysApply 规则内容（performance 111→33 行、output-style 152→43 行、git-workflow 101→42 行），总计减少约 1700 Token/会话
- **角色交接增强**: Lead/Dev/QA 新增 Step 0 上下文恢复步骤，支持跨会话无缝交接
- **PM 进度输出**: 完成时自动将 REQ 文档路径写入 progress.md "进行中"列表
- **观察管线扩展**: observe-patterns.js 新增 `fix_retry` 检测器（同文件 Edit 3+ 次），共 5 个检测器
- **COMMANDS.md 补全**: 修正命令数量 35→38，补录 fix-issue、release、service 三个命令

#### Fixed / 修复

- **Stop hook 输出格式**: 修复 stop-check.js 和 subagent-stop.js 输出无效 `decision` 值（`"stop"`/`"continue"`），改为标准的 exit(0) 放行
- **GitHub 仓库元数据**: 更新描述（38 commands + 8 agents + 30 rules）、优化 topics、设置 homepage
- **.gitignore**: 添加 `memory-bank/observations.jsonl` 排除运行时数据

### [0.6.0] - 2026-02-08

#### Fixed / 修复

- **Rules frontmatter bug**: 修复 16 个语言专属 rules 误用 `alwaysApply: true`，现在仅对匹配的语言文件生效
- **code-style.md 错位**: 从 `rules/common/` 移至 `rules/python/python-style.md`
- **frontend-style.md 引用**: 修正错误的 Python 文件引用

#### Added / 新增

- **学习管线闭环**: 新增 `observe-patterns.js` PostToolUse hook，自动捕获 error_fix、repeated_search、multi_file_edit、test_after_edit 四种模式
- **CI 自动发布**: 新增 `auto-release.yml`，tag push 触发自动创建 GitHub Release
- **脚本黑盒化**: 5 个高频 hook 脚本支持 `--help`，减少 agent 读源码浪费 context
- **Python rules 目录**: 新增 `rules/python/` 目录

#### Changed / 变更

- **Agent 能力增强**: code-reviewer、security-reviewer、build-error-resolver 添加 `exploration` 技能
- **code-reviewer 学习能力**: 添加 `learning` 技能，审查中发现的模式可记录
- **build-error-resolver 模型优化**: sonnet → haiku，适配"最小修复"快速模式
- **/learn 命令增强**: 新增 Step 0 自动读取 observations.jsonl 作为分析输入
- **learning skill 更新**: 自动观察 Hook 从代码草图升级为实际脚本引用

### [0.5.9] - 2026-02-06

#### Added / 新增

- **3 个新 Commands** - 扩展命令体系（35 → 38）
  - `fix-issue` - GitHub Issue 端到端修复闭环（分析→修复→测试→提交→关闭）
  - `release` - 版本发布管理（版本号同步、CHANGELOG 更新、Git Tag）
  - `service` - 开发服务管理（自动检测 6 种运行时，支持 --stop/--restart/--logs）
- **16 个新 Rules 文件** - 语言专属 testing/security/performance 规范
  - frontend: 前端测试、安全、性能规范
  - java: JUnit 5/Mockito、Spring Security、JVM 调优
  - csharp: xUnit/NUnit、ASP.NET Identity、async/await 模式
  - cpp: Google Test/Catch2、缓冲区安全、SIMD/缓存优化
  - embedded: HIL 测试、Secure Boot/OTA、RTOS 调度
  - ui: WCAG 2.1 无障碍规范
- **Agent Skills 增强** - 4 个 Agent 新增技能预加载
  - architect + `database`（架构设计时加载数据库约束）
  - code-reviewer + `testing`（代码审查评估可测试性）
  - security-reviewer + `quality`（安全与代码质量交叉）
  - build-error-resolver + `testing`（修复后测试验证）
- **`/setup --interactive` 交互模式** - 分步引导选择安装级别、Rules 集、Skills 集
- **Skill → Agent 交叉引用** - database/testing/security/quality SKILL.md 添加关联 Agent 注释
- **3 个新 Hook 事件** - 扩展生命周期覆盖（5/10 → 8/10 事件）
  - `UserPromptSubmit` - 用户提交时注入项目上下文（memory-bank 状态、当前阶段）
  - `SubagentStop` - 子代理完成时记录任务状态
  - `Stop` - 响应完成时检查 progress.md 中遗漏任务
- **Python 进阶技能** - 新增 3 个 Python 子文件
  - `python-patterns.md` - 设计模式（KISS、组合、策略模式）
  - `python-types.md` - 高级类型提示（Protocol、泛型、TypeGuard）
  - `python-observability.md` - 可观测性（日志、指标、追踪）
- **代码健康评估技能** - 新增 `skills/quality/code-health.md`
  - 技术债务量化公式
  - 热点文件检测命令
  - CRITICAL/HIGH/MEDIUM/LOW 优先级分级

#### Changed / 变更

- **Rules 目录分层重构** - 从扁平结构重组为 7 个子目录
  - `common/` (8) + `frontend/` (4) + `java/` (4) + `csharp/` (4) + `cpp/` (4) + `embedded/` (4) + `ui/` (2) = 30 文件
  - 每个语言目录文件引用 common/ 中的通用规范
- **组件交叉引用增强** - Command↔Agent↔Skill 协同关系梳理
- **ARCHITECTURE.md 兼容性更新** - 同步最新官方特性评估
  - `context: fork` 从"未采用"升级为"已采用"（exploration Skill 已使用）
  - Agent skills 预加载数量 6 → 8（全部 agents 已配置）
  - Language Support 5 → 6（+ Rust）
  - Hooks 统计 17 脚本/10 配置 → 20 脚本/13 配置
- **session-start Hook 增强** - 添加 Memory Bank 状态检测
  - 显示可用的 memory-bank 文件
  - 提示使用 `/cc-best:catchup` 恢复上下文
- **quality 技能扩展** - 新增 code-health 子技能

---

### [0.5.8] - 2026-02-02

#### Added / 新增

- **压缩提醒钩子** - 新增 `suggest-compact.js`
  - 工具调用达到阈值（默认 40 次）时提醒用户压缩
  - 支持环境变量配置：`COMPACT_THRESHOLD`、`COMPACT_INTERVAL`

#### Changed / 变更

- **hooks.json 增强** - 所有钩子添加 `description` 字段
- **iterate 模式优化** - 上下文阈值从 80% 降到 70%
- **compact skill 更新** - 添加官方 bug 说明

#### Fixed / 修复

- **Issue #1** - "不会自动压缩上下文" 问题
- **命令引用规范化** - 全仓库命令引用格式统一为 `/cc-best:xxx`

---

### [0.5.7] - 2026-01-29

#### Changed / 变更

- **文档一致性审计** - 全仓库文档格式和内容审计
  - 统一 Skills 子文件标题格式
  - 统一 Hooks 脚本文件头部注释格式

#### Fixed / 修复

- **交叉引用一致性** - agents README 配对表添加完整 8 个 agents

---

### [0.5.6] - 2026-01-29

#### Added / 新增

- **Rust/Tauri 开发支持**
  - `skills/native/tauri.md` - Tauri 桌面应用开发模式
  - `skills/backend/rust.md` - Rust 后端开发模式

#### Changed / 变更

- **工作模式文档** - 添加 `.claude-plugin/MODES.md`

---

### [0.5.5] - 2026-01-29

#### Added / 新增

- **Skills 输出标准** - 为所有 skills 添加 DO/DON'T 示例

#### Changed / 变更

- **README 优化** - 全面审计并优化文档

#### Fixed / 修复

- **插件加载失败** - 修复 plugin.json 格式导致的加载错误

---

### [0.5.4] - 2026-01-27

#### Added / 新增

- **架构文档** - `.claude-plugin/ARCHITECTURE.md`
- **`/status --full`** - 增强状态检查命令
- **`/mode` 命令** - 工作模式切换（dev/research/review/planning）
- **SessionEnd 自动学习钩子** - `evaluate-session.js`
- **命令参考文档** - `.claude-plugin/COMMANDS.md`

#### Changed / 变更

- **README FAQ 精简** - 从 ~230 行精简到 ~35 行

---

### [0.5.3] - 2026-01-27

#### Added / 新增

- **code-reviewer 多语言专项审查** - 支持 8 种语言/框架
- **PreCompact Hook 增强** - 上下文压缩前保存完整状态
- **Go 惯用模式** - 完整的 Go 惯用法章节

#### Fixed / 修复

- **Hooks 配置修复** - 修复 Windows 下 hooks 路径问题
- **README 文档更新** - 技能数量从 16 更新为 17

---

### [0.5.2] - 2026-01-26

#### Added / 新增

- **Skills 父子结构重组** - 新增 4 个父技能：`testing`、`quality`、`session`、`native`
- **Session ID 工具函数** - 会话管理功能
- **`/designer` 命令** - UI 设计师角色命令 (342 行)
- **architecture 技能** - ADR、系统设计检查清单 (188 行)

#### Changed / 变更

- **Skills 目录重命名** - 统一命名风格（如 `backend-patterns` → `backend`）
- **testing Skill 拆分优化** - 从 813 行精简至 206 行

#### Fixed / 修复

- **CLAUDE.md 重写为插件说明** - 从项目模板转换为插件说明文档
- **Agent/Skill 引用修复**

---

### [0.5.1] - 2025-01-26

#### Added / 新增

- **数据库专属最佳实践** - PostgreSQL, MySQL, Oracle, SQLite
- **云基础设施安全指南** - `cloud-security.md`
- **E2E 测试指南**

#### Fixed / 修复

- **`/cc-ralph` 集成归档功能**

---

### [0.5.0] - 2025-01-25

#### Added / 新增

- **Hooks 配置验证脚本** - `scripts/node/verify-hooks.js`
- **`/setup --verify` 参数** - 诊断模式
- **GitHub Actions CI 增强** - `validate-plugin.yml`

---

## Historical Releases / 历史版本

> 以下版本为简要摘要，完整内容参见 [Git History](https://github.com/xiaobei930/cc-best/commits/main)

### [0.4.x] - 2025-01-24 ~ 2025-01-25

- **0.4.5**: `progress.md` 自动归档机制
- **0.4.4**: 修复 Plugin Hooks 双重加载问题
- **0.4.3**: 修复 `${CLAUDE_PLUGIN_ROOT}` 路径展开问题
- **0.4.2**: `/cc-ralph` 命令 - Ralph Loop 集成
- **0.4.1**: Agent handoffs 兼容性修复
- **0.4.0**: 命令注入安全修复 + Hook 生命周期更新（`Stop` → `SessionEnd`）

### [0.3.0] - 2025-01-24

- Hook 路径修复
- Agent 模型信息更新
- 占位符文档

### [0.2.0] - 2025-01-24

- Demo GIFs
- Plugin-first 架构重构
- 插件名称简化为 `cc-best`

### [0.1.0] - 2025-01-22

**首个公开版本** - 核心框架

- `CLAUDE.md` 项目宪法
- 30+ 命令（角色/模式/工具/上下文/学习）
- 13 个规则文件
- 14 个技能类别
- 6 个智能体
- 16 个 Node.js hooks
- 双语文档

---

## Version Format / 版本格式

- **Major (X.0.0)**: 破坏性变更，重大重构
- **Minor (0.X.0)**: 新功能、命令、技能
- **Patch (0.0.X)**: Bug 修复、文档更新

---

[0.9.0]: https://github.com/xiaobei930/cc-best/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/xiaobei930/cc-best/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/xiaobei930/cc-best/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/xiaobei930/cc-best/compare/v0.7.5...v0.8.0
[0.7.5]: https://github.com/xiaobei930/cc-best/compare/v0.7.4...v0.7.5
[0.7.4]: https://github.com/xiaobei930/cc-best/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/xiaobei930/cc-best/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/xiaobei930/cc-best/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/xiaobei930/cc-best/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/xiaobei930/cc-best/compare/v0.6.5...v0.7.0
[0.6.5]: https://github.com/xiaobei930/cc-best/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/xiaobei930/cc-best/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/xiaobei930/cc-best/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/xiaobei930/cc-best/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/xiaobei930/cc-best/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/xiaobei930/cc-best/compare/v0.5.9...v0.6.0
[0.5.9]: https://github.com/xiaobei930/cc-best/compare/v0.5.8...v0.5.9
[0.5.8]: https://github.com/xiaobei930/cc-best/compare/v0.5.7...v0.5.8
[0.5.7]: https://github.com/xiaobei930/cc-best/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/xiaobei930/cc-best/compare/v0.5.5...v0.5.6
[0.5.5]: https://github.com/xiaobei930/cc-best/compare/v0.5.4...v0.5.5
[0.5.4]: https://github.com/xiaobei930/cc-best/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/xiaobei930/cc-best/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/xiaobei930/cc-best/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/xiaobei930/cc-best/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/xiaobei930/cc-best/compare/v0.4.5...v0.5.0
[0.4.5]: https://github.com/xiaobei930/cc-best/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/xiaobei930/cc-best/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/xiaobei930/cc-best/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/xiaobei930/cc-best/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/xiaobei930/cc-best/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/xiaobei930/cc-best/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/xiaobei930/cc-best/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/xiaobei930/cc-best/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/xiaobei930/cc-best/releases/tag/v0.1.0
