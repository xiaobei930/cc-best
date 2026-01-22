# Spec-Kit 设计分析与借鉴

基于 GitHub Spec-Kit 的分析，提取可借鉴的设计精华。

---

## Spec-Kit 核心理念

> **Spec-Driven Development（规范驱动开发）**：先写规范，再写代码

```
Constitution → Specify → Clarify → Plan → Tasks → Implement
   (原则)      (规范)    (澄清)   (计划)  (任务)   (实现)
```

---

## 设计精华对比

### 1. Constitution（宪法/原则）

**Spec-Kit 做法**：
- 项目有一个 `constitution.md` 定义核心原则
- 所有决策必须符合宪法
- 版本化管理，修订需要记录
- 每次 Plan/Task 都会检查宪法合规性

**我们的模板**：
- `CLAUDE.md` 定义核心约束
- `methodology.md` 定义开发哲学
- 分散在多个文件中

**可借鉴**：
- ✅ 统一的"项目宪法"概念
- ✅ 版本化原则管理
- ✅ 合规性检查机制

---

### 2. Handoffs（交接机制）

**Spec-Kit 做法**：
```yaml
---
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
---
```

每个命令都定义了"下一步可以做什么"，提供明确的交接。

**我们的模板**：
- 在文档末尾写"调用 /dev"
- 但不是结构化的交接

**可借鉴**：
- ✅ 结构化的 handoffs 定义
- ✅ 每个命令知道下一步选项
- ✅ 带上下文的交接（send: true）

---

### 3. Checklist 作为"需求的单元测试"

**Spec-Kit 核心概念**：
> Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** - they validate the quality of requirements, NOT the implementation.

**示例对比**：
| ❌ 错误（测试实现）| ✅ 正确（测试需求质量）|
|------------------|----------------------|
| "Verify button clicks correctly" | "Are click handler requirements defined for all buttons?" |
| "Test error handling works" | "Are error handling requirements specified for all failure modes?" |
| "Confirm API returns 200" | "Are success response formats documented in requirements?" |

**Checklist 质量维度**：
- **Completeness（完整性）**: 是否所有必要需求都有？
- **Clarity（清晰度）**: 需求是否明确无歧义？
- **Consistency（一致性）**: 需求之间是否一致？
- **Measurability（可测量性）**: 是否可客观验证？
- **Coverage（覆盖度）**: 是否覆盖所有场景/边界？

**我们的模板**：
- `/qa` 偏向测试实现
- 没有"需求质量检查"概念

**可借鉴**：
- ✅ 在 `/pm` 阶段增加需求质量自检
- ✅ 引入 Checklist 作为需求门禁
- ✅ 区分"测试需求"和"测试代码"

---

### 4. User Story 优先级与独立可测

**Spec-Kit 做法**：
```markdown
### User Story 1 - [Title] (Priority: P1)
**Why this priority**: [价值说明]
**Independent Test**: [如何独立测试]
**Acceptance Scenarios**: Given/When/Then
```

关键点：
- P1, P2, P3... 优先级排列
- 每个 User Story **独立可测试**
- 可以单独实现和交付（MVP 思维）

**我们的模板**：
- 有验收标准，但没有强制独立性
- 没有明确的优先级体系

**可借鉴**：
- ✅ REQ 文档增加 User Story 优先级
- ✅ 每个 Story 必须独立可测
- ✅ MVP 思维：P1 就是最小可行产品

---

### 5. NEEDS CLARIFICATION 机制

**Spec-Kit 做法**：
```markdown
- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified]
```

规则：
- 最多 3 个 `[NEEDS CLARIFICATION]` 标记
- 按影响优先级：scope > security > UX > technical
- 其他不确定的用合理默认值
- 必须在 Clarify 阶段解决

**我们的模板**：
- 有"置信度"概念（高/中/低）
- 但没有限制数量

**可借鉴**：
- ✅ 限制澄清项数量（最多 3 个）
- ✅ 强制澄清后才能继续

---

### 6. 质量门禁

**Spec-Kit 做法**：
- Implement 前检查所有 Checklist
- 有未完成项必须确认才能继续
- 状态表格可视化

**我们的模板**：
- `/checkpoint` 有验证，但不强制
- 可以跳过检查

**可借鉴**：
- ✅ 强制门禁检查
- ✅ 状态可视化表格

---

## 流程对比

| 阶段 | Spec-Kit | 我们的模板 | 差异 |
|------|----------|-----------|------|
| 原则定义 | `/constitution` | CLAUDE.md | spec-kit 更版本化 |
| 需求规范 | `/specify` | `/pm` (REQ) | spec-kit 有质量检查 |
| 需求澄清 | `/clarify` | 无 | **缺失** |
| 技术计划 | `/plan` | `/lead` (DES) | 类似 |
| 任务分解 | `/tasks` | `/lead` (TSK) | spec-kit 按 Story 组织 |
| 质量检查 | `/checklist` | 无 | **缺失** |
| 实现 | `/implement` | `/dev` | 类似 |
| 分析 | `/analyze` | `/qa` | spec-kit 检查一致性 |

---

## 建议改进项

### 高优先级

1. **增加 `/clarify` 命令**
   - 在 `/pm` 和 `/lead` 之间
   - 限制最多 3 个澄清项
   - 必须解决后才能继续

2. **User Story 优先级体系**
   - REQ 文档增加 P1/P2/P3 优先级
   - 每个 Story 必须独立可测试
   - P1 = MVP

3. **需求质量 Checklist**
   - 在 `/pm` 输出前自检
   - 检查完整性、清晰度、一致性
   - 不是测试代码，是测试需求

### 中优先级

4. **Constitution 版本化**
   - CLAUDE.md 增加版本号
   - 修改需记录变更原因

5. **Handoffs 结构化**
   - 每个命令的 YAML 头部定义 handoffs
   - 明确下一步选项

6. **门禁可视化**
   - `/checkpoint` 输出状态表格
   - 强制确认才能继续

### 低优先级

7. **分析命令 `/analyze`**
   - 检查需求-设计-任务一致性
   - 发现冲突和遗漏

---

## 可立即采用的改进

### 1. REQ 文档模板改进

```markdown
# REQ-XXX: [需求名称]

## User Stories（按优先级排列）

### US-1: [标题] (P1 - MVP)
**价值**: [为什么是 P1]
**独立测试**: [如何独立验证]
**验收场景**:
- Given [前置], When [动作], Then [结果]

### US-2: [标题] (P2)
...

## 需求质量自检
- [ ] 每个 Story 独立可测试？
- [ ] 无歧义的验收标准？
- [ ] 最多 3 个待澄清项？
- [ ] 覆盖边界情况？
```

### 2. 澄清项格式

```markdown
## 待澄清项（最多 3 个）

| # | 问题 | 上下文 | 影响 | 建议答案 |
|---|------|--------|------|----------|
| Q1 | 认证方式？ | FR-006 | 范围 | A: JWT / B: OAuth / C: 其他 |
| Q2 | 数据保留期？ | FR-007 | 合规 | A: 30天 / B: 1年 / C: 永久 |
```

### 3. 需求质量 Checklist

```markdown
## 需求质量检查

### 完整性
- [ ] 所有功能需求都有验收标准？
- [ ] 边界情况已识别？
- [ ] 错误处理已定义？

### 清晰度
- [ ] 无歧义的术语？（无"快速"/"大量"等模糊词）
- [ ] 可测量的成功标准？

### 一致性
- [ ] 需求之间无冲突？
- [ ] 与项目原则一致？
```

---

## 参考资源

- [GitHub Spec-Kit](https://github.com/github/spec-kit)
- [Spec-Driven Development](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
- [Spec-Kit + Claude Code 讨论](https://github.com/github/spec-kit/discussions/991)
