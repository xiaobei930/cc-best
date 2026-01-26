# C# / ASP.NET Core 后端开发模式

C# 后端开发的专属模式，涵盖 ASP.NET Core Web API、Minimal APIs 等。

## 项目结构

### Clean Architecture 项目
```
Solution/
├── src/
│   ├── MyApp.Api/                    # Web API 项目
│   │   ├── Controllers/
│   │   │   └── UsersController.cs
│   │   ├── Middleware/
│   │   │   └── ExceptionMiddleware.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── MyApp.Application/            # 应用层
│   │   ├── Services/
│   │   │   └── UserService.cs
│   │   ├── DTOs/
│   │   │   └── UserDto.cs
│   │   └── Interfaces/
│   │       └── IUserService.cs
│   ├── MyApp.Domain/                 # 领域层
│   │   ├── Entities/
│   │   │   └── User.cs
│   │   └── Exceptions/
│   │       └── AppException.cs
│   └── MyApp.Infrastructure/         # 基础设施层
│       ├── Repositories/
│       │   └── UserRepository.cs
│       └── Data/
│           └── AppDbContext.cs
├── tests/
│   └── MyApp.Tests/
├── MyApp.sln
└── README.md
```

---

## 错误处理

### 自定义异常类

```csharp
// Domain/Exceptions/AppException.cs
namespace MyApp.Domain.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }

    public AppException(string message, int statusCode = 500, string code = "INTERNAL_ERROR")
        : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string resource)
        : base($"{resource} 未找到", 404, "NOT_FOUND")
    {
    }
}

public class ValidationException : AppException
{
    public ValidationException(string message)
        : base(message, 400, "VALIDATION_ERROR")
    {
    }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "未授权")
        : base(message, 401, "UNAUTHORIZED")
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "禁止访问")
        : base(message, 403, "FORBIDDEN")
    {
    }
}
```

### 全局异常处理中间件

```csharp
// Api/Middleware/ExceptionMiddleware.cs
using System.Text.Json;
using MyApp.Domain.Exceptions;

namespace MyApp.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning("业务异常: {Code} - {Message}", ex.Code, ex.Message);
            await HandleExceptionAsync(context, ex.StatusCode, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "未处理异常");
            await HandleExceptionAsync(context, 500, "INTERNAL_ERROR", "服务器内部错误");
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context, int statusCode, string code, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new
        {
            success = false,
            error = new { code, message }
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

// 扩展方法
public static class ExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionMiddleware>();
    }
}
```

---

## 统一响应格式

```csharp
// Application/DTOs/ApiResponse.cs
namespace MyApp.Application.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public ErrorInfo? Error { get; init; }
    public MetaInfo? Meta { get; init; }

    public static ApiResponse<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ApiResponse<T> Ok(T data, int page, int limit, long total) => new()
    {
        Success = true,
        Data = data,
        Meta = new MetaInfo { Page = page, Limit = limit, Total = total }
    };

    public static ApiResponse<T> Fail(string code, string message) => new()
    {
        Success = false,
        Error = new ErrorInfo { Code = code, Message = message }
    };
}

public record ErrorInfo
{
    public required string Code { get; init; }
    public required string Message { get; init; }
}

public record MetaInfo
{
    public int Page { get; init; }
    public int Limit { get; init; }
    public long Total { get; init; }
}
```

---

## Controller 模板

```csharp
// Api/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using MyApp.Application.DTOs;
using MyApp.Application.Interfaces;
using MyApp.Domain.Exceptions;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return StatusCode(201, ApiResponse<UserResponseDto>.Ok(user));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id)
            ?? throw new NotFoundException("用户");
        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<UserResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var (users, total) = await _userService.ListAsync(page, limit);
        return Ok(ApiResponse<List<UserResponseDto>>.Ok(users, page, limit, total));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);
        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteAsync(id);
        return NoContent();
    }
}
```

---

## Service 模板

```csharp
// Application/Services/UserService.cs
using Microsoft.EntityFrameworkCore;
using MyApp.Application.DTOs;
using MyApp.Application.Interfaces;
using MyApp.Domain.Entities;
using MyApp.Domain.Exceptions;
using MyApp.Infrastructure.Data;

namespace MyApp.Application.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(AppDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists)
        {
            throw new ValidationException("邮箱已存在");
        }

        var user = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            Password = _passwordHasher.Hash(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user is null ? null : MapToDto(user);
    }

    public async Task<(List<UserResponseDto> Users, long Total)> ListAsync(int page, int limit)
    {
        var query = _context.Users.AsQueryable();

        var total = await query.LongCountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(u => MapToDto(u))
            .ToListAsync();

        return (users, total);
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new NotFoundException("用户");

        user.Name = dto.Name;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new NotFoundException("用户");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    private static UserResponseDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        Name = user.Name,
        CreatedAt = user.CreatedAt
    };
}
```

---

## 配置管理

```csharp
// Api/Configuration/AppSettings.cs
namespace MyApp.Api.Configuration;

public class AppSettings
{
    public string Environment { get; set; } = "Development";
    public DatabaseSettings Database { get; set; } = new();
    public JwtSettings Jwt { get; set; } = new();
    public RedisSettings? Redis { get; set; }
}

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
}

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}

public class RedisSettings
{
    public string ConnectionString { get; set; } = string.Empty;
}

// Program.cs 中配置
var builder = WebApplication.CreateBuilder(args);
var settings = builder.Configuration.Get<AppSettings>()
    ?? throw new InvalidOperationException("配置加载失败");

builder.Services.Configure<AppSettings>(builder.Configuration);
```

---

## 依赖注入配置

```csharp
// Program.cs
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Middleware;
using MyApp.Application.Interfaces;
using MyApp.Application.Services;
using MyApp.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 数据库
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

// 服务注册
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// 缓存
builder.Services.AddMemoryCache();
// 或 Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 中间件
app.UseExceptionMiddleware();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 缓存服务

```csharp
// Application/Services/CacheService.cs
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace MyApp.Application.Services;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
    Task RemoveAsync(string key);
}

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly JsonSerializerOptions _jsonOptions;

    public CacheService(IDistributedCache cache)
    {
        _cache = cache;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var data = await _cache.GetStringAsync(key);
        return data is null ? default : JsonSerializer.Deserialize<T>(data, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new DistributedCacheEntryOptions();
        if (expiration.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiration;
        }

        var data = JsonSerializer.Serialize(value, _jsonOptions);
        await _cache.SetStringAsync(key, data, options);
    }

    public async Task RemoveAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }
}
```

---

## 健康检查

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, "redis");

// ...

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            services = report.Entries.ToDictionary(
                e => e.Key,
                e => new { status = e.Value.Status.ToString() }
            )
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});
```

---

## 测试模板

```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace MyApp.Tests;

public class UsersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // 使用内存数据库
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task CreateUser_ReturnsCreated()
    {
        var dto = new { Email = "test@example.com", Name = "Test", Password = "password123" };

        var response = await _client.PostAsJsonAsync("/api/v1/users", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<UserResponseDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.Equal("test@example.com", result.Data!.Email);
    }

    [Fact]
    public async Task GetUser_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/v1/users/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

---

## 常用命令

```bash
# 开发运行
dotnet run --project src/MyApp.Api
dotnet watch run --project src/MyApp.Api

# 构建
dotnet build
dotnet publish -c Release -o ./publish

# 测试
dotnet test
dotnet test --collect:"XPlat Code Coverage"

# 代码分析
dotnet format
dotnet format --verify-no-changes

# Entity Framework
dotnet ef migrations add InitialCreate --project src/MyApp.Infrastructure --startup-project src/MyApp.Api
dotnet ef database update --project src/MyApp.Infrastructure --startup-project src/MyApp.Api
```

---

## appsettings.json 示例

```json
{
  "Environment": "Development",
  "ConnectionStrings": {
    "Database": "Host=localhost;Database=myapp;Username=postgres;Password=password",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Secret": "your-256-bit-secret-key-here-minimum-32-chars",
    "Issuer": "MyApp",
    "Audience": "MyApp",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```
