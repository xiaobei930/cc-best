# 代码健康评估 | Code Health

> 技术债务识别、量化、优先级排序

## 触发条件

- 项目复杂度增长
- Sprint 规划时评估债务
- 重构决策前分析
- 代码审查发现问题堆积

---

## 量化公式

```
严重度 = (变更频率 × Bug 密度 × 复杂度) / 测试覆盖率

其中:
- 变更频率 = 最近 90 天内 git commit 触及该文件的次数
- Bug 密度 = 每千行代码的 Bug 数
- 复杂度 = 圈复杂度评分
- 测试覆盖率 = 测试覆盖的代码行百分比
```

**解读**：高变更 + 高 Bug + 高复杂 + 低覆盖 = 最需要优先处理的债务。

---

## 热点文件检测

### Git 活跃度分析

```bash
# 最近 90 天最常修改的文件（变更热点）
git log --format=format: --name-only --since="90 days ago" | \
  sort | uniq -c | sort -rn | head -20

# 高变更 + 多作者（知识碎片化风险）
git log --format='%an' --since="90 days ago" -- src/ | \
  sort | uniq -c | sort -rn
```

### 复杂度扫描

```bash
# JavaScript/TypeScript
npx eslint . --format json | jq '.[] | select(.errorCount > 0)'

# Python
radon cc src/ -a -s  # 圈复杂度
pylint src/ --output-format=json

# 通用：代码行数统计
cloc . --exclude-dir=node_modules,vendor,dist
```

---

## 优先级分级

### CRITICAL（立即修复）

- 已知 CVE 且 CVSS > 7.0
- 生产 Bug 直接关联的债务
- 阻塞功能开发的技术债
- 合规违规（许可证、法规）

### HIGH（下个 Sprint）

- 高变更频率 + 高复杂度的文件
- 关键业务路径缺少测试
- 依赖版本落后 > 3 个大版本
- 影响用户体验的性能问题

### MEDIUM（本季度）

- 稳定代码中的中等复杂度
- 次要功能的文档缺失
- 技术模式不一致
- 有明确 ROI 的重构机会

### LOW（Backlog）

- 低变更代码的小问题
- 美观性改进
- 锦上添花的优化
- 即将下线功能中的债务

---

## 债务分类速查

| 类别     | 检测信号                 | 推荐工具                    |
| -------- | ------------------------ | --------------------------- |
| 代码质量 | 圈复杂度 >15, 重复率 >3% | ESLint, Pylint, SonarQube   |
| 测试债务 | 覆盖率 <80%, Flaky 测试  | Jest, pytest-cov            |
| 文档债务 | README 过时, TODO 堆积   | Leasot, markdown-link-check |
| 依赖债务 | CVE, 版本落后            | npm audit, pip-audit, Snyk  |
| 设计债务 | 循环依赖, 高耦合         | Madge, dependency-cruiser   |
| 性能债务 | N+1 查询, 内存泄漏       | clinic.js, py-spy           |

---

## DO / DON'T 示例

### 债务评估

```markdown
# ❌ DON'T: 凭感觉判断

"这个文件看起来很乱，应该重构"

# ✅ DO: 数据驱动决策

"user-service.js 在 90 天内修改 47 次，
圈复杂度 32，测试覆盖 12%，
关联 5 个生产 Bug - 建议优先重构"
```

### 优先级排序

```markdown
# ❌ DON'T: 按发现顺序处理

1. 修复 README 格式
2. 更新 lodash（CVE-2020-8203）
3. 重构 PaymentService

# ✅ DO: 按严重度排序

1. [CRITICAL] 更新 lodash（已知 CVE）
2. [HIGH] 重构 PaymentService（高变更+低覆盖）
3. [LOW] 修复 README 格式
```

---

## 快速健康检查脚本

```bash
#!/bin/bash
# code-health-check.sh

echo "=== 代码健康快速检查 ==="

echo "\n📊 热点文件（最近 90 天）:"
git log --format=format: --name-only --since="90 days ago" 2>/dev/null | \
  sort | uniq -c | sort -rn | head -10

echo "\n🔒 依赖安全:"
if [ -f "package.json" ]; then
  npm audit --audit-level=high 2>/dev/null | head -20
elif [ -f "requirements.txt" ]; then
  pip-audit 2>/dev/null | head -20
fi

echo "\n📈 测试覆盖:"
if [ -f "package.json" ]; then
  npm test -- --coverage --silent 2>/dev/null | grep -E "All files|Statements"
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  pytest --cov --cov-report=term-missing -q 2>/dev/null | tail -5
fi
```

---

## 与 code-reviewer 配合

在代码审查时，可以快速评估变更文件的健康状态：

```bash
# 获取本次变更的文件列表
git diff --name-only HEAD~1

# 检查这些文件的变更频率
for file in $(git diff --name-only HEAD~1); do
  count=$(git log --oneline --since="90 days ago" -- "$file" | wc -l)
  echo "$file: $count 次修改"
done
```

若变更文件是高频修改的"热点"，应提高审查严格程度。

---

## 相关文件

- [SKILL.md](./SKILL.md) - 质量保障父技能
- [../security/SKILL.md](../security/SKILL.md) - 安全审查
- [../debug/SKILL.md](../debug/SKILL.md) - 系统化调试

---

## Maintenance

- Sources: Fowler Technical Debt, SonarQube patterns, claude-code-templates
- Last updated: 2026-02-05
- Pattern: 量化驱动 + 命令速查
