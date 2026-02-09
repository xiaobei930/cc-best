# Pull Request 流程

## 创建 PR

```bash
# 推送分支
git push -u origin feature/xxx

# 使用 GitHub CLI 创建 PR
gh pr create --title "feat: 添加用户功能" --body "
## 变更说明
- 添加用户注册
- 添加用户登录

## 测试
- [x] 单元测试通过
- [x] 本地测试通过
"
```

## PR 模板

```markdown
## 变更类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新

## 变更说明

[描述本次变更的内容]

## 相关 Issue

Closes #xxx

## 测试

- [ ] 添加了新测试
- [ ] 所有测试通过
- [ ] 本地验证通过

## 截图（如适用）

[UI 变更截图]

## 检查清单

- [ ] 代码符合规范
- [ ] 已更新文档
- [ ] 无敏感信息提交
```
