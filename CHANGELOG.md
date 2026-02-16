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
- [ ] ~~核心命令英文版~~ → 等待官方 i18n 支持 (#7233)

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

### v0.7.0 ✅ (Released 2026-02-13) - Lite 模式 + 模型策略

**核心目标**: 降低上手门槛 + Token 成本控制

- [x] **Lite 模式** - iterate 管线行为精简（跳过 PM/Lead/Designer/QA，直接 Dev→Verify→Commit）
- [x] **三档模型策略** - Quality（全 Opus）/ Balanced（设计 Opus + 执行 Sonnet）/ Economy（核心 Sonnet + 其余 Haiku），交互式切换
- [x] **Hotfix 快速通道** - 精简管线（Dev→Verify→Commit），跳过 PM/Lead 分析
- [x] **Mermaid 流程图** - 管线角色决策树、异常回退路径可视化
- [ ] 常见错误诊断与修复建议

### v0.8.0 (Planned) - 示例项目与生态扩展

**核心目标**: 端到端验证 + 社区生态

- [ ] **Example Project** - 完整工作流演示（PM→Commit 端到端）
- [ ] **社区扩展机制** - 自定义 Skill/Rule/Agent 注册点
- [ ] multi-model skill（多模型协作协议）
- [ ] 扩展 second-opinion（支持更多模型）
- [ ] Token 用量追踪与报告

### v1.0.0 (Future) - 稳定版

**核心目标**: 生产级可靠

- [ ] 稳定的扩展 API
- [ ] Memory-bank 云同步（可选）
- [ ] 团队协作支持
- [ ] 完整 i18n（等待官方支持）

---

## Recent Changes / 近期变更

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
- **竞品对比表** - "CC-Best vs Superpowers"
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
