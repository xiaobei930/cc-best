---
paths:
  - "**/*"
alwaysApply: true
---

# C# 安全规范 | C# Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供 C# 特定安全规范

## 禁止操作

### 禁止拼接 SQL 语句

```csharp
// ❌ SQL 注入风险
var sql = $"SELECT * FROM Users WHERE Name = '{name}'";
context.Users.FromSqlRaw(sql);

// ✅ 使用 EF Core 参数化查询
context.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Name = {name}");

// ✅ 优先使用 LINQ 查询
context.Users.Where(u => u.Name == name).ToListAsync();
```

### 禁止关闭 CSRF 保护

```csharp
// ❌ 全局禁用 CSRF 保护
services.AddControllersWithViews(options =>
    options.Filters.Add(new IgnoreAntiforgeryTokenAttribute()));

// ✅ 全局启用，仅 API 端点按需豁免
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult SubmitForm(FormModel model) { }

// ✅ 对于 SPA + JWT 场景，使用 [ApiController] 自动处理
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase { }
```

### 禁止硬编码密钥和连接字符串

```csharp
// ❌ 密钥写死在代码中
var secret = "my-super-secret-key-12345";

// ✅ 开发环境使用 Secret Manager
// dotnet user-secrets set "Jwt:Secret" "your-secret-key"
var secret = configuration["Jwt:Secret"];

// ✅ 生产环境使用 Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri("https://myvault.vault.azure.net/"),
    new DefaultAzureCredential());
```

---

## 必须遵守

### CORS 策略必须明确指定来源

```csharp
// ❌ 允许所有来源，等同于没有 CORS
builder.Services.AddCors(options =>
    options.AddPolicy("Open", p => p.AllowAnyOrigin().AllowAnyMethod()));

// ✅ 白名单指定允许的来源和方法
builder.Services.AddCors(options =>
    options.AddPolicy("Production", p => p
        .WithOrigins("https://app.example.com", "https://admin.example.com")
        .WithMethods("GET", "POST", "PUT")
        .WithHeaders("Authorization", "Content-Type")));
```

### 输入验证必须同时使用模型验证与业务验证

```csharp
// ✅ DataAnnotations 进行格式验证
public class CreateUserRequest
{
    [Required(ErrorMessage = "用户名不能为空")]
    [StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = default!;

    [Required, EmailAddress]
    public string Email { get; set; } = default!;

    [Range(18, 120, ErrorMessage = "年龄必须在 18-120 之间")]
    public int Age { get; set; }
}

// ✅ FluentValidation 处理复杂业务规则
public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator(IUserRepository repo)
    {
        RuleFor(x => x.Email)
            .MustAsync(async (email, _) => !await repo.ExistsAsync(email))
            .WithMessage("邮箱已被注册");
    }
}
```

### 敏感数据必须使用 Data Protection API 加密

```csharp
// ✅ 使用 IDataProtector 加密敏感字段
public class TokenService
{
    private readonly IDataProtector _protector;

    public TokenService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("TokenService.v1");
    }

    public string Protect(string plainText) => _protector.Protect(plainText);
    public string Unprotect(string encrypted) => _protector.Unprotect(encrypted);
}
```

---

## 推荐做法

### ASP.NET Identity 安全配置

```csharp
// ✅ 强化密码和锁定策略
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 12;
    options.Password.RequireNonAlphanumeric = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.User.RequireUniqueEmail = true;
});
```

### 安全响应头配置

```csharp
// ✅ 添加安全相关的 HTTP 响应头
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});
```

### 日志中脱敏处理用户数据

```csharp
// ❌ 日志中泄露敏感信息
_logger.LogInformation("用户登录: {Email}, 密码: {Password}", email, password);

// ✅ 仅记录必要信息，脱敏处理
_logger.LogInformation("用户登录: {Email}", MaskEmail(email));
```
