---
paths:
  - "**/*"
alwaysApply: true
---

# C# 性能优化规范 | C# Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供 C# 特定性能规范

## 禁止操作

### 禁止在热路径中产生不必要的装箱

```csharp
// ❌ int 装箱为 object，产生堆分配
void Log(object value) => Console.WriteLine(value);
Log(42);  // 装箱

// ✅ 使用泛型避免装箱
void Log<T>(T value) => Console.WriteLine(value);
Log(42);  // 无装箱
```

### 禁止在循环中使用捕获变量的 LINQ 闭包

```csharp
// ❌ 每次迭代创建委托对象和闭包
foreach (var id in ids)
{
    var items = collection.Where(x => x.ParentId == id).ToList();
}

// ✅ 预先构建查找表，O(1) 查询
var lookup = collection.ToLookup(x => x.ParentId);
foreach (var id in ids)
{
    var items = lookup[id];
}
```

### 禁止在异步方法中阻塞等待

```csharp
// ❌ .Result / .Wait() 可能导致死锁和线程池饥饿
var data = GetDataAsync().Result;
GetDataAsync().Wait();

// ✅ 全链路 async/await
var data = await GetDataAsync();
```

---

## 必须遵守

### async/await 正确配置

```csharp
// ✅ 库代码使用 ConfigureAwait(false) 避免同步上下文捕获
public async Task<byte[]> ReadFileAsync(string path)
{
    return await File.ReadAllBytesAsync(path).ConfigureAwait(false);
}

// ✅ 无需异步状态机时使用 ValueTask 减少分配
public ValueTask<int> GetCachedCountAsync()
{
    if (_cache.TryGetValue("count", out int value))
        return new ValueTask<int>(value);  // 同步路径零分配

    return new ValueTask<int>(LoadCountFromDbAsync());
}
```

### 高频字符串处理使用 Span&lt;T&gt;

```csharp
// ❌ Substring 每次创建新字符串对象
string dateStr = timestamp.Substring(0, 10);
string timeStr = timestamp.Substring(11, 8);

// ✅ Span<T> 零拷贝切片
ReadOnlySpan<char> span = timestamp.AsSpan();
ReadOnlySpan<char> dateSpan = span[..10];
ReadOnlySpan<char> timeSpan = span[11..19];
```

### LINQ 注意延迟执行与多次枚举

```csharp
// ❌ IEnumerable 被多次枚举，每次重新执行查询
IEnumerable<User> users = GetActiveUsers();
var count = users.Count();        // 第一次枚举
var first = users.FirstOrDefault(); // 第二次枚举

// ✅ 提前物化为列表
var users = GetActiveUsers().ToList();
var count = users.Count;
var first = users.FirstOrDefault();
```

---

## 推荐做法

### 使用 ObjectPool 复用高开销对象

```csharp
// ✅ 复用 StringBuilder 减少 GC 压力
var pool = ObjectPool.Create<StringBuilder>();

var sb = pool.Get();
try
{
    sb.Append("处理结果: ");
    sb.Append(result.Value);
    return sb.ToString();
}
finally
{
    sb.Clear();
    pool.Return(sb);
}
```

### 使用 IMemoryCache / IDistributedCache 缓存热数据

```csharp
// ✅ 内存缓存 + 过期策略
public async Task<UserProfile> GetProfileAsync(int userId)
{
    var cacheKey = $"user:profile:{userId}";

    if (!_memoryCache.TryGetValue(cacheKey, out UserProfile? profile))
    {
        profile = await _repository.GetProfileAsync(userId);
        _memoryCache.Set(cacheKey, profile, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
            SlidingExpiration = TimeSpan.FromMinutes(2)
        });
    }
    return profile!;
}
```

### 使用 BenchmarkDotNet 量化优化效果

```csharp
// ✅ 基准测试验证优化是否有效
[MemoryDiagnoser]
public class SerializationBenchmarks
{
    private readonly List<Order> _orders = GenerateTestOrders(1000);

    [Benchmark(Baseline = true)]
    public string NewtonsoftJson()
        => JsonConvert.SerializeObject(_orders);

    [Benchmark]
    public byte[] SystemTextJson()
        => JsonSerializer.SerializeToUtf8Bytes(_orders);
}
// 运行: dotnet run -c Release -- --filter *Serialization*
```

### Memory&lt;T&gt; 用于需要异步传递的缓冲区

```csharp
// ❌ Span<T> 不能在异步方法中使用（栈上类型）
async Task ProcessAsync(Span<byte> data) { }  // 编译错误

// ✅ Memory<T> 可安全跨异步边界
async Task ProcessAsync(Memory<byte> data)
{
    await stream.WriteAsync(data);
}
```
