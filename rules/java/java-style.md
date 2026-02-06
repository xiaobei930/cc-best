---
paths:
  - "**/*.java"
---

# Java 代码风格规则

## 格式化
- 使用 google-java-format 或 IDE 内置格式化
- 行宽：100 字符

## 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 类/接口 | PascalCase | `AudioService`, `Processable` |
| 方法 | camelCase | `processAudio()`, `getUserById()` |
| 变量 | camelCase | `audioData`, `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_BUFFER_SIZE` |
| 包名 | 全小写，点分隔 | `com.project.audio` |

## 导入规范
```java
// 按字母排序，禁止通配符
import java.io.IOException;
import java.util.List;

import javax.annotation.Nullable;

import org.springframework.stereotype.Service;

import com.project.common.Logger;
```

## 异常处理
```java
// ✅ 使用 try-with-resources
try (InputStream is = new FileInputStream(file)) {
    // 处理文件
} catch (IOException e) {
    LOGGER.error("读取文件失败: {}", file, e);
    throw new RuntimeException("文件读取错误", e);
}
```

## Optional 使用
```java
// ✅ 正确使用 Optional
String name = findUser(id)
    .map(User::getName)
    .orElse("未知用户");
```
