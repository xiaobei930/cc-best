---
allowed-tools: Read, Glob, Grep, Bash
---

# /git - Git 提交规范

定义提交时机、频率和规范。

## 提交时机

### 必须提交
| 时机 | 理由 |
|------|------|
| 完成一个原子任务 | 保证可回滚 |
| 完成一个功能模块 | 里程碑记录 |
| 修复一个 bug | 问题追溯 |
| 重要配置变更 | 变更追踪 |
| 下班/长时间中断前 | 状态保存 |

### 不要提交
| 情况 | 原因 |
|------|------|
| 代码不可运行 | 破坏主分支 |
| 测试未通过 | 引入问题 |
| 有调试代码 | 不专业 |
| 包含敏感信息 | 安全风险 |

## 提交频率

| 任务类型 | 建议频率 |
|---------|---------|
| 新功能开发 | 每个函数/类完成后 |
| Bug 修复 | 每个 bug 修复后 |
| 重构 | 每个文件完成后 |
| 文档更新 | 批量更新后 |
| 配置变更 | 每次变更后 |

**原则**: 宁可提交多，不要提交少。小步提交便于回滚和追溯。

## Commit Message 规范

### 格式
```
<type>(<scope>): <subject>

<body>

```

### Type 类型
| type | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(auth): add login feature |
| fix | Bug 修复 | fix(api): correct validation |
| docs | 文档 | docs: update architecture |
| style | 格式 | style: format with prettier |
| refactor | 重构 | refactor(core): simplify logic |
| test | 测试 | test(api): add unit tests |
| chore | 构建/工具 | chore: update dependencies |

### Subject 规则
- 动词开头：add, fix, update, remove, refactor
- 不超过 50 字符
- 不加句号

## 分支策略

```
main/master (受保护)
  ↑
develop (日常开发)
  ↑
feature/xxx (功能分支)
  ↑
fix/xxx (修复分支)
```

### 分支命名
- `feature/user-auth`
- `fix/login-error`
- `refactor/api-structure`

## 提交前检查

```bash
# 自动检查清单
- [ ] git status 确认变更范围
- [ ] git diff 检查具体修改
- [ ] 无调试代码 (print, console.log)
- [ ] 无敏感信息 (.env, secrets)
- [ ] 代码可运行
- [ ] 测试通过（如有）
```
