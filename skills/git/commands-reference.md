# Git 常用命令参考

## 分支操作

```bash
# 创建并切换分支
git checkout -b feature/new-feature

# 从远程创建本地分支
git checkout -b feature/xxx origin/feature/xxx

# 删除本地分支
git branch -d feature/xxx

# 删除远程分支
git push origin --delete feature/xxx

# 重命名分支
git branch -m old-name new-name
```

## 提交操作

```bash
# 暂存特定文件
git add src/user.ts src/auth.ts

# 交互式暂存
git add -p

# 修改最后一次提交（未推送）
git commit --amend

# 修改提交信息
git commit --amend -m "新的提交信息"
```

## 同步操作

```bash
# 拉取并变基
git pull --rebase origin main

# 推送
git push origin feature/xxx

# 强制推送（谨慎！）
git push --force-with-lease origin feature/xxx
```

## 查看历史

```bash
# 简洁日志
git log --oneline -20

# 图形化日志
git log --graph --oneline --all

# 查看文件历史
git log -p -- path/to/file

# 查看某人的提交
git log --author="name"

# 搜索提交内容
git log -S "search term"
```

## 撤销操作

```bash
# 撤销工作区修改
git checkout -- file.ts

# 取消暂存
git reset HEAD file.ts

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD~1

# 创建反向提交
git revert commit-hash
```

## 储藏操作

```bash
# 储藏当前修改
git stash

# 储藏并命名
git stash save "WIP: 用户功能"

# 查看储藏列表
git stash list

# 应用最近储藏
git stash pop

# 应用特定储藏
git stash apply stash@{2}

# 删除储藏
git stash drop stash@{0}
```
