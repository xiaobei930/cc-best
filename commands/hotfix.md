---
description: 紧急修复快速通道，跳过 PM/Lead 直接 Dev→Verify→Commit
argument-hint: "[描述]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, Task, Skill
---

# /hotfix - 紧急修复快速通道

> 跳过完整管线（PM→Lead→Designer→Dev→QA），直接进入 Dev→Verify→Commit 流程。

适用于生产环境的紧急 Bug 修复、安全补丁等需要快速响应的场景。

---

## 使用方式

```bash
# 描述修复内容
/cc-best:hotfix "修复登录接口 500 错误"
/cc-best:hotfix "修复 XSS 漏洞"

# 无参数 - 从 progress.md 读取当前紧急任务
/cc-best:hotfix
```

---

## 执行流程

```
┌─────────────────────────────────────────┐
│           Hotfix 快速通道                │
├─────────────────────────────────────────┤
│                                          │
│  读取 progress.md                        │
│         ↓                                │
│  /cc-best:dev  ─── 编码修复              │
│         ↓                                │
│  /cc-best:verify ─ 构建+类型+Lint+测试   │
│         ↓                                │
│  /cc-best:commit ─ 提交变更              │
│         ↓                                │
│  更新 progress.md                        │
│                                          │
└─────────────────────────────────────────┘
```

### Step 1: 确认修复内容

- 如果提供了描述参数 → 直接使用
- 如果无参数 → 读取 `memory-bank/progress.md` 中标记为紧急的任务
- 在 `progress.md` 中记录 hotfix 开始

### Step 2: 编码修复

执行 `/cc-best:dev`：

- 专注于最小化修复，不做额外重构
- 修改范围尽可能小
- 添加或更新相关测试用例

### Step 3: 验证

执行 `/cc-best:verify`：

- 构建检查
- 类型检查
- Lint 检查
- 测试运行
- 安全扫描

### Step 4: 提交

执行 `/cc-best:commit`：

- Commit message 使用 `fix:` 前缀
- 更新 `memory-bank/progress.md`

---

## 与完整管线的区别

| 对比项   | 完整管线 (`/cc-best:iterate full`) | Hotfix (`/cc-best:hotfix`) |
| -------- | ---------------------------------- | -------------------------- |
| 需求分析 | PM 角色执行                        | 跳过                       |
| 技术设计 | Lead 角色执行                      | 跳过                       |
| UI 设计  | Designer 角色执行                  | 跳过                       |
| 编码     | Dev 角色执行                       | Dev 角色执行               |
| 验证     | Verify 执行                        | Verify 执行                |
| QA 验收  | QA 角色执行                        | 跳过                       |
| 提交     | Commit 执行                        | Commit 执行                |

---

## 注意事项

- Hotfix 适用于 **紧急修复**，不适合新功能开发
- 修复范围应尽可能小，避免引入新问题
- 完成后建议在下次迭代中补充完整的 QA 验收
- 如果修复涉及架构变更，应使用完整管线
