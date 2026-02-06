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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "./UserService";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it("should return user when exists", async () => {
    // Arrange
    const userId = 1;

    // Act
    const result = await service.getUser(userId);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });

  it("should throw when user not found", async () => {
    // Assert
    await expect(service.getUser(999)).rejects.toThrow("User not found");
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

---

## E2E 测试 (Playwright)

### 目录结构

```
e2e/
├── tests/
│   ├── auth.spec.ts        # 认证流程
│   ├── checkout.spec.ts    # 结账流程
│   └── search.spec.ts      # 搜索功能
├── pages/                  # 页面对象
│   ├── LoginPage.ts
│   └── HomePage.ts
├── fixtures/               # 测试数据
│   └── users.json
└── playwright.config.ts
```

### 页面对象模式

```typescript
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/cc-best:test";

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel("邮箱");
    this.passwordInput = page.getByLabel("密码");
    this.submitButton = page.getByRole("button", { name: "登录" });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 测试示例

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/cc-best:test";
import { LoginPage } from "../pages/LoginPage";

test.describe("用户认证", () => {
  test("成功登录后跳转到首页", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.login("user@example.com", "password123");

    // Assert
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("欢迎")).toBeVisible();
  });

  test("错误密码显示错误提示", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("user@example.com", "wrong-password");

    await expect(page.getByText("密码错误")).toBeVisible();
  });
});
```

### 等待策略

```typescript
// ✅ 推荐：使用语义化等待
await page.getByRole("button").click();
await expect(page.getByText("加载完成")).toBeVisible();

// ✅ 等待网络请求完成
await Promise.all([
  page.waitForResponse("**/api/users"),
  page.getByText("保存").click(),
]);

// ❌ 避免：硬编码等待
await page.waitForTimeout(3000); // 不稳定
```

### 配置示例

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/cc-best:test";

export default defineConfig({
  testDir: "./e2e/tests",
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry", // 失败时保存 trace
    screenshot: "only-on-failure", // 失败时截图
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 运行命令

```bash
npx playwright test                 # 运行所有测试
npx playwright test --ui            # UI 模式（调试）
npx playwright test --headed        # 显示浏览器
npx playwright test auth.spec.ts    # 指定文件
npx playwright show-report          # 查看报告
npx playwright codegen              # 录制生成代码
```

### E2E 最佳实践

- **隔离测试数据** - 每个测试使用独立数据，避免相互影响
- **使用页面对象** - 封装页面操作，提高可维护性
- **语义化选择器** - 优先 `getByRole`、`getByLabel`，避免脆弱的 CSS 选择器
- **合理的等待** - 使用 `expect().toBeVisible()` 而非固定等待
- **并行运行** - 配置 `workers` 加速测试
- **失败时保存证据** - 截图、视频、trace 便于排查
