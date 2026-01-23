---
paths:
  - "**/tests/**/*"
  - "**/test/**/*"
  - "**/test_*"
  - "**/*_test.*"
  - "**/*Test.*"
  - "**/*Tests.*"
  - "**/*.test.*"
  - "**/*.spec.*"
---

# 测试规范（多语言）

## 通用原则

### 测试命名
- 清晰描述测试目的
- 格式：`test_<功能>_<场景>_<预期结果>`
- 或：`should<预期行为>When<条件>`

### 测试结构（AAA 模式）
```
Arrange  - 准备测试数据和环境
Act      - 执行被测代码
Assert   - 验证结果
```

### 测试覆盖
- 正常路径（Happy Path）
- 边界条件（Boundary）
- 错误处理（Error Cases）
- 空值/空集合处理

---

## Python (pytest)

### 目录结构
```
tests/
├── unit/               # 单元测试
│   ├── test_service.py
│   └── test_utils.py
├── integration/        # 集成测试
│   └── test_api.py
├── conftest.py         # 共享 fixtures
└── fixtures/           # 测试数据
    └── sample.json
```

### 示例
```python
import pytest
from myapp.service import UserService

class TestUserService:
    """用户服务测试"""

    @pytest.fixture
    def service(self):
        return UserService()

    @pytest.mark.asyncio
    async def test_get_user_returns_user_when_exists(self, service):
        """测试获取存在的用户"""
        # Arrange
        user_id = 1

        # Act
        result = await service.get_user(user_id)

        # Assert
        assert result is not None
        assert result.id == user_id

    @pytest.mark.asyncio
    async def test_get_user_raises_when_not_found(self, service):
        """测试获取不存在的用户抛出异常"""
        with pytest.raises(UserNotFoundError):
            await service.get_user(999)
```

### 运行命令
```bash
pytest                          # 运行所有测试
pytest tests/unit/              # 运行单元测试
pytest -v                       # 详细输出
pytest --lf                     # 只运行上次失败的
pytest -k "test_get_user"       # 按名称过滤
pytest --cov=myapp              # 覆盖率报告
```

---

## TypeScript/JavaScript (Vitest/Jest)

### 目录结构
```
src/
├── components/
│   ├── Button.vue
│   └── Button.test.ts
├── services/
│   ├── api.ts
│   └── api.test.ts
└── __tests__/          # 或集中放置
    └── integration/
```

### 示例
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should return user when exists', async () => {
    // Arrange
    const userId = 1;

    // Act
    const result = await service.getUser(userId);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });

  it('should throw when user not found', async () => {
    // Assert
    await expect(service.getUser(999)).rejects.toThrow('User not found');
  });
});
```

### 运行命令
```bash
npm test                # 运行所有测试
npm test -- --watch     # 监听模式
npm test -- --coverage  # 覆盖率
```

---

## Java (JUnit 5)

### 目录结构
```
src/
├── main/java/com/example/
│   └── service/UserService.java
└── test/java/com/example/
    └── service/UserServiceTest.java
```

### 示例
```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService();
    }

    @Test
    @DisplayName("获取存在的用户应返回用户对象")
    void getUserShouldReturnUserWhenExists() {
        // Arrange
        Long userId = 1L;

        // Act
        User result = service.getUser(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
    }

    @Test
    @DisplayName("获取不存在的用户应抛出异常")
    void getUserShouldThrowWhenNotFound() {
        assertThrows(UserNotFoundException.class, () -> {
            service.getUser(999L);
        });
    }
}
```

### 运行命令
```bash
mvn test                        # Maven
gradle test                     # Gradle
mvn test -Dtest=UserServiceTest # 指定类
```

---

## C# (xUnit/NUnit)

### 目录结构
```
src/
├── MyApp/
│   └── Services/UserService.cs
└── MyApp.Tests/
    └── Services/UserServiceTests.cs
```

### 示例 (xUnit)
```csharp
using Xunit;
using MyApp.Services;

public class UserServiceTests
{
    private readonly UserService _service;

    public UserServiceTests()
    {
        _service = new UserService();
    }

    [Fact]
    public async Task GetUser_ReturnsUser_WhenExists()
    {
        // Arrange
        var userId = 1;

        // Act
        var result = await _service.GetUserAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
    }

    [Fact]
    public async Task GetUser_ThrowsException_WhenNotFound()
    {
        // Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _service.GetUserAsync(999)
        );
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public async Task GetUser_ReturnsUser_ForValidIds(int userId)
    {
        var result = await _service.GetUserAsync(userId);
        Assert.NotNull(result);
    }
}
```

### 运行命令
```bash
dotnet test                     # 运行所有测试
dotnet test --filter "FullyQualifiedName~UserService"
dotnet test --collect:"XPlat Code Coverage"
```

---

## C++ (Google Test)

### 目录结构
```
src/
├── audio_processor.cpp
├── audio_processor.h
└── tests/
    ├── audio_processor_test.cpp
    └── CMakeLists.txt
```

### 示例
```cpp
#include <gtest/gtest.h>
#include "audio_processor.h"

class AudioProcessorTest : public ::testing::Test {
protected:
    void SetUp() override {
        processor = std::make_unique<AudioProcessor>();
    }

    std::unique_ptr<AudioProcessor> processor;
};

TEST_F(AudioProcessorTest, ProcessReturnsValidResultForValidInput) {
    // Arrange
    AudioData input = CreateTestAudio();

    // Act
    auto result = processor->Process(input);

    // Assert
    EXPECT_TRUE(result.IsValid());
    EXPECT_GT(result.GetDuration(), 0);
}

TEST_F(AudioProcessorTest, ProcessThrowsForEmptyInput) {
    // Arrange
    AudioData emptyInput;

    // Assert
    EXPECT_THROW(processor->Process(emptyInput), std::invalid_argument);
}
```

### 运行命令
```bash
cmake --build build
ctest --test-dir build
./build/tests/audio_processor_test
```
