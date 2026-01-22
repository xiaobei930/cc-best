# Changelog / 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-22

### Added / 新增
- **Core Framework / 核心框架**
  - `CLAUDE.md` - Project constitution with "道法术器" methodology
  - `memory-bank/` - Progress, architecture, and tech-stack templates
  - `.claude/settings.json` - Base permission configuration

- **Commands / 命令** (30+)
  - Role commands: `/pm`, `/lead`, `/dev`, `/qa`, `/designer`, `/clarify`
  - Mode commands: `/iterate`, `/pair`
  - Tool commands: `/build`, `/test`, `/run`, `/commit`, `/verify`, `/pr`
  - Context commands: `/context`, `/memory`, `/compact`, `/checkpoint`
  - Learning commands: `/learn`, `/train`, `/infer`

- **Rules / 规则** (13 files)
  - `methodology.md` - Complete development methodology
  - `coding-standards.md` - Universal coding standards
  - Language-specific styles: Python, Vue/TS, C++, Java, C#, Go
  - `security.md`, `testing.md`, `git-workflow.md`

- **Skills / 技能** (10 categories)
  - `backend-patterns/` - Multi-language backend patterns
  - `frontend-patterns/` - Vue and React patterns
  - `tdd-workflow/`, `api-development/`, `database-patterns/`
  - `debugging/`, `git-workflow/`, `security-review/`
  - `continuous-learning/`, `strategic-compact/`

- **Agents / 智能体** (6 types)
  - `code-reviewer.md`, `code-simplifier.md`
  - `planner.md`, `requirement-validator.md`
  - `security-reviewer.md`, `tdd-guide.md`

- **Scripts / 脚本** (15 files)
  - Hook scripts: `format_file.py`, `protect_files.py`, `validate_command.py`
  - Session scripts: `session_start.sh`, `session_end.sh`, `session_check.py`
  - Utility scripts: `init.sh`, `test_template.py`

- **Documentation / 文档**
  - Bilingual README (English + Chinese)
  - MCP configuration guide
  - Hook configuration examples

### Notes / 备注
- Primary language: Chinese (中文为主)
- Supports 7+ programming languages
- MIT License

---

## Version History Format / 版本格式说明

### Version Numbers / 版本号
- **Major (X.0.0)**: Breaking changes, major restructure
- **Minor (0.X.0)**: New features, commands, skills
- **Patch (0.0.X)**: Bug fixes, documentation updates

### Change Types / 变更类型
- **Added / 新增**: New features
- **Changed / 变更**: Changes to existing functionality
- **Deprecated / 弃用**: Features to be removed
- **Removed / 移除**: Removed features
- **Fixed / 修复**: Bug fixes
- **Security / 安全**: Security improvements

---

## Future Releases / 未来版本

### Planned for v1.1.0
- [ ] English translations for key commands
- [ ] GitHub Actions for template validation
- [ ] More language-specific patterns

### Planned for v1.2.0
- [ ] Plugin system for custom extensions
- [ ] Cloud sync support for memory-bank
- [ ] Team collaboration features

---

[Unreleased]: https://github.com/xiaobei930/claude-code-best-practices/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/xiaobei930/claude-code-best-practices/releases/tag/v1.0.0
