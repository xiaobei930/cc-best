# 测试框架与配置

本文件包含各测试框架的配置、Mock 模式和常用命令参考。

## 测试类型

### 单元测试

测试独立函数和纯逻辑：

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button 组件', () => {
  it('渲染正确的文本', () => {
    render(<Button>点击我</Button>)
    expect(screen.getByText('点击我')).toBeInTheDocument()
  })

  it('点击时调用 onClick', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>点击</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 为 true 时禁用', () => {
    render(<Button disabled>点击</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 集成测试

测试 API 端点和数据库操作：

```typescript
describe("GET /api/users", () => {
  it("成功返回用户列表", async () => {
    const response = await fetch("/api/users");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("验证查询参数", async () => {
    const response = await fetch("/api/users?limit=invalid");
    expect(response.status).toBe(400);
  });

  it("Redis 不可用时回退到数据库", async () => {
    vi.spyOn(redis, "get").mockRejectedValue(new Error("Redis down"));

    const response = await fetch("/api/users");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fallback).toBe(true);
  });
});
```

### E2E 测试 (Playwright)

测试完整用户流程：

```typescript
import { test, expect } from "@playwright/test";

test("用户可以搜索和筛选", async ({ page }) => {
  await page.goto("/products");
  await expect(page.locator("h1")).toContainText("产品");

  // 搜索
  await page.fill('input[placeholder="搜索"]', "关键词");
  await page.waitForTimeout(600); // 等待防抖

  // 验证结果
  const results = page.locator('[data-testid="product-card"]');
  await expect(results).toHaveCount(5, { timeout: 5000 });

  // 筛选
  await page.click('button:has-text("在售")');
  await expect(results).toHaveCount(3);
});
```

### Python 测试 (pytest)

```python
import pytest
from unittest.mock import AsyncMock, patch

class TestUserService:
    @pytest.fixture
    def service(self):
        return UserService()

    @pytest.mark.asyncio
    async def test_happy_path(self, service):
        result = await service.get_user("user_id")
        assert result is not None
        assert result.id == "user_id"

    @pytest.mark.parametrize("input,expected", [
        ("valid@email.com", True),
        ("invalid", False),
    ])
    def test_email_validation(self, input, expected):
        assert validate_email(input) == expected

    def test_raises_on_not_found(self, service):
        with pytest.raises(UserNotFoundError):
            service.get_user("nonexistent")
```

---

## Mock 外部依赖

### Supabase Mock

```typescript
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: mockUsers,
            error: null,
          }),
        ),
      })),
    })),
  },
}));
```

### Redis Mock

```typescript
vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(() => Promise.resolve(JSON.stringify(mockData))),
    set: vi.fn(() => Promise.resolve("OK")),
    del: vi.fn(() => Promise.resolve(1)),
  },
}));
```

### API Client Mock

```typescript
vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: mockResponse })),
    post: vi.fn(() => Promise.resolve({ data: { id: "new_id" } })),
  },
}));
```

---

## 覆盖率配置

### Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Jest

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### pytest

```ini
# pytest.ini
[pytest]
addopts = --cov=src --cov-report=html --cov-fail-under=80
```

---

## 常用命令

```bash
# 运行测试
npm test                          # Vitest/Jest
pytest                            # Python

# 监视模式
npm test -- --watch               # JS/TS
pytest-watch                      # Python

# 覆盖率报告
npm run test:coverage             # JS/TS
pytest --cov=src --cov-report=html  # Python

# 单个文件
npm test -- Button.test.tsx       # JS/TS
pytest tests/test_user.py         # Python

# E2E 测试
npx playwright test               # Playwright
```

---

## 测试文件组织

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx      # 单元测试
│   │   └── Button.stories.tsx   # Storybook
├── services/
│   ├── points.ts
│   └── points.test.ts           # 服务测试
├── app/
│   └── api/
│       └── users/
│           ├── route.ts
│           └── route.test.ts    # API 集成测试
└── e2e/
    ├── auth.spec.ts             # E2E 测试
    └── user-flow.spec.ts
```
