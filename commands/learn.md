---
description: 会话学习，从会话中提取可复用模式
argument-hint: "[--status|--export|--import file]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---

# /learn - 会话学习

从当前会话中提取可复用的知识，更新项目配置和文档。**核心原则：从经验中学习，持续改进。**

## 用法

```bash
/cc-best:learn                    # 从当前会话提取知识
/cc-best:learn --status           # 查看已学习内容和置信度
/cc-best:learn --export           # 导出学习内容（用于分享）
/cc-best:learn --import <file>    # 导入他人的学习内容
```

## 角色定位

- **身份**: 知识萃取专家
- **目标**: 将会话中的经验转化为项目记忆
- **原则**: 只记录有价值的、可复用的知识

## 核心理念

> 📋 详细学习理念（学习什么/不学习什么）、知识分类矩阵、学习模板、常见场景参见预加载的 `skills/learning/extraction-guide.md`

## 工作流程

```
0. 观察数据预加载
   ├─ 读取 memory-bank/observations.jsonl（如存在）
   ├─ 按 pattern 分组：error_fix / repeated_search / multi_file_edit / test_after_edit
   ├─ 筛选 confidence ≥ 0.3 且当前会话的观察
   └─ 作为会话分析的补充输入（自动捕获 + 人工回顾 = 完整画面）

1. 会话分析
   ├─ 回顾当前会话的关键交互
   ├─ 结合 Step 0 的自动观察数据
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

## 触发时机

### 自动触发建议

- 会话结束前
- 解决复杂问题后
- 用户纠正错误后
- 发现新的项目规范后

### 手动触发

- 用户输入 `/cc-best:learn`
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

## 置信度系统

> 📋 详细置信度等级定义和提升规则参见预加载的 `skills/learning/extraction-guide.md`

## --status / --export / --import

> 📋 详细输出格式、YAML 导出模板、导入冲突解决流程参见预加载的 `skills/learning/extraction-guide.md`

---

## 输出规范

遵循 `rules/output-style.md`，核心信息 ≤ 5 行。

### 简洁输出（默认）

```markdown
✅ 会话学习完成

📊 学习成果:

- 新知识: N 条
- 高置信度: M 条
- 已存储: K 个文件

➡️ 下一步: 使用 `/cc-best:learn --status` 查看详情
```

### 详细报告（/cc-best:learn --verbose）

````markdown
## 会话学习报告

**学习日期**: YYYY-MM-DD
**会话主题**: [简要描述]

### 观察与直觉（带置信度）

#### 观察 1 [置信度: 高 92%]

> **上下文**: 在实现 API 调用时，用户明确指示使用 apiClient
>
> **触发**: 调用 API 时
> **行为**: 使用 `apiClient` 而非 `fetch`
> **来源**: 用户明确指示

### 原子直觉（结构化）

```yaml
learnings:
  - id: api-client-required
    domain: coding-style
    trigger: "调用 API 时"
    action: "使用 apiClient 而非 fetch"
    confidence: 0.92
    source: user-instruction
    updated: "YYYY-MM-DD"
```
````

### 建议动作

| 类型 | 动作              | 目标位置               | 优先级 |
| ---- | ----------------- | ---------------------- | ------ |
| 规则 | 添加 API 调用规范 | `rules/api-style.md`   | 高     |
| 约束 | 添加禁止操作项    | `CLAUDE.md`            | 高     |
| 技能 | 可演化为新技能    | `/cc-best:evolve`      | 中     |
| 钩子 | 创建自动检测规则  | `.claude/hookify.*.md` | 低     |

### 更新的文件

1. `rules/api-style.md` - 新增 API 调用规范
2. `CLAUDE.md` - 新增禁止操作项
3. `.claude/hookify.config-warning.local.md` - 新增自动检测规则

### 后续建议

- 考虑为 apiClient 规范创建 hookify 规则
- 建议整理项目的完整命名规范
- 使用 `/cc-best:learn --export` 分享给团队成员

## 与其他命令的配合

```
日常开发循环:
/cc-best:dev → /cc-best:qa → /cc-best:commit → /learn（可选）→ /clear

复杂任务后:
完成任务 → /learn（总结经验）→ /cc-best:compact-context 或 /clear
```

## 注意事项

> 📋 详细注意事项（不要过度学习、保持知识库整洁、隐私和安全）参见预加载的 `skills/learning/extraction-guide.md`

---

> **记住**：学习的目的是让未来的工作更高效，而不是记录每一个细节。质量胜过数量。
