---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---

# /learn - 会话学习

从当前会话中提取可复用的知识，更新项目配置和文档。**核心原则：从经验中学习，持续改进。**

## 角色定位
- **身份**: 知识萃取专家
- **目标**: 将会话中的经验转化为项目记忆
- **原则**: 只记录有价值的、可复用的知识

## 核心理念

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

## 工作流程

```
1. 会话分析
   ├─ 回顾当前会话的关键交互
   ├─ 识别有价值的知识点
   └─ 分类：模式/约定/偏好/陷阱

2. 知识萃取
   ├─ 提炼核心要点
   ├─ 确定适用范围
   └─ 编写简洁描述

3. 知识存储
   ├─ 更新 CLAUDE.md（核心规则）
   ├─ 更新 rules/（具体规范）
   ├─ 更新 memory-bank/（项目记忆）
   └─ 创建 hookify 规则（如需自动化）

4. 验证确认
   ├─ 检查不重复
   ├─ 检查不冲突
   └─ 确认位置正确
```

## 知识分类与存储位置

### 分类矩阵

| 知识类型 | 存储位置 | 示例 |
|----------|----------|------|
| 核心规则 | CLAUDE.md | "禁止直接修改数据库" |
| 编码规范 | rules/*.md | "变量命名使用小驼峰" |
| 项目架构 | memory-bank/architecture.md | "API 层不直接访问 DB" |
| 技术选型 | memory-bank/tech-stack.md | "使用 Pinia 而非 Vuex" |
| 当前进度 | memory-bank/progress.md | "认证模块开发中" |
| 自动检查 | .claude/hookify.*.local.md | "检测 console.log" |

### 存储位置详解

#### CLAUDE.md（宪法级别）
```markdown
## 核心约束

- **约束1** - 永远不要直接操作生产数据库
- **约束2** - API 密钥必须从环境变量读取
```

#### rules/*.md（规范级别）
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

## 学习模板

### 模式学习
```markdown
## 学到的模式：[模式名称]

**场景**: [什么情况下使用]
**做法**: [具体怎么做]
**原因**: [为什么这样做]
**示例**:
```code
// 代码示例
```
```

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
- ✅ `apiClient.get('/users')`
- ❌ `fetch('/api/users')`
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

## 触发时机

### 自动触发建议
- 会话结束前
- 解决复杂问题后
- 用户纠正错误后
- 发现新的项目规范后

### 手动触发
- 用户输入 `/learn`
- 用户说"记住这个"
- 用户说"以后都这样做"

## 学习检查清单

### 提取知识前
- [ ] 这个知识是项目特有的吗？
- [ ] 这个知识是可复用的吗？
- [ ] 这个知识足够重要吗？

### 存储知识前
- [ ] 选择了正确的存储位置？
- [ ] 描述是否清晰简洁？
- [ ] 是否与现有知识冲突？
- [ ] 是否已经存在类似记录？

### 存储知识后
- [ ] 格式是否正确？
- [ ] 是否需要创建 hookify 规则自动化检查？

## 输出格式

学习完成后，输出：

```markdown
## 会话学习报告

**学习日期**: YYYY-MM-DD
**会话主题**: [简要描述]

### 学到的知识

| 类型 | 知识点 | 存储位置 |
|------|--------|----------|
| 模式 | API 调用必须经过 apiClient | rules/api-style.md |
| 陷阱 | config.ts 是自动生成的 | CLAUDE.md |
| 偏好 | 类型定义放 types/ 目录 | rules/typescript-style.md |

### 更新的文件

1. `rules/api-style.md` - 新增 API 调用规范
2. `CLAUDE.md` - 新增禁止操作项
3. `.claude/hookify.config-warning.local.md` - 新增自动检测规则

### 建议

- 考虑为 apiClient 规范创建 hookify 规则
- 建议整理项目的完整命名规范
```

## 与其他命令的配合

```
日常开发循环:
/dev → /qa → /commit → /learn（可选）→ /clear

复杂任务后:
完成任务 → /learn（总结经验）→ /compact 或 /clear
```

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
