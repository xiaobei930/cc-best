# 会话学习方法论参考

> 本文件是 `/cc-best:learn` 命令的知识参考。
> 包含核心学习理念、知识分类矩阵、学习模板、常见场景、置信度系统、导出/导入格式。

---

## 核心学习理念

> **好的实践应该被记住，错误应该被避免重复**

### 学习什么

- 项目特有的模式和约定
- 成功解决问题的方法
- 避免的陷阱和反模式
- 用户偏好和习惯
- 技术决策和原因

### 不学习什么

- 一次性的临时方案
- 通用的编程知识
- 与项目无关的信息
- 敏感数据或凭证

---

## 知识分类矩阵

| 知识类型 | 存储位置                    | 示例                   |
| -------- | --------------------------- | ---------------------- |
| 核心规则 | CLAUDE.md                   | "禁止直接修改数据库"   |
| 编码规范 | rules/\*.md                 | "变量命名使用小驼峰"   |
| 项目架构 | memory-bank/architecture.md | "API 层不直接访问 DB"  |
| 技术选型 | memory-bank/tech-stack.md   | "使用 Pinia 而非 Vuex" |
| 当前进度 | memory-bank/progress.md     | "认证模块开发中"       |
| 自动检查 | .claude/hookify.\*.local.md | "检测 console.log"     |

### 存储位置详解

#### CLAUDE.md（宪法级别）

```markdown
## 核心约束

- **约束1** - 永远不要直接操作生产数据库
- **约束2** - API 密钥必须从环境变量读取
```

#### rules/\*.md（规范级别）

```markdown
# 项目命名规范

## 变量命名

- 组件：PascalCase（UserCard.vue）
- composables：camelCase + use 前缀（useAuth.ts）
- 工具函数：camelCase（formatDate.ts）
```

#### memory-bank/（记忆级别）

```markdown
# 技术决策记录

## 2026-01-22: 选择 Pinia 而非 Vuex

**原因**: Pinia 对 TypeScript 支持更好，API 更简洁
**影响**: 所有状态管理使用 Pinia Setup Store 风格
```

#### hookify 规则（自动化级别）

```markdown
---
name: prevent-console-log
enabled: true
event: file
pattern: console\.log\(
---

检测到 console.log！生产代码不应包含调试日志。
请使用 logger 工具或移除此日志。
```

---

## 学习模板

### 模式学习

````markdown
## 学到的模式：[模式名称]

**场景**: [什么情况下使用]
**做法**: [具体怎么做]
**原因**: [为什么这样做]
**示例**:

```code
// 代码示例
```
````

### 陷阱学习

```markdown
## 避免的陷阱：[陷阱名称]

**问题**: [什么问题]
**表现**: [怎么发现的]
**原因**: [为什么会出问题]
**解决**: [正确做法]
```

### 偏好学习

```markdown
## 用户偏好：[偏好名称]

**偏好**: [具体偏好]
**场景**: [适用场景]
**注意**: [注意事项]
```

---

## 常见学习场景

### 场景 1：发现项目特有模式

**会话中**:

```
用户: 这个项目的 API 调用都要经过 apiClient 封装
Claude: 了解，我会使用 apiClient 而不是直接 fetch
```

**学习输出**:

```markdown
# 更新到 rules/api-style.md

## API 调用规范

所有 API 调用必须通过 `src/api/client.ts` 的 apiClient 进行：

- apiClient.get('/users')
- 禁止 fetch('/api/users')
```

### 场景 2：踩坑后的教训

**会话中**:

```
Claude: 我直接修改了 config.ts...
用户: 这个文件是自动生成的，不要直接改
Claude: 抱歉，我应该修改 config.template.ts
```

**学习输出**:

```markdown
# 更新到 CLAUDE.md

## 禁止操作

- **禁止直接修改 config.ts** - 这是自动生成的文件，修改 config.template.ts
```

### 场景 3：用户偏好

**会话中**:

```
用户: 我喜欢把 TypeScript 类型单独放在 types/ 目录
Claude: 好的，我会把类型定义放到 types/ 目录
```

**学习输出**:

```markdown
# 更新到 rules/typescript-style.md

## 类型定义位置

- 公共类型定义放在 `src/types/` 目录
- 组件私有类型可以放在组件文件内
```

### 场景 4：技术决策

**会话中**:

```
用户: 我们决定用 date-fns 而不是 moment
Claude: 了解，date-fns 更轻量且支持 tree-shaking
```

**学习输出**:

```markdown
# 更新到 memory-bank/tech-stack.md

## 日期处理

- **选择**: date-fns
- **原因**: 轻量、支持 tree-shaking、函数式 API
- **禁止**: moment.js（包体积过大）
```

---

## 置信度系统

学习的知识按置信度分级，影响后续应用强度：

```
置信度等级:
████████████ 90%+ (已验证)  - 多次验证，强制应用
██████████░░ 70-89% (高)    - 明确偏好，主动应用
████████░░░░ 50-69% (中)    - 观察所得，建议应用
██████░░░░░░ 30-49% (低)    - 初步学习，谨慎应用
████░░░░░░░░ <30% (待验证) - 单次观察，需确认
```

### 置信度提升规则

| 触发条件       | 置信度变化 |
| -------------- | ---------- |
| 用户明确指示   | +30%       |
| 成功应用一次   | +10%       |
| 跨会话重复出现 | +15%       |
| 用户纠正后学习 | +20%       |
| 与现有规则一致 | +10%       |
| 用户否定/撤销  | -50%       |
| 90 天未使用    | -20%       |

---

## --status 输出格式

`/cc-best:learn --status` 显示所有已学习内容：

```
📊 学习状态报告
==================

## 编码规范 (4 条)

### api-client-required
触发: 调用 API 时
行为: 使用 apiClient 而非 fetch
置信度: ████████████ 92%
来源: 用户明确指示 | 更新: 2026-01-20

### types-in-directory
触发: 创建 TypeScript 类型时
行为: 公共类型放在 src/types/ 目录
置信度: ██████████░░ 75%
来源: 会话观察 | 更新: 2026-01-18

## 项目约束 (2 条)

### no-edit-config
触发: 编辑 config.ts 时
行为: 阻止直接编辑，提示修改 config.template.ts
置信度: ████████████ 95%
来源: 用户纠正 | 更新: 2026-01-22

---
总计: 6 条学习内容
高置信度: 3 条 | 中置信度: 2 条 | 低置信度: 1 条
```

---

## --export 输出格式

`/cc-best:learn --export` 导出为可分享的 YAML 格式：

```yaml
# CC-Best 学习导出
# 导出时间: 2026-01-27
# 项目: my-project
# 版本: 1.0.0

metadata:
  exported_at: "2026-01-27T10:30:00Z"
  project: my-project
  total_items: 6

learnings:
  - id: api-client-required
    domain: coding-style
    trigger: "调用 API 时"
    action: "使用 apiClient 而非 fetch"
    confidence: 0.92
    source: user-instruction
    created: "2026-01-20"
    updated: "2026-01-20"

  - id: types-in-directory
    domain: coding-style
    trigger: "创建 TypeScript 类型时"
    action: "公共类型放在 src/types/ 目录"
    confidence: 0.75
    source: session-observation
    created: "2026-01-18"
    updated: "2026-01-18"

  - id: no-edit-config
    domain: project-constraint
    trigger: "编辑 config.ts 时"
    action: "阻止直接编辑，提示修改 config.template.ts"
    confidence: 0.95
    source: user-correction
    created: "2026-01-22"
    updated: "2026-01-22"
```

---

## --import 工作流

`/cc-best:learn --import <file>` 导入他人的学习内容：

```
1. 读取文件
   ├─ 验证 YAML 格式
   └─ 检查版本兼容性

2. 冲突检测
   ├─ 对比现有学习内容
   ├─ 识别 ID 冲突
   └─ 识别行为冲突

3. 冲突解决
   ├─ 相同 ID + 相同行为 → 合并，取较高置信度
   ├─ 相同 ID + 不同行为 → 询问用户选择
   └─ 不同 ID + 相似行为 → 提示可能重复

4. 导入确认
   ├─ 显示导入预览
   ├─ 用户确认后导入
   └─ 导入的内容置信度 -10%（非本项目验证）
```

### 导入示例

```bash
/cc-best:learn --import team-learnings.yaml
```

输出：

```
📥 导入预览
==================

来源: team-learnings.yaml
项目: frontend-app
条目: 8 条

## 将导入 (5 条)
- prefer-composition-api (置信度 80% → 72%)
- use-pinia-store (置信度 85% → 77%)
- test-utils-pattern (置信度 70% → 63%)
- error-boundary-usage (置信度 75% → 68%)
- api-error-handling (置信度 90% → 81%)

## 冲突需解决 (2 条)
⚠️ types-location
  - 现有: 类型放在 src/types/
  - 导入: 类型放在组件同目录
  → 选择: [保留现有] / [使用导入] / [跳过]

⚠️ naming-convention
  - 现有: 组件用 PascalCase
  - 导入: 组件用 kebab-case
  → 选择: [保留现有] / [使用导入] / [跳过]

## 已存在跳过 (1 条)
- api-client-required (已存在相同规则)

确认导入? [Y/n]
```

---

## 注意事项

### 不要过度学习

- 不是每个细节都需要记录
- 专注于有价值的、可复用的知识
- 避免记录显而易见的通用知识

### 保持知识库整洁

- 定期清理过时的记录
- 合并重复的知识点
- 保持文档结构清晰

### 隐私和安全

- 不记录敏感信息
- 不记录用户个人数据
- 不记录凭证或密钥

---

> **记住**：学习的目的是让未来的工作更高效，而不是记录每一个细节。质量胜过数量。
