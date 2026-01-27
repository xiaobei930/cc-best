# 本地组件与官方插件联动指南

本文档记录本地 agents/commands/skills 与官方 Claude Code 插件的联动关系和使用策略。

## 组件目录结构

本项目支持两种使用模式：

### Plugin 模式（作为插件安装）

组件位于插件根目录：

```
/                    # 插件根目录
├── commands/        # Slash 命令
├── skills/          # 开发技能
├── agents/          # 子智能体
├── rules/           # 编码规范
├── scripts/         # 自动化脚本
└── hooks/           # Hook 配置
```

### Clone 模式（克隆后直接使用）

与 Plugin 模式相同，组件在项目根目录，`.claude/` 目录存放 Claude Code 配置：

```
.claude/
├── settings.json                  # 权限配置
├── settings.local.json            # 本地配置 + Hooks
├── mcp-configs/                   # MCP 服务器配置参考
├── ralph-prompts/                 # Ralph Loop 提示词
├── learned/                       # 持续学习存储
├── docs/                          # 项目文档
├── screenshots/                   # 截图存储
├── hookify.*.local.md             # Hookify 插件规则
└── tools.md                       # 工具说明
```

## 设计原则

1. **独立可用** - 本地组件无需安装任何插件即可正常工作
2. **插件增强** - 安装官方插件后可获得更强大的功能
3. **互补而非替代** - 本地组件和插件各有侧重，配合使用效果最佳

---

## Agents 与官方插件对照

| 本地 Agent              | 官方插件            | 本地特点                     | 插件特点               | 配合策略                       |
| ----------------------- | ------------------- | ---------------------------- | ---------------------- | ------------------------------ |
| `code-reviewer`         | `code-review`       | 轻量、即时反馈、可定制检查项 | 更深度分析、自动触发   | 本地做快速检查，插件做深度审查 |
| `security-reviewer`     | `security-guidance` | OWASP 清单、关键词搜索       | 自动安全分析、持续监控 | 本地做清单检查，插件做智能分析 |
| `code-simplifier`       | `code-simplifier`   | 本地执行、快速反馈           | 更多上下文、更智能     | 二选一或插件优先               |
| `tdd-guide`             | -                   | 本地独有                     | 无官方对应             | 独立使用                       |
| `planner`               | -                   | 本地独有                     | 无官方对应             | 独立使用                       |
| `requirement-validator` | -                   | 本地独有                     | 无官方对应             | 独立使用                       |

---

## Commands 与官方插件对照

| 本地命令    | 官方插件                          | 关系说明                             |
| ----------- | --------------------------------- | ------------------------------------ |
| `/iterate`  | `ralph-loop` (提供 `/ralph-loop`) | 本地：单会话循环；插件：跨会话持久化 |
| `/designer` | `frontend-design`                 | 本地：设计指导；插件：设计系统集成   |
| hooks 配置  | `hookify`                         | 本地：示例配置；插件：完整 Hook 管理 |

---

## 推荐插件配置

### 最小配置（基础开发）

```json
{
  "enabledPlugins": {
    "pyright@claude-code-lsps": true,
    "vtsls@claude-code-lsps": true
  }
}
```

### 推荐配置（完整体验）

```json
{
  "enabledPlugins": {
    "pyright@claude-code-lsps": true,
    "vtsls@claude-code-lsps": true,
    "code-review@claude-plugins-official": true,
    "hookify@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true
  }
}
```

### 高级配置（全功能）

```json
{
  "enabledPlugins": {
    "pyright@claude-code-lsps": true,
    "vtsls@claude-code-lsps": true,
    "code-review@claude-plugins-official": true,
    "hookify@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "ralph-loop@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true
  }
}
```

---

## 使用场景示例

### 场景 1: 代码审查

**无插件时**:

```
Claude 自动委派 code-reviewer agent 进行审查
输出：架构合规性、代码质量、安全问题清单
```

**有 code-review 插件时**:

```
1. 本地 agent 做快速检查（即时反馈）
2. 插件做深度分析（更全面）
3. 两者结果互补
```

### 场景 2: 安全审查

**无插件时**:

```
Claude 委派 security-reviewer agent
按 OWASP 清单逐项检查
搜索敏感关键词（password, secret, key 等）
```

**有 security-guidance 插件时**:

```
1. 本地 agent 做清单式检查
2. 插件做智能安全分析
3. 本地发现的问题可交给插件深入分析
```

### 场景 3: 自主迭代

**无插件时**:

```
/iterate 命令在单会话内循环执行
会话结束后需手动恢复上下文
```

**有 ralph-loop 插件时**:

```
/ralph-loop 命令跨会话持久化
自动保存/恢复进度
适合长时间任务（小时级）
```

---

## 本地组件独立使用指南

即使不安装任何官方插件，本地组件也能完整工作：

### Agents（自动委派）

Claude 会在适当时机自动委派：

- 代码变更后 → `code-reviewer`
- 涉及认证/输入 → `security-reviewer`
- 需要测试 → `tdd-guide`
- 复杂任务 → `planner`
- 需求文档 → `requirement-validator`
- 代码清理 → `code-simplifier`

### Commands（手动调用）

所有 `/xxx` 命令都是本地实现，无需插件：

- `/pm`, `/lead`, `/dev`, `/qa` - 角色命令
- `/iterate`, `/pair` - 模式命令
- `/build`, `/test`, `/commit` - 工具命令

### Skills（自动加载）

根据任务类型自动加载相关 skills：

- API 开发 → `api`
- 安全相关 → `security`
- TDD 流程 → `tdd`

---

## 已知问题和待优化

### 问题 1: skills 数量描述过时

- **位置**: README.md, .claude-plugin/marketplace.json
- **现状**: 描述为 "12 categories"
- **实际**: 14 个 skill 目录
- **状态**: ✅ 已修复 (2026-01-23)

### 问题 2: Playwright MCP 依赖未说明

- **位置**: README Requirements
- **现状**: commands 使用 `mcp__plugin_playwright_playwright__*`
- **问题**: 未说明需要安装 Playwright MCP
- **状态**: ✅ 已修复 (2026-01-23)

### 问题 3: settings.json 推荐配置不完整

- **位置**: .claude/settings.json
- **现状**: 未启用 security-guidance
- **建议**: 添加完整推荐配置
- **状态**: ✅ 已修复 (2026-01-23)

### 问题 4: 组件目录结构重构

- **变更**: 组件从 `.claude/` 移动到根目录
- **原因**: 符合官方插件目录结构规范
- **影响**:
  - `.claude/commands/` → `commands/`
  - `.claude/skills/` → `skills/`
  - `.claude/agents/` → `agents/`
  - `.claude/rules/` → `rules/`
  - `.claude/scripts/` → `scripts/`
- **状态**: ✅ 已完成 (2026-01-24)

---

## 版本历史

| 日期       | 变更                            |
| ---------- | ------------------------------- |
| 2026-01-24 | 更新组件目录结构（Plugin 优先） |
| 2026-01-23 | 初始版本，记录联动关系          |
