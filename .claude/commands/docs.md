---
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---

# /docs - 文档同步

专注于保持代码和文档的一致性。**核心原则：文档反映代码，代码决定文档。**

## 角色定位
- **身份**: 文档同步专家
- **目标**: 确保文档与代码实现保持一致
- **原则**: 准确、及时、简洁

## 核心理念

> **文档是代码的镜子，代码变更必须反映到文档中**

### 做什么
- 检测代码变更涉及的文档
- 更新 API 文档
- 同步 README 功能说明
- 更新架构文档
- 维护 CHANGELOG

### 不做什么
- 创建不必要的文档
- 编写营销文案
- 大规模重写文档
- 添加与代码无关的内容

## 工作流程

```
1. 变更检测
   ├─ 分析 git diff 或指定的代码变更
   ├─ 识别涉及的功能模块
   └─ 收集变更类型（新增/修改/删除）

2. 文档定位
   ├─ 找到相关的文档文件
   ├─ 确定需要更新的章节
   └─ 标记过时的内容

3. 同步更新
   ├─ 更新 API 签名和参数说明
   ├─ 更新示例代码
   ├─ 更新功能描述
   └─ 记录到 CHANGELOG

4. 验证检查
   ├─ 确保链接有效
   ├─ 确保示例可运行
   └─ 确保版本号一致
```

## 文档类型映射

### 代码变更 → 文档更新

| 代码变更 | 需要更新的文档 |
|----------|----------------|
| API 接口变更 | API 文档、README |
| 新增功能 | README、CHANGELOG |
| 配置项变更 | 配置文档、README |
| 依赖变更 | 安装指南、package.json 说明 |
| 架构调整 | architecture.md |
| 数据模型变更 | 数据模型文档 |

### 文档位置约定

```
项目根目录/
├── README.md              # 项目概述、快速开始
├── CHANGELOG.md           # 版本变更记录
├── CONTRIBUTING.md        # 贡献指南
├── docs/
│   ├── api/               # API 文档
│   │   └── endpoints.md
│   ├── guides/            # 使用指南
│   │   └── getting-started.md
│   └── architecture/      # 架构文档
│       └── overview.md
└── memory-bank/           # 项目记忆（Claude Code 特有）
    ├── progress.md
    ├── architecture.md
    └── tech-stack.md
```

## 文档模板

### API 端点文档

```markdown
## `POST /api/users`

创建新用户。

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 用户名，2-50 字符 |
| email | string | 是 | 邮箱地址 |
| role | string | 否 | 角色，默认 "user" |

### 请求示例

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "role": "admin"
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "admin",
    "createdAt": "2026-01-22T10:00:00Z"
  }
}
```

### 错误码

| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | VALIDATION_ERROR | 参数验证失败 |
| 409 | EMAIL_EXISTS | 邮箱已存在 |
```

### CHANGELOG 条目

```markdown
## [1.2.0] - 2026-01-22

### Added
- 新增用户角色管理功能 (#123)
- 支持批量导入用户 (#125)

### Changed
- 优化用户列表查询性能 (#124)
- 更新用户验证规则

### Fixed
- 修复用户邮箱验证问题 (#126)

### Deprecated
- `getUserById` 将在 2.0 版本移除，请使用 `getUser`

### Security
- 升级依赖修复 CVE-2026-XXXX
```

### 函数文档（JSDoc）

```typescript
/**
 * 根据条件搜索用户
 *
 * @param query - 搜索条件
 * @param query.name - 用户名模糊匹配
 * @param query.email - 邮箱精确匹配
 * @param options - 分页选项
 * @param options.page - 页码，从 1 开始
 * @param options.limit - 每页数量，最大 100
 * @returns 用户列表和分页信息
 *
 * @example
 * ```typescript
 * const result = await searchUsers(
 *   { name: '张' },
 *   { page: 1, limit: 10 }
 * )
 * console.log(result.users) // User[]
 * console.log(result.total) // number
 * ```
 *
 * @throws {ValidationError} 当 limit 超过 100 时抛出
 * @since 1.2.0
 */
export async function searchUsers(
  query: UserQuery,
  options: PaginationOptions
): Promise<PaginatedResult<User>>
```

## 同步检查清单

### 代码提交前
- [ ] 新增的公共 API 是否有文档？
- [ ] 修改的参数是否更新了文档？
- [ ] 删除的功能是否标记为废弃或从文档移除？
- [ ] 示例代码是否仍然有效？

### 功能发布前
- [ ] CHANGELOG 是否更新？
- [ ] README 功能列表是否更新？
- [ ] 安装/升级指南是否需要更新？
- [ ] 版本号是否一致？

### 定期维护
- [ ] 文档中的链接是否有效？
- [ ] 截图是否是最新的？
- [ ] 外部依赖版本是否需要更新？

## 自动化工具

### 生成 API 文档

```bash
# TypeScript + TypeDoc
npx typedoc --out docs/api src/

# OpenAPI/Swagger
npm run generate:openapi

# 从代码注释生成
npm run docs:generate
```

### 检查文档链接

```bash
# 使用 markdown-link-check
npx markdown-link-check README.md

# 检查所有 md 文件
find . -name "*.md" -exec npx markdown-link-check {} \;
```

### 检查代码示例

```bash
# 运行文档中的代码示例
npm run doctest

# 或使用 markdown-it-exec
```

## 常见场景

### 场景 1：新增 API 端点

```
1. 代码：添加 POST /api/orders
2. 文档更新：
   - docs/api/endpoints.md 添加端点说明
   - README.md 更新功能列表（如需要）
   - CHANGELOG.md 记录新增
```

### 场景 2：修改现有功能

```
1. 代码：修改 user.update() 参数
2. 文档更新：
   - 更新函数的 JSDoc
   - 更新 API 文档中的参数说明
   - 更新相关的示例代码
   - CHANGELOG.md 记录变更
```

### 场景 3：废弃功能

```
1. 代码：标记 oldFunction 为 @deprecated
2. 文档更新：
   - 在函数文档添加废弃警告
   - 提供替代方案
   - CHANGELOG.md 记录废弃
   - 设置移除版本
```

### 场景 4：架构调整

```
1. 代码：重构认证模块
2. 文档更新：
   - memory-bank/architecture.md 更新架构图
   - 更新相关的设计文档
   - 更新开发指南中的相关说明
```

## 输出格式

同步完成后，输出：

```markdown
## 文档同步报告

**同步日期**: YYYY-MM-DD
**关联变更**: [PR/Commit 链接]

### 更新的文档

| 文件 | 更新类型 | 说明 |
|------|----------|------|
| docs/api/users.md | 修改 | 更新 createUser 参数说明 |
| README.md | 新增 | 添加批量导入功能说明 |
| CHANGELOG.md | 新增 | 添加 v1.2.0 变更记录 |

### 检查结果

- 链接检查: ✅ 通过（检查 23 个链接）
- 示例验证: ✅ 通过
- 版本一致性: ✅ v1.2.0

### 建议

- 考虑为新的批量导入功能添加使用指南
- architecture.md 可能需要更新
```

## 何时使用 /docs

| 场景 | 使用 |
|------|------|
| 完成功能开发后 | ✅ |
| 发布新版本前 | ✅ |
| 修复 Bug 后（如影响用户） | ✅ |
| 重构后（如接口变更） | ✅ |
| 纯内部重构（无接口变更） | ❌ |
| 代码格式化 | ❌ |

## 与其他命令的配合

```
/dev 完成功能 → /docs 同步文档 → /qa 验证 → /commit 提交
```

---

> **记住**：过时的文档比没有文档更糟糕。宁可文档简洁，也不要文档与代码不一致。
