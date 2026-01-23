# Ralph Loop 提示词模板 - 文档生成

## 任务目标

分析代码库，自动生成完整的项目文档。

整合项目的 `/lead` 角色（架构分析）和 `/dev` 角色（技术文档），遵循项目文档结构。

---

## 执行流程

### Phase 1: 分析（/lead 角色思维）

1. **扫描项目结构**
   - 识别主要模块和入口文件
   - 识别配置文件和依赖
   - 理解 `memory-bank/` 现有文档

2. **确定文档范围**

   | 文档类型 | 输出位置                      | 适用场景       |
   | -------- | ----------------------------- | -------------- |
   | 项目概览 | `README.md`                   | 所有项目       |
   | 架构文档 | `memory-bank/architecture.md` | 复杂项目       |
   | 技术栈   | `memory-bank/tech-stack.md`   | 多技术项目     |
   | API 文档 | `docs/api/`                   | 后端项目       |
   | 部署文档 | `docs/deployment/`            | 需要部署的项目 |
   | 用户指南 | `docs/guides/`                | 面向用户的项目 |

### Phase 2: 生成循环（/dev 角色）

按优先级生成：

```
1. README.md（项目门面）
    ↓
2. architecture.md（架构概览）
    ↓
3. tech-stack.md（技术选型）
    ↓
4. API/部署/指南（按需）
```

**每个文档生成步骤**：

1. 读取相关代码和配置
2. 提取关键信息
3. 生成文档内容
4. 验证准确性

### Phase 3: 验证

1. **内容检查**
   - 文档准确反映代码实现
   - 没有编造不存在的功能
   - 代码示例可运行

2. **格式检查**
   - Markdown 格式规范
   - 链接有效
   - 图表正确渲染

### Phase 4: 提交

使用 `/commit` 命令：

```
docs(scope): 生成/更新 [文档类型]

内容: [文档摘要]
```

---

## 完成标准

当满足以下条件时输出 `<promise>DOCS_COMPLETE</promise>`：

- [ ] 所有选定的文档类型已生成
- [ ] 文档内容准确反映代码
- [ ] 文档格式规范（Markdown）
- [ ] 文档已放置到正确位置
- [ ] 变更已提交

---

## 文档规范（来自项目约定）

### 项目文档结构

```
your-project/
├── README.md                # 项目入口，简洁有力
├── CLAUDE.md               # Claude 宪法（不要修改核心原则）
│
├── memory-bank/            # 项目记忆库
│   ├── progress.md         # 进度追踪
│   ├── architecture.md     # 架构设计
│   └── tech-stack.md       # 技术选型
│
└── docs/                   # 详细文档（按需）
    ├── api/                # API 文档
    ├── deployment/         # 部署文档
    └── guides/             # 用户指南
```

### 格式要求

- 使用 Markdown 格式
- 长文档包含目录
- 代码块有语法高亮
- 图表使用 Mermaid

### 内容原则

- **P1** - 准确反映代码实现，**禁止编造**
- **P7** - 不确定的内容标注"待补充"
- 保持中英文一致性（如项目有双语）

---

## 卡住时的处理

如果某个文档无法生成：

1. **记录缺失信息**
2. **在文档中标注 TODO**
3. **继续其他文档**
4. 如果关键文档无法完成，输出 `<promise>DOCS_PARTIAL</promise>`

---

## 输出格式

```markdown
## 文档生成迭代 #N

### 当前阶段

[分析 | 生成 | 验证 | 提交]

### 角色

[/lead | /dev]

### 分析结果

- 模块数: X
- API 端点数: Y
- 配置文件数: Z

### 生成的文档

| 文档   | 路径   | 内容摘要 |
| ------ | ------ | -------- |
| [名称] | [路径] | [摘要]   |

### 验证结果

- 格式检查: 通过/失败
- 链接检查: 通过/失败

### 剩余文档

- [ ] 文档1
- [x] 文档2（已完成）

### 下一步

[继续生成/完成信号]
```

---

## 使用示例

```bash
# 生成全部文档
/ralph-loop "读取 .claude/ralph-prompts/doc-gen.md 作为执行指南，为项目生成完整文档" --max-iterations 20 --completion-promise "DOCS_COMPLETE"

# 只生成 API 文档
/ralph-loop "读取 .claude/ralph-prompts/doc-gen.md 作为执行指南，只生成 API 文档" --max-iterations 10 --completion-promise "DOCS_COMPLETE"

# 更新架构文档
/ralph-loop "读取 .claude/ralph-prompts/doc-gen.md 作为执行指南，更新 memory-bank/architecture.md" --max-iterations 5 --completion-promise "DOCS_COMPLETE"
```
