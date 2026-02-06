---
paths:
  - "**/*"
alwaysApply: true
---

# 前端测试规范 | Frontend Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供前端特定测试规范

## 禁止操作

### 快照测试滥用

```typescript
// ❌ 对整个页面做快照，维护成本极高
it("renders page", () => {
  const { container } = render(<DashboardPage />);
  expect(container).toMatchSnapshot();
});

// ✅ 仅对稳定的小型 UI 单元做快照
it("renders icon correctly", () => {
  const { container } = render(<StatusIcon status="success" />);
  expect(container.firstChild).toMatchInlineSnapshot(`
    <svg class="icon icon-success" />
  `);
});
```

### 直接操作 DOM 而非使用 Testing Library 查询

```typescript
// ❌ 使用 CSS 选择器，与实现强耦合
const button = container.querySelector(".btn-primary");

// ✅ 使用语义化查询，贴近用户行为
const button = screen.getByRole("button", { name: "提交订单" });
```

### Mock 整个模块而不恢复

```typescript
// ❌ 全局 mock 污染其他测试
jest.mock("@/services/api");

// ✅ 在测试内局部 mock，自动清理
import { vi } from "vitest";
const fetchSpy = vi.spyOn(api, "fetchUser").mockResolvedValue(mockUser);
afterEach(() => vi.restoreAllMocks());
```

---

## 必须遵守

### Jest/Vitest 配置隔离

测试配置必须区分单元测试与集成测试环境：

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      exclude: ["**/*.d.ts", "**/*.stories.tsx"],
    },
  },
});
```

### React Testing Library 标准模式

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("LoginForm", () => {
  it("should call onSubmit with credentials when form submitted", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Act
    await user.type(screen.getByLabelText("邮箱"), "test@example.com");
    await user.type(screen.getByLabelText("密码"), "password123");
    await user.click(screen.getByRole("button", { name: "登录" }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
```

### Vue Test Utils 标准模式

```typescript
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import UserProfile from "@/components/UserProfile.vue";

describe("UserProfile", () => {
  it("should display user name from store", () => {
    // Arrange & Act
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [
          createTestingPinia({ initialState: { user: { name: "张三" } } }),
        ],
      },
    });

    // Assert
    expect(wrapper.text()).toContain("张三");
  });
});
```

### Mock 边界原则

只 mock 以下内容，其他应使用真实实现：

- **网络请求** — 使用 MSW (Mock Service Worker) 拦截
- **浏览器 API** — `localStorage`、`IntersectionObserver` 等
- **时间相关** — `vi.useFakeTimers()` 控制定时器
- **第三方服务** — 支付、地图等外部 SDK

```typescript
// ✅ 使用 MSW 拦截网络请求
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/user/:id", ({ params }) => {
    return HttpResponse.json({ id: params.id, name: "测试用户" });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 推荐做法

### E2E 与单元测试分层策略

| 测试层级 | 工具            | 覆盖目标               | 执行频率   |
| -------- | --------------- | ---------------------- | ---------- |
| 单元测试 | Vitest          | 工具函数、Hooks、Store | 每次提交   |
| 组件测试 | Testing Library | 组件交互、渲染逻辑     | 每次提交   |
| E2E 测试 | Playwright      | 关键用户流程           | CI/CD 管道 |

### 组件测试优先级

1. **用户交互** — 表单提交、按钮点击、输入验证
2. **条件渲染** — 根据 props/state 显示不同内容
3. **异步状态** — 加载态、错误态、空数据态
4. **无障碍** — ARIA 属性、键盘导航

### 自定义 Hook 测试

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "@/hooks/useCounter";

it("should increment counter", () => {
  const { result } = renderHook(() => useCounter(0));
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```
