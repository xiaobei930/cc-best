# Contributing to Claude Code Best Practices Template

[English](#english) | [中文](#中文)

---

## English

Thank you for your interest in contributing! This project aims to build the best Claude Code development template together with the community.

### Ways to Contribute

#### 1. Report Issues
- Found a bug? [Open an issue](../../issues/new?template=bug_report.md)
- Have a suggestion? [Open a feature request](../../issues/new?template=feature_request.md)
- Documentation unclear? Let us know!

#### 2. Submit Pull Requests
- Fix bugs
- Add new commands/skills/rules
- Improve documentation
- Add translations

#### 3. Share Your Experience
- Share usage scenarios in Discussions
- Write blog posts about using this template
- Star the project if you find it useful

### Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/claude-code-best-practices.git
cd claude-code-best-practices

# 2. Create a branch
git checkout -b feature/your-feature-name

# 3. Make changes and test
python .claude/scripts/test_template.py

# 4. Commit (follow conventional commits)
git commit -m "feat: add new command for X"

# 5. Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat`: New feature (command, skill, rule)
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(commands): add /deploy command for CI/CD
fix(hooks): resolve format_file.py encoding issue
docs(readme): add FAQ section
```

### Pull Request Guidelines

1. **One PR per feature/fix** - Keep changes focused
2. **Update documentation** - If adding commands/skills, update relevant docs
3. **Test your changes** - Run `test_template.py`
4. **Follow existing patterns** - Match the style of existing files
5. **Write clear descriptions** - Explain what and why

### File Structure Guidelines

#### Adding a New Command
```
.claude/commands/your-command.md
```
- Include YAML frontmatter with `allowed_tools`
- Define clear role and responsibilities
- Add usage examples

#### Adding a New Rule
```
.claude/rules/your-rule.md
```
- Specify `paths` in frontmatter for auto-matching
- Keep rules focused and actionable

#### Adding a New Skill
```
.claude/skills/your-skill/
├── SKILL.md           # Main skill file
└── language.md        # Optional language-specific file
```

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

### Questions?

- Open a [Discussion](../../discussions)
- Check existing issues before creating new ones

---

## 中文

感谢你有兴趣参与贡献！本项目旨在与社区一起打造最好的 Claude Code 开发模板。

### 贡献方式

#### 1. 报告问题
- 发现 Bug？[提交 Issue](../../issues/new?template=bug_report.md)
- 有建议？[提交功能请求](../../issues/new?template=feature_request.md)
- 文档不清楚？告诉我们！

#### 2. 提交 Pull Request
- 修复 Bug
- 添加新的命令/技能/规则
- 改进文档
- 添加翻译

#### 3. 分享你的经验
- 在 Discussions 分享使用场景
- 写博客介绍这个模板
- 如果觉得有用，给项目 Star

### 开发环境设置

```bash
# 1. Fork 并克隆
git clone https://github.com/YOUR_USERNAME/claude-code-best-practices.git
cd claude-code-best-practices

# 2. 创建分支
git checkout -b feature/your-feature-name

# 3. 修改并测试
python .claude/scripts/test_template.py

# 4. 提交（遵循约定式提交）
git commit -m "feat: 添加 X 功能的新命令"

# 5. 推送并创建 PR
git push origin feature/your-feature-name
```

### 提交信息格式

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
<type>(<scope>): <description>

[可选正文]
```

**类型：**
- `feat`: 新功能（命令、技能、规则）
- `fix`: Bug 修复
- `docs`: 仅文档修改
- `style`: 代码风格修改
- `refactor`: 代码重构
- `test`: 添加测试
- `chore`: 维护任务

**示例：**
```
feat(commands): 添加 /deploy 命令用于 CI/CD
fix(hooks): 修复 format_file.py 编码问题
docs(readme): 添加 FAQ 部分
```

### Pull Request 指南

1. **一个 PR 一个功能** - 保持修改聚焦
2. **更新文档** - 如果添加命令/技能，更新相关文档
3. **测试你的修改** - 运行 `test_template.py`
4. **遵循现有模式** - 与现有文件风格保持一致
5. **写清楚描述** - 说明改了什么以及为什么

### 文件结构指南

#### 添加新命令
```
.claude/commands/your-command.md
```
- 包含 YAML frontmatter，指定 `allowed_tools`
- 定义清晰的角色和职责
- 添加使用示例

#### 添加新规则
```
.claude/rules/your-rule.md
```
- 在 frontmatter 中指定 `paths` 用于自动匹配
- 保持规则聚焦和可操作

#### 添加新技能
```
.claude/skills/your-skill/
├── SKILL.md           # 主技能文件
└── language.md        # 可选的语言特定文件
```

### 行为准则

- 尊重和包容他人
- 提供建设性反馈
- 帮助他人学习和成长

### 有问题？

- 发起 [Discussion](../../discussions)
- 创建新 Issue 前先检查是否已有相关问题

---

## Thank You! / 感谢！

Every contribution, no matter how small, helps make this template better for everyone.

每一个贡献，无论大小，都能让这个模板变得更好。

⭐ If you find this project useful, please consider giving it a star!

⭐ 如果你觉得这个项目有用，请考虑给它一个 Star！
