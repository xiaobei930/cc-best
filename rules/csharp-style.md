---
paths:
  - "**/*.cs"
---

# C# 代码风格规则

## 格式化
- 使用 `dotnet format` 或 IDE 内置格式化
- 配置文件：`.editorconfig`（推荐）

## 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 类/接口 | PascalCase | `AudioService`, `IProcessor` |
| 方法/属性 | PascalCase | `ProcessAudio()`, `UserName` |
| 私有字段 | _camelCase | `_audioBuffer` |
| 参数/局部变量 | camelCase | `audioData` |
| 常量 | PascalCase | `MaxBufferSize` |

## 异步编程
```csharp
// ✅ 异步方法以 Async 后缀命名
public async Task<User> GetUserAsync(int id)
{
    return await _repository.FindByIdAsync(id);
}

// ❌ 避免 .Result 或 .Wait() 阻塞
var user = GetUserAsync(id).Result;  // 可能死锁
```

## 空值处理
```csharp
// ✅ 空值合并运算符
string name = user?.Name ?? "默认名称";

// ✅ 参数空值检查
ArgumentNullException.ThrowIfNull(data);
```

## 模式匹配
```csharp
// ✅ switch 表达式
string GetDescription(Format format) => format switch
{
    Format.Mp3 => "MP3 格式",
    Format.Wav => "WAV 格式",
    _ => "未知格式"
};
```
