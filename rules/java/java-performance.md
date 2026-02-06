---
paths:
  - "**/*"
alwaysApply: true
---

# Java 性能优化规范 | Java Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供 Java 特定性能规范

## 禁止操作

### Stream API 性能陷阱

```java
// ❌ 小集合使用 parallelStream（线程调度开销 > 收益）
list.parallelStream().filter(s -> s.length() > 3).collect(Collectors.toList());

// ✅ 数据量 > 10000 且 CPU 密集型才考虑并行
list.stream().filter(s -> s.length() > 3).collect(Collectors.toList());

// ❌ parallelStream 中执行阻塞 IO（共享 ForkJoinPool 被耗尽）
urls.parallelStream().map(url -> httpClient.get(url)).toList();

// ✅ IO 密集型使用 Virtual Threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() -> httpClient.get(url))).toList();
}
```

### N+1 查询

```java
// ❌ 循环中逐条查询
for (Order order : orderRepository.findAll()) {
    User user = userRepository.findById(order.getUserId());  // 每次一条 SQL
}

// ✅ 批量查询 + Map 关联
Set<Long> ids = orders.stream().map(Order::getUserId).collect(Collectors.toSet());
Map<Long, User> map = userRepository.findAllById(ids).stream()
    .collect(Collectors.toMap(User::getId, Function.identity()));

// ✅ JPA: JOIN FETCH 或 @EntityGraph
@EntityGraph(attributePaths = {"user", "items"})
List<Order> findAllWithUserAndItems();
```

---

## 必须遵守

### JVM 调优基本参数

```bash
java -Xms2g -Xmx2g \               # 堆大小固定，避免动态扩缩开销
     -XX:+UseZGC \                  # Java 21+ 低延迟首选
     -XX:MaxGCPauseMillis=10 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/heapdump.hprof \
     -jar app.jar
# GC 选择：API 服务用 ZGC/Shenandoah，批处理用 G1GC
# 容器环境：-XX:MaxRAMPercentage=75.0
```

### HikariCP 连接池

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10 # CPU核心数 * 2 + 磁盘数
      minimum-idle: 5
      connection-timeout: 30000 # 获取连接超时 30s
      max-lifetime: 1800000 # 最大生命周期 30min（< 数据库 wait_timeout）
      leak-detection-threshold: 60000
```

### 并发模式选择

```java
// ✅ Virtual Threads（Java 21+，IO 密集型首选）
// Spring Boot 3.2+ 一行启用：spring.threads.virtual.enabled=true
@Bean
public AsyncTaskExecutor taskExecutor() {
    return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
}

// ✅ CompletableFuture 编排多个异步任务
public OrderDetail getOrderDetail(Long orderId) {
    var order = CompletableFuture.supplyAsync(() -> orderService.findById(orderId));
    var items = CompletableFuture.supplyAsync(() -> itemService.findByOrderId(orderId));
    var user  = CompletableFuture.supplyAsync(() -> userService.getProfile(orderId));
    CompletableFuture.allOf(order, items, user).join();
    return new OrderDetail(order.join(), items.join(), user.join());
}
```

---

## 推荐做法

### JMH 基准测试

```java
// 性能关键路径用 JMH 验证，禁止 System.currentTimeMillis 估算
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.MICROSECONDS)
@Warmup(iterations = 3, time = 1)
@Measurement(iterations = 5, time = 1)
@Fork(1)
@State(Scope.Benchmark)
public class SerializationBenchmark {
    private List<User> users;

    @Setup
    public void setUp() { users = generateUsers(1000); }

    @Benchmark
    public String jacksonSerialize() throws Exception {
        return objectMapper.writeValueAsString(users);
    }
}
```

### 缓存策略：@Cacheable

```java
@Service
public class ProductService {
    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @CacheEvict(value = "products", key = "#product.id")
    public Product update(Product product) {
        return productRepository.save(product);
    }
}
```

### 常见性能反模式

```java
// ❌ 循环内创建重量级对象
for (String json : list) { new ObjectMapper().readValue(json, User.class); }
// ✅ 复用线程安全实例
private static final ObjectMapper MAPPER = new ObjectMapper();

// ❌ 循环内字符串拼接
String r = ""; for (String s : list) { r += s; }
// ✅ StringBuilder
StringBuilder sb = new StringBuilder(list.size() * 16);
list.forEach(sb::append);
```
