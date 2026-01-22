---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---

# /cleanup - 死代码清理

专注于识别和安全删除未使用的代码、依赖和文件。**核心原则：安全删除，完整记录。**

## 角色定位
- **身份**: 代码清理专家
- **目标**: 保持代码库精简，移除技术债务
- **原则**: 安全第一，充分验证，完整记录

## 核心理念

> **只删除确认无用的代码，不删任何存疑的内容**

### 安全删除
✅ 工具确认未使用的导出
✅ 无引用的文件
✅ 未使用的依赖包
✅ 注释掉的代码块
✅ 重复的工具函数

### 保持警惕
⚠️ 动态导入的模块
⚠️ 公共 API 的导出
⚠️ 配置文件引用的代码
⚠️ 测试专用的代码

## 工作流程

```
1. 分析阶段
   ├─ 运行 knip（未使用导出/文件/依赖）
   ├─ 运行 depcheck（未使用 npm 依赖）
   ├─ 手动搜索确认（grep 验证）
   └─ 收集所有待清理项

2. 风险评估
   ├─ 分类：SAFE / CAREFUL / RISKY
   ├─ 检查动态导入
   ├─ 检查公共 API
   └─ 确定删除顺序

3. 安全删除
   ├─ 从 SAFE 项开始
   ├─ 每批删除后验证构建
   ├─ 记录到 DELETION_LOG.md
   └─ 提交 git commit

4. 验证阶段
   ├─ 构建通过
   ├─ 测试通过
   └─ 无运行时错误
```

## 检测工具

### knip - 全面检测

```bash
# 安装
npm install -D knip

# 运行（检测未使用的导出、文件、依赖）
npx knip

# 输出示例
# Unused files: src/old-util.ts
# Unused exports: src/utils.ts → unusedFunction
# Unused dependencies: lodash
```

### depcheck - 依赖检测

```bash
# 安装
npm install -g depcheck

# 运行
depcheck

# 输出示例
# Unused dependencies:
# * lodash
# * moment
```

### 手动搜索验证

```bash
# 搜索函数引用
grep -r "functionName" src/

# 搜索文件引用
grep -r "fileName" src/

# 搜索包引用
grep -r "from 'package'" src/
grep -r "require('package')" src/
```

## 风险分类

### SAFE（安全删除）

| 类型 | 特征 | 示例 |
|------|------|------|
| 未使用导出 | knip 报告，grep 无引用 | `export function unused()` |
| 未使用依赖 | depcheck 报告，代码中无引用 | `lodash` 在 package.json 但从未 import |
| 孤立文件 | 无任何 import/require | `src/old-feature.ts` |
| 注释代码 | 大段注释的代码块 | `// function oldCode() {...}` |

### CAREFUL（谨慎处理）

| 类型 | 风险 | 检查方式 |
|------|------|----------|
| 动态导入 | `import()` 字符串拼接 | 搜索 `import(` 和 `require(` |
| 配置引用 | 配置文件中使用 | 检查 webpack/vite/next 配置 |
| 条件导出 | 环境变量控制 | 检查 `process.env` 条件 |

### RISKY（高风险）

| 类型 | 风险 | 建议 |
|------|------|------|
| 公共 API | 外部使用者依赖 | 不删除，或先废弃再删 |
| 共享组件 | 可能跨项目使用 | 确认所有使用方 |
| 第三方集成 | Webhook、回调等 | 检查外部系统 |

## 删除清单模板

### DELETION_LOG.md

```markdown
# 代码删除日志

## [YYYY-MM-DD] 清理会话

### 删除的依赖

| 包名 | 版本 | 原因 | 大小 |
|------|------|------|------|
| lodash | 4.17.21 | 从未使用 | 72KB |
| moment | 2.29.4 | 已替换为 dayjs | 290KB |

### 删除的文件

| 文件 | 原因 | 原行数 |
|------|------|--------|
| src/utils/old-helper.ts | 无引用 | 45 |
| src/components/Deprecated.tsx | 已被 New.tsx 替代 | 120 |

### 删除的导出

| 文件 | 导出名 | 原因 |
|------|--------|------|
| src/utils/index.ts | formatOld | 无引用 |
| src/utils/index.ts | parseOld | 无引用 |

### 清理统计

- 删除文件: 5 个
- 删除依赖: 3 个
- 减少代码: 800 行
- 减少包体积: ~400KB

### 验证

- [x] `npm run build` 通过
- [x] `npm test` 通过
- [x] 开发服务器正常运行
```

## 安全检查清单

### 删除前

- [ ] 运行检测工具（knip/depcheck）
- [ ] grep 搜索确认无引用
- [ ] 检查动态导入模式
- [ ] 检查配置文件引用
- [ ] 检查是否公共 API
- [ ] 创建备份分支

### 每次删除后

- [ ] 构建成功 (`npm run build`)
- [ ] 测试通过 (`npm test`)
- [ ] 无新的 TypeScript 错误
- [ ] 更新 DELETION_LOG.md
- [ ] 提交 git commit

### 删除完成后

- [ ] 完整构建通过
- [ ] 所有测试通过
- [ ] 开发服务器正常
- [ ] DELETION_LOG.md 完整

## 删除顺序建议

```
1. 未使用的 npm 依赖
   └─ 风险最低，影响最小

2. 未使用的内部导出
   └─ 容易验证，容易回滚

3. 孤立的文件
   └─ 删除前确认无动态引用

4. 注释的代码块
   └─ 通常安全，但可能有历史价值

5. 重复的代码（最后处理）
   └─ 需要选择保留哪个版本
```

## 禁止删除清单

> **永远不要删除以下内容（除非明确要求）**

- 认证/授权相关代码
- 支付/交易相关代码
- 数据库迁移脚本
- API 版本兼容代码
- 第三方集成代码
- 法律/合规相关文件

## 输出格式

清理完成后，输出：

```markdown
## 死代码清理报告

**清理日期**: YYYY-MM-DD

### 清理统计
- 依赖: 移除 X 个，减少 ~YKB
- 文件: 删除 Z 个，减少 W 行代码
- 导出: 清理 N 个未使用导出

### 验证结果
- 构建: ✅ 通过
- 测试: ✅ 通过
- 类型检查: ✅ 通过

### 详细记录
见 `docs/DELETION_LOG.md`

### 下一步
建议定期（每月）运行 /cleanup 保持代码库整洁
```

## 何时使用 /cleanup

| 场景 | 使用 |
|------|------|
| 功能开发完成，代码稳定 | ✅ |
| 重构前清理 | ✅ |
| 发布前清理 | ✅ |
| 功能开发中 | ❌ |
| 紧急 bug 修复时 | ❌ |
| 代码不稳定时 | ❌ |

---

> **记住**：删除代码是不可逆的（即使有 git）。宁可保守也不要误删。当有疑问时，保留代码并添加 TODO 注释。
