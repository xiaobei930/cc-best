# 官方插件集成指南

本文档说明如何将 Claude Code 官方插件与本模板的角色/命令配合使用。

---

## 插件安装

```bash
# 浏览可用插件
/plugin

# 安装插件
/plugin install {plugin-name}@claude-plugins-official
```

---

## 插件分类与推荐

### 🔴 强烈推荐（立即安装）

| 插件 | 安装命令 | 用途 | 与模板关系 |
|------|----------|------|-----------|
| **hookify** | `/plugin install hookify` | 自定义行为守卫 | 增强 hooks 配置 |
| **security-guidance** | `/plugin install security-guidance` | 安全检查 | 增强 security.md |
| **code-review** | `/plugin install code-review` | PR 自动审查 | 增强 /qa |
| **frontend-design** | 已内置 | 前端设计 | 已集成 /designer |

### 🟡 推荐安装（按技术栈选择）

| 插件 | 安装命令 | 适用场景 |
|------|----------|----------|
| **typescript-lsp** | `/plugin install typescript-lsp` | TypeScript/JavaScript 项目 |
| **pyright-lsp** | `/plugin install pyright-lsp` | Python 项目 |
| **gopls-lsp** | `/plugin install gopls-lsp` | Go 项目 |
| **rust-analyzer-lsp** | `/plugin install rust-analyzer-lsp` | Rust 项目 |
| **csharp-lsp** | `/plugin install csharp-lsp` | C# 项目 |

### 🟢 可选安装（高级场景）

| 插件 | 用途 | 何时使用 |
|------|------|----------|
| **feature-dev** | 7 阶段功能开发 | 大型功能开发时 |
| **pr-review-toolkit** | PR 多角度审查 | PR 审查流程 |
| **code-simplifier** | 代码简化 | 重构阶段 |
| **ralph-loop** | 自主迭代循环 | 长时间自动开发 |

---

## 详细集成方案

### 1. hookify - 行为守卫

**与模板的关系**: 增强 `settings.local.json` 中的 hooks 配置

**安装后**:
```bash
# 创建自定义规则
/hookify 当检测到未经测试就提交代码时警告

# 查看规则
/hookify:list

# 管理规则
/hookify:configure
```

**推荐规则**:
```markdown
# .claude/hookify.test-before-commit.local.md
---
name: require-tests-before-commit
enabled: true
event: stop
action: warn
conditions:
  - field: transcript
    operator: not_contains
    pattern: (npm test|pytest|go test)
---

⚠️ 提交前请先运行测试！
```

### 2. security-guidance - 安全检查

**与模板的关系**: 增强 `.claude/rules/security.md`

**工作原理**:
- 监听 PreToolUse 事件
- 检测 9 种安全模式（XSS、注入、eval 等）
- 自动警告或阻止危险操作

**安装后自动生效**: 无需配置，编辑文件时自动检查

### 3. code-review - PR 自动审查

**与模板的关系**: 可替代 `/qa` 的部分功能

**使用方式**:
```bash
# 本地审查（输出到终端）
/code-review

# 发布为 PR 评论
/code-review --comment
```

**特点**:
- 4 个并行 Agent 同时审查
- 置信度评分（≥80 才报告）
- 自动检查 CLAUDE.md 合规性
- git blame 历史分析

### 4. feature-dev - 功能开发

**与模板的关系**: 可替代 `/pm` → `/lead` → `/dev` 流程

**7 阶段流程**:
```
1. Discovery    → 类似 /pm
2. Exploration  → code-explorer agent
3. Clarifying   → 自动
4. Architecture → code-architect agent (类似 /lead)
5. Implementation → 类似 /dev
6. Quality Review → code-reviewer agent (类似 /qa)
7. Summary      → 自动
```

**何时使用**:
- ✅ 大型新功能开发
- ✅ 需要架构设计
- ❌ 小修改/bug 修复（用模板角色更轻量）

### 5. LSP 插件 - 语言服务

**作用**: 提供实时代码分析、补全、诊断

**安装示例**:
```bash
# TypeScript/JavaScript 项目
/plugin install typescript-lsp

# Python 项目
/plugin install pyright-lsp

# 多语言项目
/plugin install typescript-lsp
/plugin install pyright-lsp
```

**自动功能**:
- 实时错误检测
- 类型检查
- 代码补全建议
- 跳转到定义

---

## 模板与插件的协作流程

### 推荐工作流（小型任务）

```
/pm → /clarify(如需) → /lead → /designer(前端) → /dev → /qa → /code-review → /commit
                                                              ↑
                                                        官方插件增强
```

### 推荐工作流（大型功能）

```
/feature-dev
  ├─ Phase 1-3: Discovery + Exploration + Clarifying
  ├─ Phase 4: Architecture (可参考 /lead 输出的 DES 格式)
  ├─ Phase 5: Implementation
  ├─ Phase 6: Quality Review
  └─ Phase 7: Summary
      ↓
/code-review --comment  (PR 审查)
      ↓
/commit
```

---

## Settings 配置

在 `settings.local.json` 中添加插件相关权限：

```json
{
  "permissions": {
    "allow": [
      "Skill(frontend-design:frontend-design)",
      "Skill(code-review:code-review)",
      "Skill(feature-dev:*)",
      "Skill(hookify:*)",
      "Skill(pr-review-toolkit:*)",
      "Skill(code-simplifier:code-simplifier)"
    ]
  }
}
```

---

## 插件 vs 模板选择指南

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| **日常开发迭代** | 模板角色 | 轻量、快速、定制化 |
| **大型功能开发** | feature-dev | 完整的 7 阶段流程 |
| **PR 审查** | code-review | 4 并行 Agent、置信度过滤 |
| **前端 UI** | /designer + frontend-design | 设计指导 + 代码生成 |
| **安全检查** | security-guidance + security.md | 双重保障 |
| **行为守卫** | hookify + hooks 配置 | 灵活的规则系统 |
| **代码重构** | code-simplifier | 专业简化 |
| **单 session 自动开发** | /iterate | 单会话内自主循环 |
| **结对编程** | /pair | 人机协作，每步确认 |
| **长时间自动开发** | /ralph-loop | 跨会话长循环（需插件） |

---

## 注意事项

1. **插件安装位置**: 插件会安装到 `~/.claude/plugins/`
2. **项目级 vs 全局**: 插件是全局的，模板角色是项目级的
3. **冲突处理**: 如果插件命令与模板命令同名，插件优先
4. **更新插件**: `/plugin update {plugin-name}`
5. **卸载插件**: `/plugin uninstall {plugin-name}`

---

## 参考资源

- [Claude Code 官方插件目录](https://github.com/anthropics/claude-plugins-official)
- [Claude Code 内置插件](https://github.com/anthropics/claude-code/tree/main/plugins)
- [插件发现与安装](https://code.claude.com/docs/en/discover-plugins)
- [Hooks 参考文档](https://code.claude.com/docs/en/hooks)
