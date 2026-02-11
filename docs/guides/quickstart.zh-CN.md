# 快速上手指南

> 5 分钟掌握 CC-Best。

## 1. 安装（30 秒）

```bash
# 添加 marketplace 并安装
/plugin marketplace add xiaobei930/claude-code-best-practices
/plugin install cc-best@xiaobei930

# 验证安装
/cc-best:status
```

你应该会看到所有已安装组件的摘要（38 命令、17 技能、8 智能体、33 规则）。

## 2. 第一次 Iterate（2 分钟）

```bash
/cc-best:iterate "添加一个带邮箱和密码的登录页面"
```

### 接下来会发生什么？

Claude 自动运行完整的开发管线：

```
1. 📋 /cc-best:pm       → 分析需求，创建 REQ-001
2. 🔍 /cc-best:clarify  → 澄清模糊点（如有需要）
3. 🏗️ /cc-best:lead     → 设计技术方案，创建 DES-001 + TSK-001
4. 🎨 /cc-best:designer → 生成 UI 指导（仅前端任务）
5. 💻 /cc-best:dev      → 编写代码，运行自测
6. ✅ /cc-best:verify   → 构建 + 类型检查 + lint + 测试 + 安全扫描
7. 🧪 /cc-best:qa       → 功能验收测试
8. 📦 /cc-best:commit   → 创建规范提交
```

**你只需要看着。** 必要时介入（Ctrl+C 暂停）。

### Iterate 如何选择角色

迭代引擎读取 `memory-bank/progress.md` 并选择合适的角色：

| 当前状态           | 选择角色            | 执行动作     |
| ------------------ | ------------------- | ------------ |
| 无需求文档         | `/cc-best:pm`       | 需求分析     |
| REQ 有低置信度项   | `/cc-best:clarify`  | 需求澄清     |
| 有 REQ，无设计     | `/cc-best:lead`     | 技术方案设计 |
| 有设计，含前端任务 | `/cc-best:designer` | UI 设计指导  |
| 有待实现任务       | `/cc-best:dev`      | 编码实现     |
| 代码待验证         | `/cc-best:verify`   | 综合验证     |
| 验证通过           | `/cc-best:qa`       | 功能验收     |

### 何时介入

- **Ctrl+C**：立即暂停。进度已保存到 `memory-bank/progress.md`。
- **输入任何内容**：Claude 暂停并等待你的输入。
- **恢复**：继续对话即可 — Claude 会从中断处继续。

### 停止条件

Iterate **仅在**以下情况停止：

1. 所有任务已完成
2. 你主动中断（Ctrl+C 或 Escape）
3. 发生无法自动解决的致命错误
4. 需要你决策的外部依赖

## 3. 理解角色管线

每个角色有清晰的职责边界：

```
PM（做什么）
 └→ Lead（怎么做）
     └→ Designer（长什么样 — 仅前端）
         └→ Dev（写代码）
             └→ QA（验证能用）
                 └→ Verify + Commit（发布）
```

### 角色边界

每个角色遵循 **MUST/SHOULD/NEVER** 规则：

| 角色 | 必须做                     | 禁止做                   |
| ---- | -------------------------- | ------------------------ |
| PM   | 自主分析需求               | 猜测 API、跳过上下文阅读 |
| Lead | 评审 PM 决策，创建设计文档 | 直接写代码、跳过任务分解 |
| Dev  | 按技术设计实现，自测       | 修改未分配的模块         |
| QA   | 测试所有验收标准           | 修改源代码               |

### 文档追溯链

角色创建带编号的文档，相互关联：

```
REQ-001（PM 创建）
 └→ DES-001（Lead 创建，引用 REQ-001）
     └→ TSK-001, TSK-002（Lead 创建，引用 DES-001）
```

### 下游纠偏（A3）

- **Lead 评审 PM**：可调整需求优先级或范围
- **QA 区分 Bug 类型**：实现 Bug → 退回 Dev 修复；需求假设错误 → 标记给 PM 评审

## 4. 尝试结对编程

当你需要逐步协作而非完全自主时：

```bash
/cc-best:pair "帮我重构这个认证模块"
```

### iterate vs pair

| 维度     | `/cc-best:iterate` | `/cc-best:pair` |
| -------- | ------------------ | --------------- |
| 控制方式 | 完全自主           | 每步确认        |
| 适用场景 | 明确任务、批量工作 | 学习、敏感操作  |
| 风险等级 | 中（事后检查）     | 低（事前确认）  |

### 5 个确认节点

在结对模式中，Claude **必定**在以下操作前询问：

1. **需求理解** — "我理解你需要 X，对吗？"
2. **方案选择** — "方案 A/B？我建议 A，因为..."
3. **破坏性操作** — "即将删除 X，确认吗？"
4. **外部调用** — "即将调用生产 API，确认吗？"
5. **提交代码** — "提交信息：'...'，确认吗？"

### 学习模式

```bash
/cc-best:pair --learn "教我怎么写单元测试"
```

Claude 调整行为：

- 每步之前解释**为什么**
- 展示中间结果
- 解释错误和调试过程
- 鼓励你提问

## 5. 十大常用命令

| 命令                  | 功能                       |
| --------------------- | -------------------------- |
| `/cc-best:iterate`    | 自主完整管线开发           |
| `/cc-best:pair`       | 逐步协作开发               |
| `/cc-best:pm`         | 分析需求，创建 REQ 文档    |
| `/cc-best:lead`       | 设计技术方案，创建 DES/TSK |
| `/cc-best:dev`        | 按技术设计编写代码         |
| `/cc-best:qa`         | 测试验证实现               |
| `/cc-best:commit`     | 创建规范提交               |
| `/cc-best:status`     | 检查插件安装状态           |
| `/cc-best:checkpoint` | 保存当前上下文以便后续恢复 |
| `/cc-best:catchup`    | 从上次会话恢复上下文       |

## 6. 项目配置

### 最小 CLAUDE.md 模板

`CLAUDE.md` 应定义项目专属约束，控制在 100 行以内：

```markdown
# 项目名称

## 核心约束

- **语言**: TypeScript + React
- **测试**: Vitest，覆盖率 > 80%
- **API**: REST，OpenAPI 规范在 docs/api/

## 当前状态

详见 `memory-bank/progress.md`

## 禁止操作

- 不使用 `any` 类型
- 不提交 .env 文件
```

### 初始化记忆库

```bash
# 插件用户：首次会话自动初始化
# Clone 用户：运行初始化脚本
bash scripts/shell/init.sh
```

这会创建：

- `memory-bank/progress.md` — 滚动任务追踪器
- `memory-bank/architecture.md` — 系统设计决策
- `memory-bank/tech-stack.md` — 技术选型

### 跨会话恢复

```bash
# 结束会话前 — 保存上下文
/cc-best:checkpoint

# 开始新会话 — 恢复上下文
/cc-best:catchup

# 上下文过长 — 压缩
/cc-best:compact-context
```

## 7. 常见问题速答

**如何停止 iterate？**
按 Ctrl+C。进度自动保存到 `memory-bank/progress.md`。恢复时继续对话或运行 `/cc-best:catchup`。

**QA 失败怎么办？**
Claude 自动退回 Dev 修复（最多 3 次）。之后会请求你的输入。

**如何自定义规则？**
在 `rules/` 中添加 `.md` 文件，用 `paths` frontmatter 限定作用范围：

```markdown
---
paths:
  - "**/*.py"
---

# 你的 Python 规则
```

**可以只用部分角色吗？**
可以。直接运行单个角色命令：`/cc-best:dev "修复这个 bug"` 会跳过 PM/Lead。

**如何添加新语言支持？**
在 `rules/` 下创建新目录（如 `rules/rust/`），添加 style、testing、security、performance 规则文件。

---

> **下一步**：阅读[深度指南](advanced.zh-CN.md)，深入了解方法论、决策原则和知识管线。
