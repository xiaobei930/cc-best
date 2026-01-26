# E2E 测试技能

本技能提供 Playwright 端到端测试的完整指南，包括测试结构、Page Object Model、Flaky Test 管理等最佳实践。

## 何时编写 E2E 测试

| 场景                       | 是否需要 E2E |
| -------------------------- | ------------ |
| 核心用户流程（登录、支付） | ✅ 必须      |
| 重要表单提交               | ✅ 必须      |
| 关键页面导航               | ⚠️ 推荐      |
| 简单展示页面               | ❌ 不需要    |

## Playwright 测试结构

```
tests/
├── e2e/                       # E2E 测试目录
│   ├── auth/                  # 认证流程
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── core/                  # 核心功能
│   │   └── main-flow.spec.ts
│   └── api/                   # API 测试
│       └── endpoints.spec.ts
├── pages/                     # Page Object Model
│   ├── LoginPage.ts
│   └── DashboardPage.ts
└── playwright.config.ts
```

## Page Object Model 模式

```typescript
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.submitButton = page.locator('[data-testid="submit"]');
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }
}
```

## E2E 测试模板

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("用户登录", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("正常登录成功", async ({ page }) => {
    // Arrange - 准备
    await expect(page).toHaveTitle(/登录/);

    // Act - 执行
    await loginPage.login("testuser", "password123");

    // Assert - 断言
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
  });

  test("错误密码显示提示", async ({ page }) => {
    await loginPage.login("testuser", "wrongpassword");

    await expect(page.locator('[data-testid="error"]')).toContainText(
      "密码错误",
    );
  });
});
```

## Flaky Test 管理

### 识别 Flaky Test

```bash
# 运行多次检测稳定性
npx playwright test tests/xxx.spec.ts --repeat-each=5
```

### 隔离 Flaky Test

```typescript
// 标记为待修复
test("可能不稳定的测试", async ({ page }) => {
  test.fixme(true, "Test is flaky - Issue #123");
  // ...
});

// 在 CI 中跳过
test("CI 环境不稳定", async ({ page }) => {
  test.skip(process.env.CI, "Flaky in CI - Issue #456");
  // ...
});
```

### 常见 Flaky 原因与修复

| 原因       | 修复方案                          |
| ---------- | --------------------------------- |
| 元素未加载 | 使用 `locator.click()` 自动等待   |
| 网络延迟   | `waitForResponse()` 等待 API      |
| 动画未完成 | `waitForLoadState('networkidle')` |
| 时间依赖   | Mock 时间或使用相对时间           |

## E2E 测试命令

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行指定文件
npx playwright test tests/e2e/auth/login.spec.ts

# 可视化运行（调试用）
npx playwright test --headed

# 调试模式
npx playwright test --debug

# 生成测试代码
npx playwright codegen http://localhost:3000

# 查看报告
npx playwright show-report
```

## E2E 测试报告模板

```markdown
## E2E 测试报告

**运行时间**: YYYY-MM-DD HH:MM
**总耗时**: Xm Ys

### 结果汇总

- 总计: X 个测试
- 通过: Y 个 (Z%)
- 失败: A 个
- 跳过: B 个

### 失败测试

#### 1. tests/e2e/auth/login.spec.ts:25

**测试名称**: 错误密码显示提示
**错误**: Expected element to be visible
**截图**: artifacts/login-error-failed.png

**复现步骤**:

1. 打开 /login
2. 输入错误密码
3. 点击提交

**可能原因**: 错误提示元素 selector 变更
```

## Playwright 配置模板

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## 最佳实践

1. **使用 Page Object Model** - 封装页面操作，提高可维护性
2. **遵循 AAA 模式** - Arrange → Act → Assert
3. **使用 data-testid** - 稳定的选择器策略
4. **隔离测试数据** - 每个测试独立，不依赖其他测试状态
5. **管理 Flaky Tests** - 标记、隔离、修复
6. **截图记录** - 失败时自动截图便于调试
7. **并行执行** - 利用多 worker 加速测试

## 与 /qa 角色的配合

```
/qa 功能验收
    ↓
  手动测试 + 单元测试
    ↓
E2E 测试（核心流程）
    ↓
  全部通过 → /commit
  有失败 → 修复 → 重新测试
```
