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

### v0.6.0 (Planned) - 易用性与配置化

**核心目标**: 降低上手门槛 + 灵活配置

- [ ] **Lite 模式** - 精简版插件
- [ ] 增强 `/setup` 交互式配置向导
- [ ] 模型策略配置（质量优先/速度优先/均衡）
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

- [ ] 稳定的扩展 API
- [ ] Memory-bank 云同步（可选）
- [ ] 团队协作支持
- [ ] 完整 i18n

---

## Recent Changes / 近期变更

### [0.5.9] - 2026-02-05

#### Added / 新增

- **Python 进阶技能** - 新增 3 个 Python 子文件
  - `python-patterns.md` - 设计模式（KISS、组合、策略模式）
  - `python-types.md` - 高级类型提示（Protocol、泛型、TypeGuard）
  - `python-observability.md` - 可观测性（日志、指标、追踪）
- **代码健康评估技能** - 新增 `skills/quality/code-health.md`
  - 技术债务量化公式
  - 热点文件检测命令
  - CRITICAL/HIGH/MEDIUM/LOW 优先级分级

#### Changed / 变更

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

> 以下版本为简要摘要，完整内容参见 [Git History](https://github.com/xiaobei930/claude-code-best-practices/commits/main)

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

[0.5.9]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.8...v0.5.9
[0.5.8]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.7...v0.5.8
[0.5.7]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.5...v0.5.6
[0.5.5]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.4...v0.5.5
[0.5.4]: https://github.com/xiaobei930/claude-code-best-practices/compare/v0.5.3...v0.5.4
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
