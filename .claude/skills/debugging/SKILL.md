---
name: debugging
description: "调试技能：包含系统化调试方法、日志分析、性能诊断等技巧。Use when debugging issues, analyzing errors, investigating performance problems, or troubleshooting production incidents."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# 调试技能

本技能提供系统化的调试方法和技巧。

## 触发条件

- 调试代码问题
- 分析错误日志
- 调查性能问题
- 排查生产事故
- 修复 Bug

## 调试原则

### 黄金法则

1. **复现问题** - 先能稳定复现，再开始调试
2. **最小化** - 找到最小可复现用例
3. **二分法** - 缩小问题范围
4. **假设验证** - 提出假设，验证假设
5. **记录过程** - 记录尝试过的方法

### 调试流程

```
问题描述 → 复现问题 → 缩小范围 → 定位原因 → 修复验证 → 记录总结
```

## 问题描述模板

```markdown
## 问题描述
[简要描述问题现象]

## 预期行为
[期望的正确行为]

## 实际行为
[实际观察到的行为]

## 复现步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

## 环境信息
- OS: [操作系统]
- Node/Python 版本: [版本]
- 相关依赖版本: [版本]

## 错误信息
[完整的错误堆栈或日志]

## 已尝试的方案
- [ ] 方案1 - 结果
- [ ] 方案2 - 结果
```

## 日志调试

### 有效的日志输出

```typescript
// ❌ 无用的日志
console.log('here')
console.log(data)

// ✅ 有信息量的日志
console.log('[UserService.createUser] 开始创建用户:', {
  email: user.email,
  timestamp: new Date().toISOString()
})

console.log('[UserService.createUser] 数据库插入成功:', {
  userId: result.id,
  duration: Date.now() - startTime
})

console.error('[UserService.createUser] 创建失败:', {
  error: error.message,
  stack: error.stack,
  input: { email: user.email }
})
```

```python
# ❌ 无用的日志
print("here")
print(data)

# ✅ 有信息量的日志
import logging
logger = logging.getLogger(__name__)

logger.info(f"[create_user] 开始创建用户: email={email}")
logger.info(f"[create_user] 创建成功: user_id={user.id}, duration={duration}ms")
logger.error(f"[create_user] 创建失败: error={str(e)}", exc_info=True)
```

### 日志级别使用

| 级别 | 用途 | 示例 |
|------|------|------|
| DEBUG | 详细调试信息 | 函数参数、中间状态 |
| INFO | 正常操作信息 | 用户登录、订单创建 |
| WARN | 警告但可继续 | 配置缺失使用默认值 |
| ERROR | 错误但可恢复 | API 调用失败重试 |
| FATAL | 致命错误需退出 | 数据库连接失败 |

## 断点调试

### VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "name": "Debug Python",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "${file}"]
    }
  ]
}
```

### 条件断点

```typescript
// 在循环中只在特定条件暂停
for (const item of items) {
  // 条件断点: item.id === 'target-id'
  processItem(item)
}
```

## 网络调试

### 请求/响应日志

```typescript
// Axios 拦截器
axios.interceptors.request.use(config => {
  console.log('[HTTP Request]', {
    method: config.method,
    url: config.url,
    data: config.data
  })
  return config
})

axios.interceptors.response.use(
  response => {
    console.log('[HTTP Response]', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  error => {
    console.error('[HTTP Error]', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    })
    throw error
  }
)
```

### cURL 调试

```bash
# 详细输出
curl -v https://api.example.com/users

# 只显示响应头
curl -I https://api.example.com/users

# 带认证
curl -H "Authorization: Bearer TOKEN" https://api.example.com/users

# POST JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}' \
  https://api.example.com/users
```

## 数据库调试

### 查询日志

```typescript
// Prisma 查询日志
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' }
  ]
})

prisma.$on('query', e => {
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration, 'ms')
})
```

```python
# SQLAlchemy 查询日志
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### 慢查询分析

```sql
-- PostgreSQL 查询计划
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = '123';

-- MySQL 慢查询
SHOW FULL PROCESSLIST;
SHOW STATUS LIKE 'Slow_queries';
```

## 性能调试

### 时间测量

```typescript
// 简单计时
const start = performance.now()
await someOperation()
console.log(`耗时: ${performance.now() - start}ms`)

// 使用 console.time
console.time('operation')
await someOperation()
console.timeEnd('operation')
```

```python
import time
from functools import wraps

def timeit(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        duration = (time.perf_counter() - start) * 1000
        print(f"{func.__name__} 耗时: {duration:.2f}ms")
        return result
    return wrapper

@timeit
async def slow_operation():
    pass
```

### 内存分析

```typescript
// Node.js 内存使用
const used = process.memoryUsage()
console.log({
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
  rss: `${Math.round(used.rss / 1024 / 1024)}MB`
})
```

```python
import tracemalloc

tracemalloc.start()
# 执行代码
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')
for stat in top_stats[:10]:
    print(stat)
```

## 前端调试

### Console 方法

```typescript
// 分组输出
console.group('用户数据')
console.log('ID:', user.id)
console.log('Name:', user.name)
console.groupEnd()

// 表格输出
console.table(users)

// 条件断言
console.assert(user.age > 0, '年龄必须大于0')

// 堆栈跟踪
console.trace('调用堆栈')

// 计数
console.count('render') // render: 1, render: 2, ...
```

### React DevTools

```typescript
// 添加 displayName
const MyComponent = () => { ... }
MyComponent.displayName = 'MyComponent'

// 使用 useDebugValue
function useCustomHook() {
  const [value, setValue] = useState(null)
  useDebugValue(value ? 'Has Value' : 'Empty')
  return [value, setValue]
}
```

## 常见问题排查

### 异步问题

```typescript
// ❌ 忘记 await
async function fetchData() {
  const data = fetch('/api/data') // 缺少 await
  return data.json() // data 是 Promise，不是 Response
}

// ✅ 正确
async function fetchData() {
  const response = await fetch('/api/data')
  return await response.json()
}
```

### 闭包陷阱

```typescript
// ❌ 闭包捕获变量
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100) // 全部输出 5
}

// ✅ 使用 let
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100) // 0, 1, 2, 3, 4
}
```

### this 指向

```typescript
// ❌ this 丢失
class Handler {
  name = 'handler'
  handle() {
    console.log(this.name)
  }
}
const h = new Handler()
const fn = h.handle
fn() // undefined

// ✅ 绑定 this
const fn = h.handle.bind(h)
// 或使用箭头函数
handle = () => { console.log(this.name) }
```

## 调试清单

```markdown
## 调试前
- [ ] 能稳定复现问题吗？
- [ ] 最小复现用例是什么？
- [ ] 最近改动了什么？

## 调试中
- [ ] 查看错误日志和堆栈
- [ ] 添加必要的日志输出
- [ ] 使用断点逐步执行
- [ ] 检查输入数据是否正确
- [ ] 检查环境变量和配置

## 调试后
- [ ] 修复是否解决了根本原因？
- [ ] 是否需要添加测试？
- [ ] 是否需要更新文档？
- [ ] 是否有类似问题需要检查？
```

## 最佳实践

1. **先复现后调试** - 不能复现就无法确认修复
2. **二分法定位** - 缩小问题范围
3. **记录尝试** - 避免重复无效尝试
4. **查看最近改动** - git diff, git log
5. **橡皮鸭调试** - 向他人解释问题
6. **休息一下** - 换个思路
7. **搜索错误信息** - 可能他人遇到过
8. **检查假设** - 你认为正确的可能是错的
9. **简化问题** - 去除无关因素
10. **写测试固化** - 防止问题复现
