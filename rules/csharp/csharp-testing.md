---
paths:
  - "**/*"
alwaysApply: true
---

# C# 测试规范 | C# Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供 C# 特定测试规范

## 禁止操作

### 禁止混用 xUnit 与 NUnit 特性

```csharp
// ❌ 在 xUnit 项目中使用 NUnit 的 [Test]
[Test] public void GetUser_ReturnsUser() { }
// ✅ 统一使用 xUnit
[Fact] public void GetUser_ReturnsUser() { }
```

### 禁止 Moq 滥用 It.IsAny 掩盖逻辑

```csharp
// ❌ 所有参数用 It.IsAny，无法验证实际调用
_mockRepo.Setup(r => r.GetAsync(It.IsAny<int>())).ReturnsAsync(new User());
// ✅ 明确匹配关键参数
_mockRepo.Setup(r => r.GetAsync(expectedId)).ReturnsAsync(expectedUser);
```

### 禁止异步测试返回 void

```csharp
// ❌ async void 异常不会被捕获
[Fact] public async void GetUser_Test() { }
// ✅ 必须返回 Task
[Fact] public async Task GetUser_Test() { }
```

---

## 必须遵守

### 使用 [Theory] + [InlineData] 覆盖多场景

```csharp
[Theory]
[InlineData("", false)]
[InlineData("valid@email.com", true)]
[InlineData("no-at-sign.com", false)]
public void ValidateEmail_ReturnsExpected(string email, bool expected)
{
    _validator.IsValid(email).Should().Be(expected);
}
```

### Moq 必须 Verify 关键交互

```csharp
[Fact]
public async Task CreateOrder_ShouldSendNotification()
{
    var mock = new Mock<INotificationService>();
    var service = new OrderService(mock.Object);
    await service.CreateOrderAsync(new OrderRequest { UserId = 1 });
    mock.Verify(n => n.SendAsync(
        It.Is<Notification>(x => x.UserId == 1)), Times.Once);
}
```

### ASP.NET 集成测试使用 WebApplicationFactory

```csharp
public class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public OrderApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            s.RemoveAll<DbContextOptions<AppDbContext>>();
            s.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("TestDb"));
        })).CreateClient();
    }

    [Fact]
    public async Task GetOrders_ReturnsOk()
    {
        var resp = await _client.GetAsync("/api/orders");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

---

## 推荐做法

### 使用 FluentAssertions 替代原生断言

```csharp
// ❌ 原生断言失败信息模糊
Assert.Equal(3, result.Count);
// ✅ FluentAssertions 自带清晰错误信息
result.Should().HaveCount(3)
    .And.AllSatisfy(x => x.IsActive.Should().BeTrue());
```

### 使用 Testcontainers 进行真实数据库测试

```csharp
public class DbTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _pg =
        new PostgreSqlBuilder().WithImage("postgres:16-alpine").Build();
    public async Task InitializeAsync() => await _pg.StartAsync();
    public async Task DisposeAsync() => await _pg.DisposeAsync();

    [Fact]
    public async Task Repository_ShouldPersist()
    {
        await using var ctx = new AppDbContext(
            new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(_pg.GetConnectionString()).Options);
        await ctx.Database.EnsureCreatedAsync();
        ctx.Users.Add(new User { Name = "测试用户" });
        await ctx.SaveChangesAsync();
        (await ctx.Users.CountAsync()).Should().Be(1);
    }
}
```

### 异步测试验证 CancellationToken

```csharp
[Fact]
public async Task LongOp_RejectsCancellation()
{
    using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(100));
    await Assert.ThrowsAsync<OperationCanceledException>(
        () => _service.LongRunningAsync(cts.Token));
}
```
