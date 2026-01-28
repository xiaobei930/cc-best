---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, Task, WebSearch, WebFetch, Skill, mcp__*
---

# /cc-ralph - CC-Best Ralph Loop 集成

使用 cc-best 工作流启动 Ralph Loop 自主开发循环。

**同时支持插件用户和 Clone 用户。**

---

## 与官方 ralph-loop 的关系

```
┌─────────────────────────────────────────────────────────────┐
│  /cc-ralph (cc-best 插件)                                    │
│  ├── 读取项目状态 (progress.md, CLAUDE.md)                   │
│  ├── 生成 cc-best 工作流 Prompt                              │
│  │   (角色切换、迭代步骤、完成标准)                           │
│  └── 调用 ↓                                                  │
├─────────────────────────────────────────────────────────────┤
│  /ralph-loop:ralph-loop (官方插件)                           │
│  ├── 提供循环机制 (Stop hook)                                │
│  ├── 管理迭代次数                                            │
│  └── 检测完成信号 (<promise>)                                │
└─────────────────────────────────────────────────────────────┘
```

**简单理解**：

- **ralph-loop**：官方插件，提供"循环"能力（让 Claude 持续工作直到完成）
- **cc-ralph**：cc-best 的包装命令，提供"工作流"（告诉 Claude 按什么流程工作）

**为什么需要 cc-ralph？**
直接用 `/ralph-loop:ralph-loop "任务描述"` 时，需要手动编写完整的 prompt。
而 `/cc-ralph` 自动：

1. 读取项目当前状态
2. 注入 cc-best 的角色工作流（PM→Lead→Designer→Dev→QA）
3. 添加完成标准和卡住处理逻辑

---

## 前置条件

需要安装 `ralph-loop` 官方插件：

```bash
/plugin install ralph-loop@claude-plugins-official
```

> ⚠️ **Windows 用户注意**：
>
> ralph-loop 插件的 setup 脚本是 bash 脚本，在 Windows 原生环境可能报错：
>
> ```
> Error: Bash command failed for pattern "...setup-ralph-loop.sh"
> ```
>
> **解决方案**：
>
> 1. **推荐**：使用 WSL (Windows Subsystem for Linux)
> 2. **替代**：使用 Git Bash 运行 Claude Code
> 3. **替代**：直接使用 `/iterate`（单会话版本，无需 ralph-loop）
>
> ralph-loop 插件还依赖 `jq` 工具，需提前安装。

---

## 使用方式

### 基本用法

```bash
# 自动读取 progress.md，继续当前任务
/cc-ralph

# 指定任务描述
/cc-ralph "实现用户登录功能"

# 指定最大迭代次数
/cc-ralph "完成 Phase 2" --max-iterations 20
```

### 选择模式

```bash
# 完整功能开发（默认）
/cc-ralph --mode full-feature "实现用户认证"

# Phase 迭代（按 progress.md 推进）
/cc-ralph --mode iterate

# Bug 修复
/cc-ralph --mode bug-fix "修复登录超时问题"

# 代码重构
/cc-ralph --mode refactor "重构认证模块"

# 修复测试
/cc-ralph --mode fix-tests

# 文档生成
/cc-ralph --mode doc-gen "生成 API 文档"
```

### 复制模板到本地（可选）

```bash
# 将模板复制到 .claude/ralph-prompts/（方便自定义）
/cc-ralph --setup
```

---

## 执行流程

### 1. 检查环境

- 验证 ralph-loop 插件是否已安装
- 未安装则提示安装命令并退出

### 2. 归档历史记录（重要）

启动前先运行归档脚本，防止 progress.md 过大：

```bash
node scripts/node/archive-progress.js memory-bank
```

归档策略（滚动窗口）：

- **最近完成**: 保留 5 项，其余移到 progress-archive.md
- **最近决策**: 保留 5 条
- **最近检查点**: 保留 5 个

### 3. 检测用户类型

```
如果存在 .claude/ralph-prompts/ 目录：
  → Clone 用户，使用本地模板
否则：
  → 插件用户，使用内嵌工作流
```

### 4. 读取项目上下文

- `memory-bank/progress.md` - 当前进度和待办任务
- `CLAUDE.md` - 核心约束和原则

### 5. 生成 Prompt

根据 `--mode` 参数选择对应的工作流：

| Mode           | 描述                                | 完成信号            |
| -------------- | ----------------------------------- | ------------------- |
| `full-feature` | 完整功能开发（需求→设计→开发→测试） | `FEATURE_COMPLETE`  |
| `iterate`      | Phase 迭代，按 progress.md 推进     | `PHASE_COMPLETE`    |
| `bug-fix`      | 定位并修复 Bug                      | `BUG_FIXED`         |
| `refactor`     | 改善代码质量                        | `REFACTOR_COMPLETE` |
| `fix-tests`    | 让测试通过                          | `TESTS_PASSING`     |
| `doc-gen`      | 生成/更新文档                       | `DOCS_COMPLETE`     |

### 6. 启动 Ralph Loop

调用 `/ralph-loop:ralph-loop` 命令，传入生成的 prompt。

---

## 核心工作流（内嵌）

当没有本地模板时，使用以下内嵌工作流：

### 角色选择规则

| 当前状态             | 选择角色    | 动作                                 |
| -------------------- | ----------- | ------------------------------------ |
| 无需求文档           | `/pm`       | 需求分析，创建 REQ-XXX               |
| REQ 有待澄清项       | `/clarify`  | 需求澄清                             |
| 有需求无设计         | `/lead`     | 技术设计，创建 DES-XXX               |
| 有设计，前端任务     | `/designer` | UI 设计指导                          |
| 有任务待开发         | `/dev`      | 编码实现                             |
| 有代码待验证         | `/verify`   | 综合验证（构建+类型+Lint+测试+安全） |
| 验证通过，待功能验收 | `/qa`       | 功能验收                             |
| QA 发现 Bug          | `/dev`      | 修复后重新 `/verify`                 |

### 每次迭代步骤

1. **读取上下文** - progress.md + CLAUDE.md
2. **确定角色和任务** - 根据状态选择角色
3. **执行任务** - 按角色职责执行
4. **验证结果** - `/test` + `/build`
5. **提交和更新** - `/commit` + 更新 progress.md
6. **检查归档** - 如果 progress.md 超过限制，自动归档
7. **继续下一任务** - 不等待用户

### 关键规则（来自 CLAUDE.md）

1. **P1 接口处理** - 调用前必须查阅文档，**禁止猜测**
2. **P3 业务理解** - 必须来源于明确需求，**禁止假设**
3. **A1 上下文推断** - 基于项目上下文推断，**不中断询问用户**
4. **A2 决策记录** - 记录依据和置信度

### 卡住时的处理

如果连续 3 次迭代没有进展：

1. 在 progress.md 记录阻塞原因
2. 列出已尝试的方案
3. 输出 `<promise>BLOCKED</promise>` 等待人工介入

---

## --setup 功能

当使用 `--setup` 参数时：

1. **检查目标目录**
   - 如果 `.claude/ralph-prompts/` 已存在，询问是否覆盖

2. **创建模板文件**
   - Clone 用户：提示模板已存在
   - 插件用户：创建以下文件
     - `iterate-phase.md` - Phase 迭代
     - `full-feature.md` - 完整功能开发
     - `bug-fix.md` - Bug 修复
     - `refactor.md` - 代码重构
     - `fix-tests.md` - 修复测试
     - `doc-gen.md` - 文档生成
     - `README` - 使用说明

3. **输出结果**

   ```
   ✅ Ralph Loop 模板配置完成

   已创建模板：
   - .claude/ralph-prompts/iterate-phase.md   (Phase 迭代)
   - .claude/ralph-prompts/full-feature.md    (完整功能开发)
   - .claude/ralph-prompts/bug-fix.md         (Bug 修复)
   - .claude/ralph-prompts/refactor.md        (代码重构)
   - .claude/ralph-prompts/fix-tests.md       (修复测试)
   - .claude/ralph-prompts/doc-gen.md         (文档生成)

   现在可以编辑这些模板，然后使用 /cc-ralph 启动循环
   ```

---

## 与 /iterate 的区别

| 功能     | /iterate        | /cc-ralph          |
| -------- | --------------- | ------------------ |
| 会话边界 | 单会话内        | 跨会话自动重启     |
| 进度保存 | progress.md     | progress.md + 插件 |
| 适用场景 | 短期任务（<2h） | 长期项目（小时级） |
| 中断恢复 | 手动            | 自动               |

---

## 取消循环

```bash
/ralph-loop:cancel-ralph
```

---

## 执行步骤总结

1. **检查 ralph-loop 插件** → 未安装则提示
2. **处理 --setup 参数** → 复制模板并退出
3. **归档历史记录** → 运行 `archive-progress.js` 清理旧数据
4. **检测用户类型** → Clone 或 插件
5. **读取项目状态** → progress.md + CLAUDE.md
6. **确定模式** → 根据 --mode 或自动检测
7. **生成工作流 Prompt** → 本地模板或内嵌工作流
8. **启动 Ralph Loop** → 调用 `/ralph-loop:ralph-loop` 命令
9. **输出启动信息**

   ```
   ✅ CC-Best Ralph Loop 已启动
   - 模式: [full-feature / iterate / bug-fix / ...]
   - 当前 Phase: [Phase 名称]
   - 待办任务: [TSK 数量] 个
   - 使用模板: [本地 / 内嵌]

   使用 /ralph-loop:cancel-ralph 取消循环
   ```
