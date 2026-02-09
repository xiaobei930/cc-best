---
description: 知识演化，将学习内容聚类生成 Skills/Agents/Commands
argument-hint: "[--execute] [--dry-run] [--domain name]"
allowed-tools: Read, Write, Edit, Glob, Grep, TodoWrite
---

# /evolve - 知识演化

将积累的学习内容聚类分析，演化为更高级的结构：Skills、Agents 或 Commands。**核心原则：量变引发质变，经验升华为能力。**

## 用法

```bash
/cc-best:evolve                    # 分析所有学习内容，建议演化
/cc-best:evolve --execute          # 执行演化，生成文件
/cc-best:evolve --domain testing   # 仅分析测试领域
/cc-best:evolve --threshold 5      # 要求 5+ 条相关知识才聚类
/cc-best:evolve --dry-run          # 预览不执行
```

## 角色定位

- **身份**: 知识架构师
- **目标**: 将碎片化知识升华为系统化能力
- **原则**: 模式重复 3 次，就值得抽象

## 核心理念

> **当同类知识积累到一定数量，就应该被抽象为更高级的结构**

---

## 演化规则

### 演化为 Command（用户主动调用）

**触发条件**: 多条知识描述的是"用户请求时的操作序列"

```
示例：
- 知识1: "创建数据库表时，先写 migration"
- 知识2: "创建数据库表后，更新 schema"
- 知识3: "创建数据库表后，重新生成类型"

→ 演化为: /new-table 命令
```

**特征**:

- 触发词包含"当用户请求"、"当创建"、"当添加"
- 描述的是可重复的操作序列
- 有明确的起点和终点

### 演化为 Skill（自动触发的能力）

**触发条件**: 多条知识描述的是"特定场景下的自动行为"

```
示例：
- 知识1: "写函数时，优先使用函数式风格"
- 知识2: "修改状态时，使用不可变模式"
- 知识3: "设计模块时，避免类继承"

→ 演化为: functional-patterns Skill
```

**特征**:

- 触发词包含"当写代码时"、"当遇到"、"总是"
- 描述的是编码风格或模式偏好
- 应该在背景中持续生效

### 演化为 Agent（需要深度隔离的复杂任务）

**触发条件**: 多条知识描述的是"需要多步骤、多工具的复杂流程"

```
示例：
- 知识1: "调试时，先检查日志"
- 知识2: "调试时，隔离失败组件"
- 知识3: "调试时，创建最小复现"
- 知识4: "调试时，用测试验证修复"

→ 演化为: debugger Agent
```

**特征**:

- 描述的是多步骤流程
- 需要多种工具配合
- 适合在独立上下文中执行

---

## 演化判定矩阵

| 知识特征           | 演化类型  | 理由               |
| ------------------ | --------- | ------------------ |
| 用户明确请求触发   | Command   | 需要用户意图驱动   |
| 代码编写时自动应用 | Skill     | 持续生效的背景知识 |
| 复杂多步骤流程     | Agent     | 需要隔离和深度处理 |
| 简单的单条规则     | Hook      | 用于自动检查       |
| 架构级别的约束     | CLAUDE.md | 宪法级别规则       |

---

## 工作流程

```
1. 知识收集
   ├─ 读取 memory-bank/*.md
   ├─ 读取 rules/*.md 中的规则
   ├─ 读取 /cc-best:learn --status 的内容
   └─ 统计每条知识的置信度和使用频率

2. 聚类分析
   ├─ 按领域分组（testing, git, api, style...）
   ├─ 按触发模式分组
   ├─ 按行为类型分组
   └─ 识别 3+ 条相关知识的聚类

3. 演化判定
   ├─ 分析聚类的特征
   ├─ 确定演化类型（Command/Skill/Agent）
   ├─ 计算演化置信度
   └─ 生成演化建议

4. 文件生成
   ├─ 生成 commands/*.md（Command）
   ├─ 生成 skills/*/SKILL.md（Skill）
   ├─ 生成 agents/*.md（Agent）
   └─ 标记源知识为"已演化"

5. 关联更新
   ├─ 更新 COMMANDS.md
   ├─ 更新 skills/README
   ├─ 更新 agents/README
   └─ 更新 CHANGELOG.md
```

---

## 输出格式

### 演化分析报告

```
🧬 演化分析报告
==================

发现 3 个可演化的知识聚类:

## 聚类 1: 数据库迁移工作流
源知识: create-migration, update-schema, regenerate-types
类型: Command
置信度: ████████░░ 85%

将生成: /new-table 命令
文件: commands/new-table.md

## 聚类 2: 函数式编码风格
源知识: prefer-functional, use-immutable, avoid-classes, pure-functions
类型: Skill
置信度: ██████████ 78%

将生成: functional-style Skill
文件: skills/functional-style/SKILL.md

## 聚类 3: 系统性调试流程
源知识: debug-check-logs, debug-isolate, debug-reproduce, debug-verify
类型: Agent
置信度: ████████░░ 72%

将生成: debugger Agent
文件: agents/debugger.md

---
运行 `/cc-best:evolve --execute` 生成以上文件
运行 `/cc-best:evolve --dry-run` 预览生成内容
```

---

## 生成的文件格式

### Command 格式

````markdown
---
allowed-tools: [根据知识内容推断]
evolved-from:
  - create-migration
  - update-schema
  - regenerate-types
---

# /new-table - 创建数据库表

[根据源知识生成的描述]

## 用法

```bash
/new-table <表名>
```
````

## 工作流程

1. [从 create-migration 知识提取]
2. [从 update-schema 知识提取]
3. [从 regenerate-types 知识提取]

````

### Skill 格式

```markdown
---
name: functional-style
description: 函数式编码风格指南
evolved-from:
  - prefer-functional
  - use-immutable
  - avoid-classes
  - pure-functions
---

# 函数式编码风格

## 核心原则

[根据源知识生成]

## 具体规范

### 优先使用函数式风格
[从 prefer-functional 知识提取]

### 使用不可变模式
[从 use-immutable 知识提取]
````

### Agent 格式

```markdown
---
model: sonnet
tools: [Read, Grep, Glob, Bash]
evolved-from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
  - debug-verify
---

# Debugger Agent

系统性调试代理，按照验证过的流程排查问题。

## 工作流程

1. **检查日志** [从 debug-check-logs 提取]
2. **隔离组件** [从 debug-isolate 提取]
3. **创建复现** [从 debug-reproduce 提取]
4. **验证修复** [从 debug-verify 提取]
```

---

## 参数说明

| 参数                   | 说明               | 默认值 |
| ---------------------- | ------------------ | ------ |
| `--execute`            | 执行演化，生成文件 | false  |
| `--dry-run`            | 预览不执行         | false  |
| `--domain <name>`      | 限定分析领域       | 全部   |
| `--threshold <n>`      | 聚类最小知识数     | 3      |
| `--type <type>`        | 仅生成指定类型     | 全部   |
| `--min-confidence <n>` | 最低演化置信度     | 0.6    |

---

## 与其他命令的配合

```
知识积累循环:
/cc-best:learn → 积累知识 → /cc-best:evolve → 生成能力 → 更高效的工作

代码库分析后:
/cc-best:analyze → 提取模式 → /cc-best:evolve → 生成项目专属 skills

团队知识共享:
/cc-best:learn --export → 分享 → /cc-best:learn --import → /cc-best:evolve → 统一团队能力
```

---

## 演化追溯

生成的文件会记录 `evolved-from` 字段，用于：

1. **追溯来源**: 了解能力的知识基础
2. **更新联动**: 源知识更新时，提示检查演化产物
3. **置信度继承**: 演化产物的置信度基于源知识

---

## 注意事项

### 演化条件

- 至少 3 条相关知识才会触发聚类
- 聚类置信度 ≥ 60% 才会生成建议
- 源知识的平均置信度 ≥ 50%

### 避免过度抽象

- 不是所有聚类都应该演化
- 简单规则保持为规则即可
- 复杂不等于需要抽象

### 人工审核

- 演化建议需要人工确认
- 生成的文件可能需要调整
- 关注生成内容的实用性

---

> **记住**：演化的目的是让知识更易用，而不是创造更多文件。只有当抽象能显著提升效率时，才值得演化。
