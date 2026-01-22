---
allowed-tools: Read, Glob, Grep, Bash
---

# /commit - Git 提交

执行 Git 提交操作，遵循 Conventional Commits 规范。

## 提交流程

```
1. 检查状态
   └─ git status 查看变更文件
   └─ git diff 查看具体变更

2. 暂存文件
   └─ git add <files>

3. 生成提交信息
   └─ 分析变更内容
   └─ 选择合适的类型前缀
   └─ 编写简洁的描述

4. 执行提交
   └─ git commit -m "type: description"
```

## Conventional Commits 规范

### 类型前缀
| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户登录功能` |
| `fix` | Bug 修复 | `fix: 修复音频播放崩溃问题` |
| `docs` | 文档更新 | `docs: 更新 API 文档` |
| `style` | 代码格式 | `style: 格式化代码` |
| `refactor` | 重构 | `refactor: 重构音频处理模块` |
| `test` | 测试 | `test: 添加用户服务单元测试` |
| `chore` | 构建/工具 | `chore: 更新依赖版本` |
| `perf` | 性能优化 | `perf: 优化图片加载速度` |

### 提交信息格式
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 示例
```bash
# 简单提交
git commit -m "feat: 添加语音识别功能"

# 带范围的提交
git commit -m "fix(auth): 修复 token 过期处理"

# 带详细说明的提交
git commit -m "$(cat <<'EOF'
feat(audio): 实现实时音频处理

- 添加 AudioProcessor 类
- 支持 PCM 和 WAV 格式
- 集成 FunASR 进行识别

Closes #123
EOF
)"
```

## 禁止操作

- **禁止** `git push --force`
- **禁止** `git reset --hard`（已推送的提交）
- **禁止** `git commit --amend`（已推送的提交）
- **禁止** 在 commit message 中添加 Co-Authored-By

## 最佳实践

1. **原子提交** - 每个提交只做一件事
2. **清晰描述** - 说明做了什么，而不是怎么做的
3. **及时提交** - 完成一个小功能就提交
4. **检查暂存** - 提交前确认暂存的文件正确
