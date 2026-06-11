---
description: 切换 Agent 模型策略（质量/均衡/经济）
argument-hint: "[--show]"
allowed-tools: Read, Bash
---

# /model - Agent 模型策略切换

切换所有 Agent 的模型分配，控制 Token 成本和输出质量的平衡。

## 使用方式

### 交互式选择（推荐）

直接执行 `/cc-best:model`，通过交互式选择切换策略。

使用 `AskUserQuestion` 向用户展示三档策略：

| 策略         | 说明                        | 适用场景                 |
| ------------ | --------------------------- | ------------------------ |
| **quality**  | 所有 Agent 使用 Opus        | 复杂架构设计、关键项目   |
| **balanced** | 设计类 Opus + 执行类 Sonnet | 日常开发（推荐）         |
| **economy**  | 仅核心 Sonnet，其余 Haiku   | 简单任务、Token 预算有限 |

用户选择后，执行：

```bash
node scripts/node/model-strategy.js <strategy>
```

> **Plugin 模式路径**: 需要从 agent 文件所在目录推断插件根目录。脚本内部通过 `__dirname` 自动解析，无需手动指定路径。

### 查看当前策略

```bash
/cc-best:model --show
```

执行 `node scripts/node/model-strategy.js --show`，输出当前各 Agent 的模型配置和推断的策略名称。

---

## 策略映射表

| Agent                 | quality | balanced | economy |
| --------------------- | ------- | -------- | ------- |
| architect             | opus    | opus     | sonnet  |
| code-reviewer         | opus    | opus     | sonnet  |
| security-reviewer     | opus    | opus     | sonnet  |
| planner               | opus    | sonnet   | sonnet  |
| code-simplifier       | opus    | sonnet   | haiku   |
| tdd-guide             | opus    | sonnet   | sonnet  |
| requirement-validator | opus    | sonnet   | haiku   |
| build-error-resolver  | opus    | sonnet   | haiku   |

---

## 输出格式

### 切换成功

```
🔧 模型策略已切换: balanced

| Agent                 | Model  |
| --------------------- | ------ |
| architect             | opus   |
| code-reviewer         | opus   |
| security-reviewer     | opus   |
| planner               | sonnet |
| code-simplifier       | sonnet |
| tdd-guide             | sonnet |
| requirement-validator | sonnet |
| build-error-resolver  | sonnet |

已切换到 balanced 策略（5 个文件变更）
```

### 查看当前

```
📊 当前 Agent 模型配置

| Agent                 | Model  |
| --------------------- | ------ |
| architect             | opus   |
| ...                   | ...    |

当前策略: custom
```

---

## 模型别名现状（2026-06，Claude Code v2.1.173）

- `opus` / `sonnet` / `haiku` 是别名，自动跟踪最新版本，无需手动升级
- 当前 `opus` → **Opus 4.8**（v2.1.154+ 默认 high effort，快速模式成本更低）
- **Fable 5**（`claude-fable-5`，v2.1.170+）为 Mythos 级新模型（1M 上下文/128k 输出），无别名，如需使用须在 agent frontmatter 显式写完整模型 ID；适合超长自治循环和大型架构分析
- 不写 `model` 字段 = inherit（继承会话模型），用户控制层 agent 采用此策略

---

## 注意事项

- 策略变更直接修改 `agents/*.md` 文件的 `model:` frontmatter 字段
- 变更会被 Git 追踪，团队成员可看到
- 如需个人偏好不进入 Git，可在 `.gitignore` 中添加 `agents/*.md`（不推荐）
- 策略名称从 agent 文件推断，不存储到额外配置文件
- 当前默认配置（5 opus + 3 sonnet）不匹配任何预设策略，显示为 `custom`

---

## Model Skill（细粒度路由）

除全局策略外，`skills/model/` 提供任务级别的模型选择参考：

- **routing-matrix.md** — 任务类型→推荐模型映射表
- Claude 会根据当前任务类型自动参考该 skill，选择合适的子代理模型
- 全局策略（本命令设定）优先级高于 skill 建议

详见 `skills/model/SKILL.md`。

> **记住**: 模型策略影响成本和质量——Quality 用于关键决策，Economy 用于批量执行，Balanced 是安全默认。
