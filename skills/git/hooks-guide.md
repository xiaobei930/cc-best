# Git Hooks

## pre-commit

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 运行 lint
npm run lint

# 运行测试
npm test

# 检查敏感信息
if git diff --cached | grep -E "(api_key|password|secret)" > /dev/null; then
  echo "警告：检测到可能的敏感信息"
  exit 1
fi
```

## commit-msg

```bash
#!/bin/sh
# .git/hooks/commit-msg

# 验证提交信息格式
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|ci)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "错误：提交信息不符合规范"
  echo "格式：type(scope): description"
  exit 1
fi
```
