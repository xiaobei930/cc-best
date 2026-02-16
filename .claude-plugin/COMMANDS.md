# CC-Best Commands Reference | 命令参考

> Version: 0.7.0 | 42 Commands

快速查阅所有命令的参数和用法。

---

## 角色命令 | Role Commands

| 命令                | 用途                         | 参数         |
| ------------------- | ---------------------------- | ------------ |
| `/cc-best:pm`       | 产品经理，需求分析和规划     | `<需求描述>` |
| `/cc-best:clarify`  | 需求澄清，解决待确认项       | -            |
| `/cc-best:lead`     | 研发经理，技术方案和任务分解 | -            |
| `/cc-best:designer` | UI 设计师，界面设计审查      | -            |
| `/cc-best:dev`      | 开发工程师，编码实现         | `<任务描述>` |
| `/cc-best:qa`       | 测试工程师，质量验证         | -            |
| `/cc-best:verify`   | 综合验证（构建、测试、安全） | -            |

### 角色流程

```
/cc-best:pm → /clarify(可选) → /cc-best:lead → /designer(前端) → /cc-best:dev → /cc-best:qa → /cc-best:verify
```

---

## 模式命令 | Mode Commands

| 命令                | 用途                    | 参数                          |
| ------------------- | ----------------------- | ----------------------------- |
| `/cc-best:iterate`  | 自主迭代循环            | -                             |
| `/cc-best:pair`     | 结对编程模式            | -                             |
| `/cc-best:cc-ralph` | CC-Best Ralph Loop 集成 | -                             |
| `/cc-best:mode`     | 切换工作模式            | `dev` / `research` / `review` |
| `/cc-best:model`    | 切换模型策略            | `--show` / 交互选择           |
| `/cc-best:hotfix`   | 紧急修复快速通道        | `<描述>`                      |

### /cc-best:mode 可用模式

```bash
/cc-best:mode dev      # 开发模式：先写后解释，工作方案优先
/cc-best:mode research # 研究模式：深度分析，全面探索
/cc-best:mode review   # 审查模式：严格检查，质量优先
```

---

## 工具命令 | Tool Commands

### 构建 & 测试

| 命令               | 用途         | 参数                                         |
| ------------------ | ------------ | -------------------------------------------- |
| `/cc-best:build`   | 构建项目     | -                                            |
| `/cc-best:test`    | 运行测试     | `<测试路径>` / `--coverage`                  |
| `/cc-best:run`     | 启动服务     | `api` / `frontend` / `all`                   |
| `/cc-best:fix`     | 修复构建错误 | -                                            |
| `/cc-best:service` | 开发服务管理 | `--stop` / `--restart` / `--logs` / `--list` |

### Git & 提交

| 命令                 | 用途              | 参数                                      |
| -------------------- | ----------------- | ----------------------------------------- |
| `/cc-best:commit`    | Git 提交          | `<提交信息>`                              |
| `/cc-best:pr`        | 创建 Pull Request | -                                         |
| `/cc-best:git-guide` | Git 操作指南      | -                                         |
| `/cc-best:fix-issue` | Issue 修复闭环    | `#<number>` / `--no-close`                |
| `/cc-best:release`   | 版本发布管理      | `patch` / `minor` / `major` / `--dry-run` |

### 状态 & 诊断

| 命令                        | 用途           | 参数                     |
| --------------------------- | -------------- | ------------------------ |
| `/cc-best:status`           | 项目状态诊断   | `--full` / `--conflicts` |
| `/cc-best:self-check`       | 自我检查       | -                        |
| `/cc-best:confidence-check` | 5 维置信度评估 | -                        |
| `/cc-best:security-audit`   | 配置安全扫描   | -                        |

#### /cc-best:status 参数详解

```bash
/cc-best:status            # 基本状态：Git、Memory Bank、依赖
/cc-best:status --full     # 完整诊断 + CC-Best 组件统计
/cc-best:status --conflicts # 检测与其他插件的冲突
```

### 上下文管理

| 命令                       | 用途         | 参数 |
| -------------------------- | ------------ | ---- |
| `/cc-best:compact-context` | 上下文压缩   | -    |
| `/cc-best:checkpoint`      | 检查点保存   | -    |
| `/cc-best:catchup`         | 恢复上下文   | -    |
| `/cc-best:context`         | 上下文管理   | -    |
| `/cc-best:memory`          | 项目记忆管理 | -    |

### 代码质量

| 命令               | 用途       | 参数                                        |
| ------------------ | ---------- | ------------------------------------------- |
| `/cc-best:cleanup` | 死代码清理 | -                                           |
| `/cc-best:docs`    | 文档同步   | -                                           |
| `/cc-best:learn`   | 会话学习   | `--status` / `--export` / `--import <file>` |
| `/cc-best:analyze` | 代码库分析 | `--commits <n>` / `--domain <name>`         |
| `/cc-best:evolve`  | 知识演化   | `--execute` / `--threshold <n>`             |

### 任务管理

| 命令             | 用途         | 参数 |
| ---------------- | ------------ | ---- |
| `/cc-best:task`  | 任务粒度管理 | -    |
| `/cc-best:infer` | 模型推理     | -    |
| `/cc-best:train` | 模型训练     | -    |

---

## 配置命令 | Setup Commands

| 命令                | 用途         | 参数                                              |
| ------------------- | ------------ | ------------------------------------------------- |
| `/cc-best:setup`    | 项目初始化   | `--hooks` / `--verify` / `--global` / `--project` |
| `/cc-best:setup-pm` | 包管理器配置 | `npm` / `pnpm` / `yarn` / `bun`                   |

### /cc-best:setup 参数详解

```bash
/cc-best:setup              # 完整初始化
/cc-best:setup --hooks      # 仅配置 hooks
/cc-best:setup --hooks --global   # hooks 配置到全局
/cc-best:setup --hooks --project  # hooks 配置到项目
/cc-best:setup --verify     # 验证配置
```

---

## 命令分类速查 | Quick Reference

### 按使用频率

**高频（每日使用）**

- `/cc-best:iterate`, `/cc-best:dev`, `/cc-best:commit`, `/cc-best:test`

**中频（功能开发）**

- `/cc-best:pm`, `/cc-best:lead`, `/cc-best:qa`, `/cc-best:verify`, `/cc-best:status`, `/cc-best:fix-issue`, `/cc-best:release`, `/cc-best:hotfix`

**低频（特定场景）**

- `/cc-best:setup`, `/cc-best:compact-context`, `/cc-best:cleanup`, `/cc-best:train`, `/cc-best:service`, `/cc-best:model`

### 按工作阶段

| 阶段     | 命令                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 需求分析 | `/cc-best:pm`, `/cc-best:clarify`                                                            |
| 技术设计 | `/cc-best:lead`, `/cc-best:designer`                                                         |
| 编码实现 | `/cc-best:dev`, `/cc-best:iterate`, `/cc-best:pair`, `/cc-best:fix-issue`, `/cc-best:hotfix` |
| 质量验证 | `/cc-best:qa`, `/cc-best:test`, `/cc-best:verify`                                            |
| 代码提交 | `/cc-best:commit`, `/cc-best:pr`, `/cc-best:release`                                         |
| 维护清理 | `/cc-best:cleanup`, `/cc-best:docs`, `/cc-best:compact-context`                              |
| 知识管理 | `/cc-best:learn`, `/cc-best:analyze`, `/cc-best:evolve`                                      |

---

## 命令组合示例 | Command Combinations

### 日常开发

```bash
/cc-best:iterate                    # 自主迭代，批量完成任务
/cc-best:status                     # 检查项目状态
/cc-best:commit                     # 提交变更
```

### 新功能开发

```bash
/cc-best:pm 实现用户登录功能         # 需求分析
/cc-best:lead                       # 技术方案
/cc-best:dev                        # 编码实现
/cc-best:qa                         # 测试验证
/cc-best:verify                     # 综合验证
/cc-best:commit                     # 提交代码
```

### 代码审查

```bash
/cc-best:status --full              # 完整项目状态
/cc-best:qa                         # 质量验证
/cc-best:verify                     # 综合检查
```

### 上下文管理

```bash
/cc-best:checkpoint                 # 保存当前状态
/cc-best:compact-context                    # 压缩上下文
/cc-best:catchup                    # 恢复上下文
```

### 知识管理

```bash
/cc-best:analyze                    # 分析代码库模式
/cc-best:learn                      # 从会话提取知识
/cc-best:learn --status             # 查看已学习内容
/cc-best:evolve                     # 将知识演化为 skills/agents
```

### 知识管理完整循环

```bash
# 新项目启动
/cc-best:analyze --commits 200      # 分析代码库历史
/cc-best:learn --import team.yaml   # 导入团队知识

# 日常积累
/cc-best:learn                      # 会话结束时提取知识

# 定期演化
/cc-best:evolve                     # 检查可演化的知识聚类
/cc-best:evolve --execute           # 生成新的 skills/agents

# 团队分享
/cc-best:learn --export             # 导出知识分享给团队
```

---

## 功能边界说明 | Functionality Boundaries

### /cc-best:verify vs /cc-best:qa

| 命令              | 层面     | 职责                             | 触发方式 |
| ----------------- | -------- | -------------------------------- | -------- |
| `/cc-best:verify` | 技术层面 | 构建、类型、Lint、测试、安全扫描 | 自动执行 |
| `/cc-best:qa`     | 业务层面 | 基于需求验收标准测试，问题分类   | 智能判断 |

> `/cc-best:verify` = CI/CD 自动化检查，`/cc-best:qa` = 测试工程师角色验证

### /cc-best:build vs /cc-best:test

| 命令             | 阶段 | 职责                   | 输出              |
| ---------------- | ---- | ---------------------- | ----------------- |
| `/cc-best:build` | 编译 | 构建项目，检查编译错误 | 构建产物/错误日志 |
| `/cc-best:test`  | 测试 | 运行测试套件           | 测试报告/覆盖率   |

> `/cc-best:build` 在前，`/cc-best:test` 在后，顺序不可颠倒

### /cc-best:memory vs /cc-best:context

| 命令               | 范围     | 职责                  | 存储位置          |
| ------------------ | -------- | --------------------- | ----------------- |
| `/cc-best:memory`  | 持久化   | 维护 memory-bank 文件 | memory-bank/\*.md |
| `/cc-best:context` | 会话层面 | 加载/管理对话上下文   | 当前会话          |

> `/cc-best:memory` = 项目长期记忆，`/cc-best:context` = 会话信息加载

### /cc-best:fix-issue vs /cc-best:dev

| 命令                 | 触发源       | 职责                                  | 自动化程度 |
| -------------------- | ------------ | ------------------------------------- | ---------- |
| `/cc-best:fix-issue` | GitHub Issue | 分析→修复→测试→提交→关闭 Issue 全闭环 | 全自动     |
| `/cc-best:dev`       | 任务描述     | 通用编码实现                          | 半自动     |

> `/cc-best:fix-issue` = 从 Issue 驱动的端到端修复，`/cc-best:dev` = 通用开发任务

### /cc-best:run vs /cc-best:service

| 命令               | 粒度     | 职责                                | 运行时检测 |
| ------------------ | -------- | ----------------------------------- | ---------- |
| `/cc-best:run`     | 简单启动 | 按参数启动 api/frontend/all         | 否         |
| `/cc-best:service` | 完整管理 | 自动检测运行时，启动/停止/重启/日志 | 6 种语言   |

> `/cc-best:run` = 快速启动，`/cc-best:service` = 智能服务管理

---

## 相关文档 | Related Docs

- [架构文档](ARCHITECTURE.md) - 组件关系和调用链
- [Skills 指南](../skills/README) - 17 个开发技能
- [Agents 指南](../agents/README) - 8 个专业代理
- [Hooks 指南](../hooks/README.md) - 安全钩子配置
