# CC-Best Plugin Constitution

**Version**: 0.5.3 | **Plugin Name**: cc-best | **Author**: xiaobei930

> Claude Code best practices plugin with role-based workflows, safety hooks, and multi-language standards.
> Claude Code 最佳实践插件，提供角色工作流、安全钩子和多语言编码规范。

## Quick Navigation | 快速导航

| Document 文档                   | Purpose 用途                         |
| ------------------------------- | ------------------------------------ |
| `README.md` / `README.zh-CN.md` | Full documentation 完整文档          |
| `commands/`                     | 32 slash commands 斜杠命令           |
| `skills/`                       | 17 development skills 开发技能       |
| `agents/`                       | 6 specialized agents 专业代理        |
| `hooks/`                        | Safety hooks 安全钩子                |
| `rules/`                        | Coding standards 编码规范            |
| `memory-bank/`                  | Project state templates 项目状态模板 |

---

## Key Principles | 关键原则 (IMPORTANT)

### Must Follow | 必须遵守

1. **P1 API Handling 接口处理** - Must read docs before calling APIs 调用前必须查阅文档，**NO guessing 禁止猜测**
2. **P3 Business Logic 业务理解** - Must come from clear requirements 必须来源于明确需求，**NO assumptions 禁止假设**
3. **P7 Honest Communication 诚信沟通** - Must clarify incomplete info 信息不完整时必须说明，**NO pretending 禁止假装理解**
4. **CP4 Simplicity 简洁执念** - Single responsibility, nesting≤3, complexity≤10 函数单一职责，嵌套≤3层

### Autonomous Decision Principles | 自主决策原则

1. **A1 Context Inference 上下文推断** - Infer from project context 基于项目上下文推断，**don't interrupt to ask 不中断循环询问用户**
2. **A2 Decision Recording 决策记录** - Record **rationale** and **confidence** 记录**依据**和**置信度**
3. **A3 Downstream Correction 下游纠偏** - Lead can adjust PM decisions, QA can identify assumption errors
4. **A4 MVP Fallback 兜底** - Use minimal viable approach when uncertain 无依据时采用最小可行方案，mark "TBD 待确认"
5. **A5 Issue Classification 问题分类** - Distinguish "implementation bugs" vs "requirement assumption errors" 区分"实现Bug"和"需求假设错误"

---

## Workflow | 工作流程

```
/pm → /clarify(if needed) → /lead → /designer(frontend) → /dev → /qa → /verify → /commit → /clear → loop
```

**Role Commands 角色命令**: `/pm` `/clarify` `/lead` `/designer` `/dev` `/qa` `/verify`
**Tool Commands 工具命令**: `/build` `/test` `/run` `/status` `/commit` `/compact` `/checkpoint`
**Mode Commands 模式命令**: `/iterate` (autonomous) `/pair` (pair programming) `/cc-ralph` (long-running loop)

### /iterate Mode Rules | 模式规则 (IMPORTANT)

> **After completing a task, immediately execute the next one. NO summarizing and waiting.**
> **任务完成后必须立即执行下一个任务，禁止输出总结后等待用户响应。**

- ✅ Complete task → Update progress.md → Read progress.md → **Execute next task immediately**
- ❌ Complete task → Output "status/completed/next phase" → Wait for user

**Stop Conditions 停止条件 (only these):**

- User interrupts (Ctrl+C or Escape) 用户主动中断
- All tasks **completed** 待办任务**全部**完成
- Fatal error that cannot be auto-resolved 无法自动解决的致命错误
- External dependency requiring user decision 需要用户决策的外部依赖

---

## Agents | 专业代理

| Agent 代理              | Purpose 用途                    |
| ----------------------- | ------------------------------- |
| `code-reviewer`         | Deep code review 深度代码审查   |
| `code-simplifier`       | Code simplification 代码简化    |
| `planner`               | Task planning 任务规划          |
| `security-reviewer`     | Security review 安全审查        |
| `tdd-guide`             | TDD guidance TDD 指导           |
| `requirement-validator` | Requirement validation 需求验证 |

---

## Thinking Triggers | 思考触发词

| Trigger 触发词       | Effect 作用                                    |
| -------------------- | ---------------------------------------------- |
| `ultrathink`         | Deep analysis mode 深度分析模式                |
| `megathink`          | Deeper reasoning for architecture 更深层次推理 |
| `think step by step` | Step-by-step detailed reasoning 分步骤详细推理 |

---

## Coding Standards | 编码规范

- **Naming 命名**: Variables/functions in English, comments/logs in Chinese 变量/函数英文，注释/日志中文
- **Formatting 格式化**: Auto-executed by hooks Hook 自动执行
- **Commits 提交**: Conventional Commits
- **Detailed rules 详细规范**: See 见 `rules/`

---

## Forbidden Operations | 禁止操作

### Git

- `git push --force` / `git reset --hard` / `git commit --amend` (if pushed 已推送)

### Code 代码

- No guessing APIs 不猜接口、不造接口、不臆想业务
- No committing secrets 不提交密钥文件（.env, _.key, credentials._）

### Autonomous Mode 自循环模式

- **NO interrupting to ask user** 禁止中断循环询问用户（通过上下文推断决策）
- **NO baseless assumptions** 禁止无依据的凭空假设（决策必须有来源）

---

## Quick Start | 快速开始

```bash
# Basic workflow 基本工作流
/iterate      # Autonomous iteration 自主迭代循环
/pair         # Pair programming 结对编程模式

# Long-running loop (requires ralph-loop plugin)
# 长时间循环（需安装 ralph-loop 官方插件）
/cc-ralph     # CC-Best integrated loop CC-Best 集成循环
```

**Install ralph-loop plugin 安装 ralph-loop 插件:**

```bash
/plugin install ralph-loop@claude-plugins-official
```

---

## Full Documentation | 完整文档

- **Methodology 方法论**: `rules/methodology.md`
- **Skills Guide 技能指南**: `skills/README`
- **Agents Guide 代理指南**: `agents/README`
- **Hooks Guide 钩子指南**: `hooks/README.md`
