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

## 注意事项

- 策略变更直接修改 `agents/*.md` 文件的 `model:` frontmatter 字段
- 变更会被 Git 追踪，团队成员可看到
- 如需个人偏好不进入 Git，可在 `.gitignore` 中添加 `agents/*.md`（不推荐）
- 策略名称从 agent 文件推断，不存储到额外配置文件
- 当前默认配置（5 opus + 3 sonnet）不匹配任何预设策略，显示为 `custom`
