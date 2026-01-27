# Changelog / 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.3] - 2026-01-27

### Added / 新增

- **code-reviewer 多语言专项审查** - 增强代码审查能力，支持 8 种语言/框架专项检查
  - Go：goroutine 泄漏、race 条件、error 处理、惯用法
  - Python：类型安全、async 正确性、pickle 安全
  - Java：空指针安全、资源管理、并发安全
  - TypeScript：类型收窄、Promise 处理、any 滥用
  - C#：async/await 模式、IDisposable、LINQ 性能
  - React：Hooks 规则、性能优化、状态管理
  - Vue：响应式陷阱、组件设计
  - Angular：变更检测、RxJS 订阅管理
- **PreCompact Hook 增强** - 上下文压缩前保存完整状态
  - 保存 git 状态（分支、未提交更改数）
  - 提取未完成任务列表（从 progress.md）
  - 记录最近修改的文件
  - 输出压缩前摘要信息
- **Go 惯用模式** - 在 `skills/backend/go.md` 新增完整的 Go 惯用法章节
  - 核心原则：简洁优于技巧、零值可用、接受接口返回结构体
  - 错误处理：包装、errors.Is/As、不忽略错误
  - 并发模式：Worker Pool、errgroup、goroutine 泄漏防护、Mutex 正确用法
  - 性能优化：slice 预分配、strings.Builder、sync.Pool
  - 反模式：裸返回、panic 流程控制、context 在结构体、循环 defer

### Fixed / 修复

- **Hooks 配置修复** - 修复 Windows 下 hooks 路径问题
  - 启用插件内置 `hooks/hooks.json` 配置，使用 `${CLAUDE_PLUGIN_ROOT}` 环境变量
  - 为所有路径添加转义引号，解决包含空格的路径问题
  - 更新 `commands/setup.md` 文档，添加跨平台路径说明
- **plugin.json 声明补全** - 添加缺失的 `agents` 和 `hooks` 路径声明
  - `"agents": "./agents"` - 启用代理目录
  - `"hooks": "./hooks/hooks.json"` - 启用 hooks 配置
- **README 文档更新** - 修复技能数量和列表不一致问题
  - 技能数量从 16 更新为 17
  - README.zh-CN.md 技能表补充缺失的 5 个技能
  - 添加 Swift 语言支持说明

---

## [0.5.2] - 2026-01-26

### Added / 新增

- **Skills 父子结构重组** - 全面重组技能系统，采用父子结构便于按需加载
  - 新增 4 个父技能：`testing`、`quality`、`session`、`native`
  - `testing` 父技能：统一 `tdd` 和 `e2e` 测试技能
  - `quality` 父技能：统一 `security` 和 `debug` 质量技能
  - `session` 父技能：统一 `learning` 和 `compact` 会话技能
  - `native` 父技能：统一原生开发技能（当前含 `ios`，未来含 `android`）
  - `exploration` 父技能：已有，统一 `isolated-research` 和 `iterative-retrieval`
- **Session ID 工具函数** - 在 `scripts/node/lib/utils.js` 新增会话管理功能
  - `getSessionId()` - 获取完整会话 ID
  - `getSessionIdShort()` - 获取会话 ID 后 8 位（用于文件命名）
  - `getSessionFileName()` - 生成带会话标识的文件名
- **iterative-retrieval 子技能** - 新增渐进式上下文检索技能
  - 四阶段方法：DISPATCH → EVALUATE → REFINE → LOOP
  - 置信度评分驱动迭代决策
  - 适用于复杂跨模块探索
- **异步钩子文档** - 在 `hooks/README.md` 添加异步 hook 使用指南
  - `async: true` 配置说明
  - 适用场景对比表
- **`/designer` 命令** - 新增 UI 设计师角色命令 (342 行)
  - 定义美学方向，避免 AI 通用审美（AI slop）
  - 完整的反模式清单（字体、颜色、布局、背景）
  - 设计审查清单和设计指导文档模板
  - 与官方 `/frontend-design` Skill 协作集成
- **architecture 技能** - 新增架构设计技能 (188 行)
  - ADR 架构决策记录模板
  - 系统设计检查清单（功能/非功能/技术/运维）
  - 可扩展性评估（MVP 到规模化）
  - 架构模式速查（后端/前端/数据访问）

### Changed / 变更

- **Skills 目录重命名** - 统一命名风格，简化技能名称
  - `backend-patterns` → `backend`
  - `frontend-patterns` → `frontend`
  - `database-patterns` → `database`
  - `devops-patterns` → `devops`
  - `api-development` → `api`
  - `git-workflow` → `git`
  - `security-review` → `security`
  - `debugging` → `debug`
  - `continuous-learning` → `learning`
  - `strategic-compact` → `compact`
  - `codebase-exploration` → `exploration`
- **Skills 子文件合并** - 将独立子技能合并为父技能的子文件（Claude Code 不支持嵌套技能目录）
  - `testing/` 合并 tdd 和 e2e：新增 `tdd.md`、`e2e.md`、`tdd-example.md`、`frameworks.md`
  - `exploration/` 合并研究技能：新增 `isolated-research.md`、`iterative-retrieval.md`
  - `native/` 合并 iOS 开发：新增 `ios.md`、`swift-concurrency.md`、`swiftui-performance.md`
  - 删除独立目录：`ios-development/`、`tdd-workflow/`、`e2e-testing/`、`isolated-research/`、`iterative-retrieval/`
- **learning 技能增强** - 添加本能系统（Instincts）
  - 本能生命周期：观察 → 记录 → 本能 → 演化
  - 置信度评分（0.3-0.9）
  - 自动观察 Hook 示例代码
- **commands/qa.md 精简** - 从 647 行减至 489 行，提取 E2E 测试内容到 testing 技能
- **commands/lead.md 精简** - 从 615 行减至 471 行，提取架构设计内容到 architecture 技能
- **testing Skill 拆分优化** - 从 813 行精简至 206 行，符合官方 ≤500 行建议
  - `SKILL.md` (206 行) - 核心原则、边界情况、反模式、检查清单
  - `tdd.md` - TDD 工作流（原 tdd-workflow）
  - `e2e.md` - E2E 测试指南（原 e2e-testing）
  - `tdd-example.md` (361 行) - 完整 TDD 会话示例（积分计算器）
  - `frameworks.md` (263 行) - 测试框架配置、Mock 模式、常用命令
- **iterate.md 流程优化** - 添加 /verify 步骤到角色选择表和执行流程
  - Step 1 新增 "有代码待验证 → /verify" 角色
  - Step 2 更新为完整流程：/dev → /verify → /qa → /commit
- **cc-ralph.md 流程更新** - 与 iterate.md 保持一致
  - 工作流更新为 PM→Lead→Designer→Dev→QA
  - 角色选择表添加 /verify 步骤
- **README /pair 说明扩展** - 添加使用示例 `/pair [task]` 和 `/pair --learn [topic]`
- **README.md skills 表格更新** - 添加 16 个完整 skills 列表
- **skills/README 更新** - 同步目录结构和技能表格

### Fixed / 修复

- **setup-pm.md 缺失 allowed-tools** - 添加 `allowed-tools: Read, Bash`
- **文档引用路径修复** - 更新旧技能名称引用
  - `agents/README` - `security-review` → `security`, `tdd-workflow` → `testing`
  - `commands/qa.md` - `skills/e2e/SKILL.md` → `skills/testing/e2e.md`
  - `commands/lead.md` - `architecture-design` → `architecture`
  - `.claude/learned/.gitkeep` - `continuous-learning` → `learning`
  - `hooks/README.md` - `strategic-compact` → `compact`, `continuous-learning` → `learning`
- **CLAUDE.md 重写为插件说明** - 从项目模板转换为插件说明文档
  - 移除占位符 `{{PROJECT_NAME}}`、`{{DATE}}` 等
  - 添加插件版本号和作者信息
  - 修正 `/ralph-loop` 为 `/cc-ralph`（本插件命令）
  - 添加代理列表和完整文档引用
- **Agent/Skill 引用修复**
  - `agents/security-reviewer.md` - name 字段 `securityer` → `security-reviewer`
  - `agents/tdd-guide.md` - skills 引用 `tdd` → `testing`
  - `agents/README` - 更新 tdd-guide 的 skills 引用说明

---

## [0.5.1] - 2025-01-26

### Added / 新增

- **数据库专属最佳实践** - 新增 4 个数据库子文件
  - `skills/database-patterns/postgres.md` - PostgreSQL 数据类型、索引策略、RLS、性能诊断
  - `skills/database-patterns/mysql.md` - MySQL InnoDB 优化、索引策略、字符集配置
  - `skills/database-patterns/oracle.md` - Oracle 分区表、全局索引、PL/SQL 最佳实践
  - `skills/database-patterns/sqlite.md` - SQLite WAL 模式、PRAGMA 优化、移动端场景
- **云基础设施安全指南** - 新增 `skills/security-review/cloud-security.md`
  - IAM 最小权限原则
  - 密钥管理（HSM、Vault）
  - CI/CD 安全（OIDC、临时凭证）
  - 网络安全（VPC、WAF）
- **E2E 测试指南** - 在 `rules/testing.md` 添加端到端测试章节
  - 页面对象模式
  - 测试隔离策略
  - 等待策略最佳实践

### Changed / 变更

- **database-patterns/SKILL.md 精简** - 从 ~430 行精简至 ~210 行
  - 通用原则保留在 SKILL.md
  - 数据库专属内容移至子文件
- **Skill 子文件引用修复** - 在 SKILL.md 中添加显式子文件引用
  - `database-patterns/SKILL.md` 添加 4 个数据库子文件引用
  - `security-review/SKILL.md` 添加 cloud-security.md 引用
- **skills/README 更新** - 更新目录结构和技能表格

### Fixed / 修复

- **`/cc-ralph` 集成归档功能** - 修复 cc-ralph 启动时未调用 archive-progress.js 的问题
  - 启动循环前自动运行归档，防止 progress.md 过大
  - 每次迭代 checkpoint 后检查是否需要归档
  - 更新执行流程文档，添加归档步骤说明

### Removed / 移除

- **MIGRATION.md** - 移除迁移指南（Plugin 用户无需迁移，Clone 用户参考 README）

---

## [0.5.0] - 2025-01-25

### Added / 新增

- **Hooks 配置验证脚本** - 新增 `scripts/node/verify-hooks.js`
  - 验证脚本路径是否存在
  - 验证 timeout 是否在合理范围 (1s - 600s)
  - 验证 matcher 语法是否正确
  - 验证生命周期事件是否有效
  - 输出诊断报告和修复建议
- **`/setup --verify` 参数** - 运行 hooks 配置验证，诊断模式
- **GitHub Actions CI 增强** - `validate-template.yml` 升级为 `validate-plugin.yml`
  - 添加 JSON 文件语法验证（plugin.json, marketplace.json, hooks.json）
  - 添加 Node.js 脚本语法检查
  - 添加 Markdown frontmatter 验证
  - 添加插件清单字段验证

### Changed / 变更

- **Roadmap 更新** - v0.5.0 主要目标（质量保证）已完成
  - ✅ Hook 验证脚本
  - ✅ GitHub Actions CI
  - ✅ 文档结构优化（英文优先策略）
  - ⏳ 核心命令英文版（等待官方 i18n #7233）

---

## [0.4.5] - 2025-01-25

### Added / 新增

- **`progress.md` 自动归档机制** - 解决长期项目中 progress.md 文件膨胀问题
  - 新增 `progress-archive.md` 模板，存储历史记录
  - 新增 `scripts/node/archive-progress.js` 归档脚本
  - 新增 `/checkpoint --archive` 命令支持
  - 滚动窗口策略：保留最近 5 项完成、5 条决策、5 个检查点

### Changed / 变更

- **`progress.md` 模板优化** - 从累积模式改为滚动窗口模式
  - "已完成" → "最近完成"（限制 5 项）
  - "决策记录" → "最近决策"（限制 5 条）
  - "检查点历史" → "最近检查点"（限制 5 个）
  - 超出限制的记录自动归档

### Fixed / 修复

- **大文件读取问题** - progress.md 超过 25000 tokens 时无法读取的问题

---

## [0.4.4] - 2025-01-25

### Fixed / 修复

- **Plugin Hooks 双重加载问题** - 修复插件 hooks 和全局配置 hooks 同时加载导致的错误
  - 清空 `hooks/hooks.json`，插件不再自动加载 hooks
  - hooks 需要通过 `/setup --hooks` 手动启用
  - 解决 "PreToolUse:Bash hook error" 问题

### Changed / 变更

- **Hooks 默认禁用** - 由于 `${CLAUDE_PLUGIN_ROOT}` 环境变量问题，插件 hooks 现在默认禁用
- **README 更新** - 更新警告说明为 "Hooks 需要手动启用"

---

## [0.4.3] - 2025-01-25

### Fixed / 修复

- **Plugin Hooks 路径问题** - 解决 `${CLAUDE_PLUGIN_ROOT}` 在某些平台（特别是 Windows）上无法正确展开的问题
  - 更新 `/setup` 命令支持 `--hooks` 参数，自动配置使用绝对路径的 hooks
  - 支持 `--global` 配置到全局、`--project` 配置到项目
  - 添加详细的 FAQ 说明和故障排查指南
  - 参见 [Issue #9354](https://github.com/anthropics/claude-code/issues/9354)

### Changed / 变更

- **`/setup` 命令增强** - 添加 hooks 配置步骤，自动检测环境并生成正确的配置
- **README 更新** - 简化 hooks 限制说明，引导用户使用 `/setup --hooks` 命令

---

## [0.4.2] - 2025-01-25

### Added / 新增

- **`/cc-ralph` 命令** - Ralph Loop 集成命令，使用 cc-best 工作流启动自主开发循环
  - 支持 `--mode` 参数选择工作模式（full-feature/iterate/bug-fix/refactor/fix-tests/doc-gen）
  - 支持 `--setup` 参数复制模板到本地项目
  - 自动检测 Clone 用户和插件用户，适配不同场景
  - 自动读取项目状态，注入角色工作流（PM→Lead→Dev→QA）

### Changed / 变更

- **README 更新** - 添加 `/cc-ralph` 命令说明到模式命令表格（中英文版）

### Documentation / 文档

- **cc-ralph 命令文档** - 详细说明与官方 ralph-loop 的关系和配合使用方式

---

## [0.4.1] - 2025-01-25

### Fixed / 修复

- **Agent handoffs 兼容性** - 移除 `cc-best:` 前缀，支持 Clone 用户直接使用本地 agents
- **README timeout 不一致** - 英文版 `timeout: 5` 修正为 `timeout: 5000`（与中文版一致）
- **lead.md 外部插件说明** - 添加 `feature-dev` 官方插件的可选安装说明，明确本地 `planner` 可作为替代

### Changed / 变更

- **命令 handoffs 更新** - `pm.md`, `lead.md`, `dev.md`, `qa.md`, `verify.md`, `checkpoint.md` 统一使用无前缀 agent 名称

---

## [0.4.0] - 2025-01-24

### Security / 安全

- **命令注入修复** - `commandExists()` 使用 `spawnSync` 替代 `execSync`，添加输入验证，防止命令注入攻击

### Changed / 变更

- **Hook 生命周期** - `Stop` 重命名为 `SessionEnd`（跟随 Claude Code 2.1.x 官方更新）
- **超时配置增加** - `format-file`: 30s→60s, `typescript-check`: 10s→30s（官方超时上限从 60s 提升至 10min）
- **权限配置简化** - 使用 `Skill(*)` 通配符替代单独的技能声明

### Added / 新增

- **安全警告注释** - 为 `runCommand()` 添加安全使用说明，防止传入用户输入

### Fixed / 修复

- **文档一致性** - 修正 README/hooks 文档中 `Stop` → `SessionEnd` 的错误引用
- **版本同步** - 统一 `plugin.json` 和 `marketplace.json` 版本号至 0.4.0

---

## [0.3.0] - 2025-01-24

### Fixed / 修复

- **Hook 路径修复** - 修正 `settings.local.json` 中的脚本路径 (`.claude/scripts/` → `./scripts/`)
- **Agent 模型信息** - 更新 `agents/README` 表格，与实际配置一致 (planner 和 code-simplifier 使用 opus)
- **Hooks 同步** - 同步 `hooks/hooks.json` 与 `settings.local.json` (添加 Setup, SessionStart, PreCompact 生命周期事件)

### Added / 新增

- **占位符文档** - 在 FAQ 中添加详细的占位符替换指南（中英双语）

### Changed / 变更

- **权限配置精简** - 移除冗余的 MCP 权限声明（已被 `mcp__*` 通配符覆盖）

---

## [0.2.0] - 2025-01-24

### Added / 新增

- **Demo GIFs** - 添加演示动图展示插件功能
- **Plugin-first architecture** - 重构为插件优先架构

### Changed / 变更

- **Plugin name** - 简化插件名称为 `cc-best`
- **Script paths** - 更新脚本路径以适配插件架构
- **Documentation** - 更新 README 强调插件优先方式

### Fixed / 修复

- **Duplicate hooks** - 移除插件清单中重复的 hooks 声明
- **Install command** - 修正插件安装命令格式

---

## [0.1.0] - 2025-01-22

### Added / 新增

- **Core Framework / 核心框架**
  - `CLAUDE.md` - 项目宪法，采用"道法术器"方法论
  - `memory-bank/` - 进度、架构、技术栈模板
  - `.claude/settings.json` - 基础权限配置

- **Commands / 命令** (30+)
  - 角色命令: `/pm`, `/lead`, `/dev`, `/qa`, `/designer`, `/clarify`
  - 模式命令: `/iterate`, `/pair`
  - 工具命令: `/build`, `/test`, `/run`, `/commit`, `/verify`, `/pr`
  - 上下文命令: `/context`, `/memory`, `/compact`, `/checkpoint`
  - 学习命令: `/learn`, `/train`, `/infer`

- **Rules / 规则** (13 files)
  - `methodology.md` - 完整开发方法论
  - `coding-standards.md` - 通用编码规范
  - 语言特定规范: Python, Vue/TS, C++, Java, C#, Go
  - `security.md`, `testing.md`, `git-workflow.md`

- **Skills / 技能** (14 categories)
  - `backend-patterns/` - 多语言后端模式
  - `frontend-patterns/` - Vue 和 React 模式
  - `tdd-workflow/`, `api-development/`, `database-patterns/`
  - `debugging/`, `git-workflow/`, `security-review/`
  - `continuous-learning/`, `strategic-compact/`

- **Agents / 智能体** (6 types)
  - `code-reviewer.md`, `code-simplifier.md`
  - `planner.md`, `requirement-validator.md`
  - `security-reviewer.md`, `tdd-guide.md`

- **Scripts / 脚本** (16 Node.js hooks)
  - Hook 脚本: `validate-command.js`, `protect-files.js`, `format-file.js`
  - 会话脚本: `session-start.js`, `session-end.js`, `session-check.js`
  - 工具脚本: `init.js`, `pre-compact.js`

- **Documentation / 文档**
  - 双语 README (English + 中文)
  - MCP 配置指南
  - Hook 配置示例

---

## Version Format / 版本格式说明

### Version Numbers / 版本号

- **Major (X.0.0)**: 破坏性变更，重大重构
- **Minor (0.X.0)**: 新功能、命令、技能
- **Patch (0.0.X)**: Bug 修复、文档更新

### Change Types / 变更类型

- **Added / 新增**: 新功能
- **Changed / 变更**: 现有功能变更
- **Deprecated / 弃用**: 即将移除的功能
- **Removed / 移除**: 已移除的功能
- **Fixed / 修复**: Bug 修复
- **Security / 安全**: 安全改进

---

## Roadmap / 路线图

### v0.5.x ✅ (Released 2025-01-25 ~ 2026-01-27) - 质量保证与架构优化

**核心目标**: 提升可靠性、扩大受众、完善架构

- [x] Hook 验证脚本（配置正确性自动检测）
- [x] GitHub Actions CI（frontmatter、路径自动验证）
- [x] 文档结构优化（README 英文优先、中文版链接）
- [x] Skills 父子结构重组（17 个技能，42 个文件）
- [x] 数据库专属最佳实践（PostgreSQL、MySQL、Oracle、SQLite）
- [x] `/designer` 命令 + `architecture` 技能
- [x] Windows 兼容性修复（Hooks 路径、JSON 输出、SessionStart）
- [x] 敏感文件保护启用（.env、_.key、_.pem、credentials.json）
- [x] 文档审计与一致性修复
- [ ] ~~核心命令英文版~~ → 等待官方 i18n 支持 (#7233)

> **i18n 说明**: 官方 Claude Code 暂无 i18n 支持（跟踪 #7233），
> 待官方发布后在 v0.6.0+ 适配。当前采用"英文优先 + 中文版链接"策略。

> **Windows 兼容性**: 已知第三方插件在 Windows 上存在 hook 路径问题，
> 已提交上游 issue：[superpowers#369](https://github.com/obra/superpowers/issues/369)、
> [claude-plugins-official#288](https://github.com/anthropics/claude-plugins-official/issues/288)

### v0.6.0 (Planned) - 易用性与配置化

**核心目标**: 降低上手门槛 + 灵活配置

- [ ] **Lite 模式** - 精简版插件，减少命令/技能数量（待用户反馈确认需求）
  - 方案：marketplace 中添加 `cc-best-lite` 作为独立插件
  - 包含：核心命令（/iterate, /checkpoint, /commit）+ 基础 hooks
  - 排除：角色命令、专业技能、agents
- [ ] 增强 `/setup` 交互式配置向导
- [ ] 模型策略配置（质量优先/速度优先/均衡/禁用 opus）
- [ ] 常见错误诊断与修复建议
- [ ] 示例项目（完整工作流演示）

### v0.7.0 (Planned) - 多模型协作

**核心目标**: 发挥不同模型优势

- [ ] multi-model skill（多模型协作协议）
- [ ] Gemini CLI 集成（长上下文分析）
- [ ] 扩展 second-opinion（支持更多模型）
- [ ] 任务路由机制（根据任务类型选模型）

### v1.0.0 (Future) - 稳定版

**核心目标**: 生产级可靠

- [ ] 稳定的扩展 API（自定义命令/技能）
- [ ] Memory-bank 云同步（可选）
- [ ] 团队协作支持
- [ ] 完整 i18n（跟随官方实现）

---

[0.5.3]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.5...v0.5.0
[0.4.5]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/xiaobei930/claude-code-best-practices/releases/tag/v0.1.0
