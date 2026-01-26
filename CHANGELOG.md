# Changelog / 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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

### v0.5.0 ✅ (Released 2025-01-25) - 质量保证与英文支持

**核心目标**: 提升可靠性、扩大受众

- [x] Hook 验证脚本（配置正确性自动检测）
- [x] GitHub Actions CI（frontmatter、路径自动验证）
- [x] 文档结构优化（README 英文优先、中文版链接）
- [ ] ~~核心命令英文版~~ → 等待官方 i18n 支持 (#7233)

> **i18n 说明**: 官方 Claude Code 暂无 i18n 支持（跟踪 #7233），
> 待官方发布后在 v0.6.0+ 适配。当前采用"英文优先 + 中文版链接"策略。

### v0.6.0 (Planned) - 易用性与配置化

**核心目标**: 降低上手门槛 + 灵活配置

- [ ] **Lite 模式** - 精简版插件，减少命令/技能数量（待用户反馈确认需求）
  - 方案：marketplace 中添加 `cc-best-lite` 作为独立插件
  - 包含：核心命令（/iterate, /checkpoint, /commit）+ 基础 hooks
  - 排除：角色命令、专业技能、agents
- [ ] 增强 `/setup` 交互式配置向导
- [ ] 模型策略配置（质量优先/速度优先/均衡/禁用 opus）
- [ ] 常见错误诊断与修复建议
- [ ] 故障排除文档完善
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
