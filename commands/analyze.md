---
description: 代码库分析，从 Git 历史和代码结构提取编码模式
argument-hint: "[--commits N] [--domain name]"
allowed-tools: Bash, Read, Write, Grep, Glob, TodoWrite
---

# /analyze - 代码库分析

分析项目的 Git 历史和代码结构，提取编码模式和团队实践，生成可复用的知识文档。

## 用法

```bash
/cc-best:analyze                    # 分析当前代码库
/cc-best:analyze --commits 100      # 分析最近 100 次提交
/cc-best:analyze --output ./docs    # 指定输出目录
/cc-best:analyze --domain api       # 仅分析特定领域
```

## 角色定位

- **身份**: 代码考古学家
- **目标**: 从历史中发现隐藏的团队智慧
- **原则**: 让沉淀的经验浮出水面

## 核心理念

> **代码库是团队智慧的结晶，Git 历史是团队习惯的日记**

---

## 分析维度

### 1. 提交模式分析

```bash
# 获取提交消息模式
git log --oneline -n 200 | cut -d' ' -f2- | head -50

# 检测提交前缀
git log --oneline -n 200 | grep -oE "^[a-f0-9]+ (feat|fix|chore|docs|test|refactor):" | cut -d' ' -f2 | sort | uniq -c
```

**检测目标**:

- Conventional Commits 使用率
- 提交粒度（大提交 vs 小提交）
- 提交消息语言（中文/英文）

### 2. 文件共变分析

```bash
# 找出经常一起修改的文件
git log --oneline -n 200 --name-only --pretty=format:"" |
  grep -v "^$" | sort | uniq -c | sort -rn | head -20
```

**检测目标**:

- 架构层关联（修改 API 时总是修改 types）
- 测试覆盖习惯（修改源码时是否修改测试）
- 文档同步习惯

### 3. 目录结构分析

```
检测项目架构风格:
├─ 按功能划分 (feature-based)
│  └─ src/features/auth/, src/features/user/
├─ 按层次划分 (layer-based)
│  └─ src/components/, src/services/, src/utils/
└─ 混合模式 (hybrid)
```

### 4. 命名约定分析

```bash
# 检测文件命名风格
find src -name "*.ts" -o -name "*.tsx" | xargs basename -a | sort | uniq

# 检测函数命名风格
grep -rE "^(export )?(async )?function [a-zA-Z]+" src/ --include="*.ts"
```

**检测目标**:

- 文件命名：PascalCase / camelCase / kebab-case
- 函数命名：动词前缀风格
- 常量命名：UPPER_SNAKE_CASE

### 5. 依赖使用分析

```bash
# 检测常用导入
grep -rh "^import" src/ | sort | uniq -c | sort -rn | head -20
```

**检测目标**:

- 首选的工具库（date-fns vs moment）
- 状态管理方案（Pinia vs Vuex vs Redux）
- HTTP 客户端（axios vs fetch）

---

## 工作流程

```
1. 环境检查
   ├─ 确认是 Git 仓库
   ├─ 检查提交数量
   └─ 确定分析范围

2. 数据收集
   ├─ 提取 Git 历史
   ├─ 扫描目录结构
   ├─ 分析代码模式
   └─ 统计使用频率

3. 模式识别
   ├─ 识别提交约定
   ├─ 识别架构模式
   ├─ 识别命名规范
   └─ 识别工作流程

4. 知识生成
   ├─ 生成 SKILL.md（技能文档）
   ├─ 生成规则建议
   └─ 输出置信度评估

5. 整合建议
   ├─ 建议更新 CLAUDE.md
   ├─ 建议创建 rules/*.md
   └─ 建议添加 hooks
```

---

## 输出格式

### 分析报告

```markdown
# 代码库分析报告

**分析日期**: 2026-01-27
**分析范围**: 最近 200 次提交
**代码库**: my-project

---

## 提交约定

| 模式                 | 使用率 | 置信度         |
| -------------------- | ------ | -------------- |
| Conventional Commits | 87%    | ████████░░ 85% |
| 中文提交消息         | 65%    | ██████░░░░ 60% |

**建议**: 统一使用 Conventional Commits，消息使用中文描述

---

## 架构模式

检测到: **按功能划分 (feature-based)**
```

src/
├─ features/
│ ├─ auth/ # 认证功能
│ ├─ user/ # 用户管理
│ └─ order/ # 订单功能
├─ shared/ # 共享组件
└─ utils/ # 工具函数

```

**置信度**: ████████████ 92%

---

## 文件共变模式

| 文件 A | 文件 B | 共变次数 | 建议 |
| ------ | ------ | -------- | ---- |
| `*.controller.ts` | `*.service.ts` | 45 | Controller 依赖 Service |
| `*.ts` | `*.test.ts` | 38 | 良好的测试习惯 |
| `schema.ts` | `types.ts` | 28 | Schema 变更需同步类型 |

---

## 命名规范

| 类型 | 检测到的风格 | 示例 | 置信度 |
| ---- | ------------ | ---- | ------ |
| 组件 | PascalCase | `UserCard.tsx` | 95% |
| Hook | camelCase + use | `useAuth.ts` | 90% |
| 工具 | camelCase | `formatDate.ts` | 88% |
| 常量 | UPPER_SNAKE | `API_BASE_URL` | 85% |

---

## 依赖偏好

| 用途 | 首选 | 备选 | 原因推测 |
| ---- | ---- | ---- | -------- |
| HTTP | axios | - | 拦截器支持好 |
| 日期 | date-fns | - | 轻量、tree-shaking |
| 状态 | Pinia | - | Vue3 官方推荐 |

---

## 工作流模式

### 新增功能流程（检测到）

1. 创建 `src/features/{name}/` 目录
2. 添加 `index.ts` 导出
3. 创建 `__tests__/` 测试目录
4. 更新 `src/features/index.ts`

**置信度**: ██████████░░ 78%

---

## 生成的知识文件

1. `memory-bank/patterns.md` - 项目模式文档
2. `rules/common/naming.md` - 命名规范（建议）
3. `rules/common/architecture.md` - 架构规范（建议）
```

---

## 生成的 SKILL.md

```markdown
---
name: {project}-patterns
description: 从 {project} 代码库提取的编码模式
version: 1.0.0
source: local-git-analysis
analyzed_commits: 200
confidence: 0.85
---

# {Project} 编码模式

## 提交约定

本项目使用 **Conventional Commits**:

- `feat:` - 新功能
- `fix:` - Bug 修复
- `chore:` - 维护任务
- `docs:` - 文档更新
- `test:` - 测试相关

## 架构规范

按功能划分目录结构:

- 功能模块放在 `src/features/`
- 共享组件放在 `src/shared/`
- 工具函数放在 `src/utils/`

## 命名规范

- 组件文件: PascalCase (`UserCard.tsx`)
- Hook 文件: camelCase + use 前缀 (`useAuth.ts`)
- 工具文件: camelCase (`formatDate.ts`)

## 工作流

### 添加新功能

1. 在 `src/features/` 创建功能目录
2. 添加 `index.ts` 统一导出
3. 创建对应的测试文件
4. 更新功能入口文件
```

---

## 与其他命令的配合

```
新项目初始化:
克隆仓库 → /cc-best:analyze → /cc-best:setup → /cc-best:status

团队知识沉淀:
/cc-best:analyze → /cc-best:learn --export → 分享给团队

持续改进:
/cc-best:analyze → /cc-best:evolve → 生成新的 skills/agents
```

---

## 参数说明

| 参数                   | 说明           | 默认值         |
| ---------------------- | -------------- | -------------- |
| `--commits <n>`        | 分析的提交数量 | 200            |
| `--output <path>`      | 输出目录       | `memory-bank/` |
| `--domain <name>`      | 限定分析领域   | 全部           |
| `--min-confidence <n>` | 最低置信度阈值 | 0.5            |
| `--dry-run`            | 仅预览不写入   | false          |

---

## 注意事项

### 分析限制

- 仅分析文本文件，跳过二进制
- 需要足够的提交历史（建议 50+ 次）
- 大型仓库可能需要限制范围

### 置信度说明

- **90%+**: 明确的模式，可直接采用
- **70-89%**: 高频模式，建议采用
- **50-69%**: 中等频率，需人工确认
- **<50%**: 不生成建议

### 隐私考虑

- 不分析 `.env` 等敏感文件
- 不提取具体的业务逻辑
- 仅关注模式和约定

---

> **记住**：分析的目的是发现团队已有的好习惯，而不是强加新的规范。尊重历史，面向未来。
