# 性能调试

## 时间测量

```typescript
// 简单计时
const start = performance.now();
await someOperation();
console.log(`耗时: ${performance.now() - start}ms`);

// 使用 console.time
console.time("operation");
await someOperation();
console.timeEnd("operation");
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

## 内存分析

```typescript
// Node.js 内存使用
const used = process.memoryUsage();
console.log({
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
  rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
});
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
