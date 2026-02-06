---
paths:
  - "**/*"
description: 通用编码标准，适用于所有语言和项目
alwaysApply: true
---

# 通用编码标准

本规则适用于所有语言和项目，定义核心编码原则和最佳实践。

## 代码质量原则（道）

### 1. 可读性优先

- 代码被阅读的次数远多于编写
- 清晰的命名胜过注释
- 简单的代码胜过聪明的代码
- 一致的风格胜过个人偏好

### 2. KISS（保持简单）

- 选择最简单的可行方案
- 避免过度设计
- 不做过早优化
- 易于理解 > 技术炫耀

### 3. DRY（不重复）

- 提取公共逻辑为函数
- 创建可复用组件
- 共享工具函数
- 但不要过度抽象（3 次重复再抽象）

### 4. YAGNI（你不需要它）

- 不构建未来可能需要的功能
- 避免投机性的通用化
- 仅在需要时添加复杂度
- 先简单实现，需要时再重构

## 命名规范（术）

### 变量命名

```typescript
// ✅ 好：描述性名称
const userSearchQuery = "keyword";
const isUserAuthenticated = true;
const totalOrderAmount = 1000;

// ❌ 差：模糊的名称
const q = "keyword";
const flag = true;
const x = 1000;
```

### 函数命名

```typescript
// ✅ 好：动词 + 名词
async function fetchUserData(userId: string) {}
function calculateTotalPrice(items: Item[]) {}
function isValidEmail(email: string): boolean {}

// ❌ 差：不清晰
async function user(id: string) {}
function calc(items) {}
function email(e) {}
```

### 布尔变量

```typescript
// ✅ 好：is/has/can/should 前缀
const isLoading = true;
const hasPermission = false;
const canEdit = true;
const shouldRefresh = false;

// ❌ 差：含义不明
const loading = true;
const permission = false;
```

## 不可变性原则（器）

> **关键原则**：永远不要直接修改对象或数组

### 对象更新

```typescript
// ✅ 正确：使用展开运算符
const updatedUser = {
  ...user,
  name: "New Name",
  profile: {
    ...user.profile,
    bio: "Updated bio",
  },
};

// ❌ 错误：直接修改
user.name = "New Name";
```

### 数组更新

```typescript
// ✅ 正确：创建新数组
const newItems = [...items, newItem];
const filteredItems = items.filter((item) => item.active);
const updatedItems = items.map((item) =>
  item.id === targetId ? { ...item, updated: true } : item,
);

// ❌ 错误：直接修改
items.push(newItem);
items[0].active = false;
```

## 错误处理

### 基本模式

```typescript
// ✅ 好：完整的错误处理
async function fetchData(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw new Error("Failed to fetch data");
  }
}

// ❌ 差：忽略错误
async function fetchData(url: string) {
  const response = await fetch(url);
  return response.json(); // 可能失败但没有处理
}
```

### 错误类型

```typescript
// 自定义错误类
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}
```

## 异步编程

### 并行执行

```typescript
// ✅ 好：并行执行独立操作
const [users, orders, stats] = await Promise.all([
  fetchUsers(),
  fetchOrders(),
  fetchStats(),
]);

// ❌ 差：不必要的串行
const users = await fetchUsers();
const orders = await fetchOrders();
const stats = await fetchStats();
```

### 错误处理

```typescript
// ✅ 好：Promise.allSettled 处理部分失败
const results = await Promise.allSettled([fetchUsers(), fetchOrders()]);

const users = results[0].status === "fulfilled" ? results[0].value : [];
const orders = results[1].status === "fulfilled" ? results[1].value : [];
```

## 代码组织

### 文件大小

- **推荐**: 200-400 行
- **上限**: 800 行
- 超过上限考虑拆分

### 函数大小

- **推荐**: 20-30 行
- **上限**: 50 行
- 单一职责原则

### 嵌套深度

- **上限**: 3 层嵌套
- 使用早返回减少嵌套

```typescript
// ✅ 好：早返回
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;

  return doSomething(user);
}

// ❌ 差：深层嵌套
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return doSomething(user);
      }
    }
  }
  return null;
}
```

## 注释规范

### 何时注释

```typescript
// ✅ 好：解释"为什么"
// 使用指数退避避免 API 过载
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ✅ 好：解释非显而易见的决策
// 此处故意使用 mutation 以优化大数组性能
items.push(newItem);

// ❌ 差：解释"是什么"（代码已经说明了）
// 计数器加 1
count++;
```

### JSDoc（公共 API）

```typescript
/**
 * 根据关键词搜索用户
 *
 * @param query - 搜索关键词
 * @param options - 搜索选项
 * @returns 匹配的用户列表
 * @throws {ValidationError} 关键词为空时抛出
 *
 * @example
 * const users = await searchUsers('john', { limit: 10 })
 */
export async function searchUsers(
  query: string,
  options?: SearchOptions,
): Promise<User[]> {
  // 实现
}
```

## 代码异味检测

### 1. 过长函数

```typescript
// ❌ 信号：函数超过 50 行
// ✅ 修复：拆分为小函数
function processData() {
  const validated = validateData();
  const transformed = transformData(validated);
  return saveData(transformed);
}
```

### 2. 魔法数字

```typescript
// ❌ 信号：硬编码数字
if (retryCount > 3) {
}
setTimeout(callback, 500);

// ✅ 修复：命名常量
const MAX_RETRIES = 3;
const DEBOUNCE_DELAY_MS = 500;
```

### 3. 上帝类/函数

```typescript
// ❌ 信号：一个类/函数做太多事
// ✅ 修复：按职责拆分
```

### 4. 重复代码

```typescript
// ❌ 信号：相似代码出现 3 次以上
// ✅ 修复：提取公共函数
```

## API 设计标准

### REST 约定

```
GET    /api/users              # 列表
GET    /api/users/:id          # 详情
POST   /api/users              # 创建
PUT    /api/users/:id          # 全量更新
PATCH  /api/users/:id          # 部分更新
DELETE /api/users/:id          # 删除
```

### 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功响应
{ success: true, data: { ... } }

// 错误响应
{ success: false, error: 'Validation failed' }
```

## 性能最佳实践

### 避免不必要的计算

```typescript
// ✅ 好：缓存计算结果
const sortedItems = useMemo(() => {
  return items.sort((a, b) => b.value - a.value);
}, [items]);

// ❌ 差：每次渲染都重新计算
const sortedItems = items.sort((a, b) => b.value - a.value);
```

### 按需加载

```typescript
// ✅ 好：懒加载重型组件
const HeavyChart = lazy(() => import("./HeavyChart"));

// ✅ 好：只查询需要的字段
const users = await db.users.findMany({
  select: { id: true, name: true, email: true },
});

// ❌ 差：查询所有字段
const users = await db.users.findMany();
```

---

> **记住**：好的代码是自解释的。如果需要大量注释来解释代码，通常意味着代码需要重构。
