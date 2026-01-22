---
name: tdd-workflow
description: "TDD 工作流技能：测试驱动开发的完整指南。Use when writing new features, fixing bugs, or refactoring code. Enforces test-first methodology with 80%+ coverage."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# 测试驱动开发工作流

本技能确保所有代码开发遵循 TDD 原则，实现全面的测试覆盖。

## 触发条件

- 编写新功能或特性
- 修复 Bug（先写复现 Bug 的测试）
- 重构现有代码
- 添加 API 端点
- 创建新组件
- 实现核心业务逻辑

## 与角色系统的配合

| 角色 | TDD 使用场景 |
|------|-------------|
| `/lead` | 定义测试策略、审查测试覆盖率 |
| `/dev` | 执行 TDD 循环、编写测试和实现 |
| `/qa` | 补充边界测试、E2E 测试 |

**典型流程**：
```
/lead → 定义接口和测试策略
  ↓
/dev → TDD 循环（RED → GREEN → REFACTOR）
  ↓
/qa → 验证覆盖率、补充边界测试
  ↓
/commit → 提交代码和测试
```

---

## 核心原则

### 1. 测试先于代码
**永远**先写测试，再写实现代码使测试通过。

### 2. TDD 循环

```
RED → GREEN → REFACTOR → REPEAT

RED:      写一个失败的测试
GREEN:    写最少的代码使测试通过
REFACTOR: 改进代码，保持测试绿色
REPEAT:   下一个场景
```

### 3. 覆盖率要求

| 代码类型 | 覆盖率要求 |
|----------|-----------|
| 普通业务代码 | 80%+ |
| 金融计算 | 100% |
| 认证逻辑 | 100% |
| 安全关键代码 | 100% |
| 核心业务逻辑 | 100% |

---

## 完整 TDD 示例

以下是一个完整的 TDD 会话示例，展示从需求到实现的全过程。

### 场景：实现用户积分计算器

#### Step 1: 用户故事

```markdown
作为用户，我想要根据我的活动计算积分，
以便了解我的会员等级和可兑换奖励。

验收标准：
- 购买金额每 10 元 = 1 积分
- 连续签到天数 × 2 = 额外积分
- VIP 用户积分翻倍
- 积分上限：每月 10000 分
```

#### Step 2: 定义接口（SCAFFOLD）

```typescript
// src/services/points.ts

export interface UserActivity {
  purchaseAmount: number      // 购买金额（元）
  consecutiveCheckIns: number // 连续签到天数
  isVip: boolean              // 是否 VIP
  currentMonthPoints: number  // 本月已有积分
}

export interface PointsResult {
  earnedPoints: number    // 本次获得积分
  totalPoints: number     // 累计积分
  capped: boolean         // 是否触发上限
  cappedAmount: number    // 被限制的积分数
}

export function calculatePoints(activity: UserActivity): PointsResult {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

#### Step 3: 写失败的测试（RED）

```typescript
// src/services/points.test.ts

import { calculatePoints, type UserActivity } from './points'

describe('calculatePoints', () => {
  // 基础场景
  describe('基础积分计算', () => {
    it('购买金额每 10 元获得 1 积分', () => {
      const activity: UserActivity = {
        purchaseAmount: 100,
        consecutiveCheckIns: 0,
        isVip: false,
        currentMonthPoints: 0
      }

      const result = calculatePoints(activity)

      expect(result.earnedPoints).toBe(10)
      expect(result.totalPoints).toBe(10)
      expect(result.capped).toBe(false)
    })

    it('连续签到天数 × 2 = 额外积分', () => {
      const activity: UserActivity = {
        purchaseAmount: 0,
        consecutiveCheckIns: 7,
        isVip: false,
        currentMonthPoints: 0
      }

      const result = calculatePoints(activity)

      expect(result.earnedPoints).toBe(14) // 7 × 2
    })

    it('组合计算购买积分和签到积分', () => {
      const activity: UserActivity = {
        purchaseAmount: 50,
        consecutiveCheckIns: 5,
        isVip: false,
        currentMonthPoints: 100
      }

      const result = calculatePoints(activity)

      expect(result.earnedPoints).toBe(15) // 5 + 10
      expect(result.totalPoints).toBe(115) // 100 + 15
    })
  })

  // VIP 场景
  describe('VIP 用户', () => {
    it('VIP 用户积分翻倍', () => {
      const activity: UserActivity = {
        purchaseAmount: 100,
        consecutiveCheckIns: 5,
        isVip: true,
        currentMonthPoints: 0
      }

      const result = calculatePoints(activity)

      // 基础: (10 + 10) = 20，VIP 翻倍: 40
      expect(result.earnedPoints).toBe(40)
    })
  })

  // 边界场景
  describe('边界情况', () => {
    it('触发月度积分上限', () => {
      const activity: UserActivity = {
        purchaseAmount: 10000,
        consecutiveCheckIns: 30,
        isVip: true,
        currentMonthPoints: 9500
      }

      const result = calculatePoints(activity)

      // 应该只获得 500 分（达到上限）
      expect(result.earnedPoints).toBe(500)
      expect(result.totalPoints).toBe(10000)
      expect(result.capped).toBe(true)
      expect(result.cappedAmount).toBeGreaterThan(0)
    })

    it('零购买和零签到返回零积分', () => {
      const activity: UserActivity = {
        purchaseAmount: 0,
        consecutiveCheckIns: 0,
        isVip: false,
        currentMonthPoints: 0
      }

      const result = calculatePoints(activity)

      expect(result.earnedPoints).toBe(0)
    })

    it('负数购买金额视为零', () => {
      const activity: UserActivity = {
        purchaseAmount: -100,
        consecutiveCheckIns: 5,
        isVip: false,
        currentMonthPoints: 0
      }

      const result = calculatePoints(activity)

      expect(result.earnedPoints).toBe(10) // 只有签到积分
    })
  })
})
```

#### Step 4: 运行测试，确认失败

```bash
npm test src/services/points.test.ts

# 预期输出：
FAIL src/services/points.test.ts
  ● calculatePoints › 基础积分计算 › 购买金额每 10 元获得 1 积分
    Error: Not implemented

  6 tests failed
```

✅ 测试按预期失败，可以开始实现。

#### Step 5: 实现最少代码（GREEN）

```typescript
// src/services/points.ts

const POINTS_PER_10_YUAN = 1
const CHECKIN_MULTIPLIER = 2
const VIP_MULTIPLIER = 2
const MONTHLY_CAP = 10000

export function calculatePoints(activity: UserActivity): PointsResult {
  // 计算购买积分
  const purchasePoints = Math.max(0, Math.floor(activity.purchaseAmount / 10)) * POINTS_PER_10_YUAN

  // 计算签到积分
  const checkInPoints = Math.max(0, activity.consecutiveCheckIns) * CHECKIN_MULTIPLIER

  // 基础积分
  let basePoints = purchasePoints + checkInPoints

  // VIP 翻倍
  if (activity.isVip) {
    basePoints *= VIP_MULTIPLIER
  }

  // 应用月度上限
  const remainingCap = MONTHLY_CAP - activity.currentMonthPoints
  const earnedPoints = Math.min(basePoints, remainingCap)
  const capped = basePoints > remainingCap
  const cappedAmount = capped ? basePoints - earnedPoints : 0

  return {
    earnedPoints,
    totalPoints: activity.currentMonthPoints + earnedPoints,
    capped,
    cappedAmount
  }
}
```

#### Step 6: 运行测试，确认通过

```bash
npm test src/services/points.test.ts

# 预期输出：
PASS src/services/points.test.ts
  calculatePoints
    基础积分计算
      ✓ 购买金额每 10 元获得 1 积分 (2 ms)
      ✓ 连续签到天数 × 2 = 额外积分 (1 ms)
      ✓ 组合计算购买积分和签到积分 (1 ms)
    VIP 用户
      ✓ VIP 用户积分翻倍 (1 ms)
    边界情况
      ✓ 触发月度积分上限 (1 ms)
      ✓ 零购买和零签到返回零积分 (1 ms)
      ✓ 负数购买金额视为零 (1 ms)

7 tests passed
```

✅ 所有测试通过！

#### Step 7: 重构（REFACTOR）

```typescript
// src/services/points.ts - 重构版本

/** 积分配置常量 */
const CONFIG = {
  POINTS_PER_YUAN: 0.1,         // 每元积分
  CHECKIN_MULTIPLIER: 2,        // 签到倍率
  VIP_MULTIPLIER: 2,            // VIP 倍率
  MONTHLY_CAP: 10000,           // 月度上限
} as const

/**
 * 确保数值非负
 */
function nonNegative(value: number): number {
  return Math.max(0, value)
}

/**
 * 计算购买获得的积分
 */
function calculatePurchasePoints(amount: number): number {
  return Math.floor(nonNegative(amount) * CONFIG.POINTS_PER_YUAN)
}

/**
 * 计算签到获得的积分
 */
function calculateCheckInPoints(days: number): number {
  return nonNegative(days) * CONFIG.CHECKIN_MULTIPLIER
}

/**
 * 应用 VIP 倍率
 */
function applyVipMultiplier(points: number, isVip: boolean): number {
  return isVip ? points * CONFIG.VIP_MULTIPLIER : points
}

/**
 * 应用月度积分上限
 */
function applyMonthlyCap(
  points: number,
  currentMonthPoints: number
): { earnedPoints: number; capped: boolean; cappedAmount: number } {
  const remainingCap = CONFIG.MONTHLY_CAP - currentMonthPoints
  const earnedPoints = Math.min(points, remainingCap)
  const capped = points > remainingCap

  return {
    earnedPoints,
    capped,
    cappedAmount: capped ? points - earnedPoints : 0
  }
}

/**
 * 计算用户活动积分
 *
 * @param activity - 用户活动数据
 * @returns 积分计算结果
 */
export function calculatePoints(activity: UserActivity): PointsResult {
  const purchasePoints = calculatePurchasePoints(activity.purchaseAmount)
  const checkInPoints = calculateCheckInPoints(activity.consecutiveCheckIns)

  const basePoints = applyVipMultiplier(
    purchasePoints + checkInPoints,
    activity.isVip
  )

  const { earnedPoints, capped, cappedAmount } = applyMonthlyCap(
    basePoints,
    activity.currentMonthPoints
  )

  return {
    earnedPoints,
    totalPoints: activity.currentMonthPoints + earnedPoints,
    capped,
    cappedAmount
  }
}
```

#### Step 8: 再次运行测试 + 覆盖率

```bash
npm test -- --coverage src/services/points.test.ts

# 预期输出：
PASS src/services/points.test.ts
  7 tests passed

----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
points.ts             |   100   |   100    |   100   |   100   |
----------------------|---------|----------|---------|---------|

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD 会话完成！

---

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
describe('GET /api/users', () => {
  it('成功返回用户列表', async () => {
    const response = await fetch('/api/users')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('验证查询参数', async () => {
    const response = await fetch('/api/users?limit=invalid')
    expect(response.status).toBe(400)
  })

  it('Redis 不可用时回退到数据库', async () => {
    vi.spyOn(redis, 'get').mockRejectedValue(new Error('Redis down'))

    const response = await fetch('/api/users')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.fallback).toBe(true)
  })
})
```

### E2E 测试 (Playwright)

测试完整用户流程：

```typescript
import { test, expect } from '@playwright/test'

test('用户可以搜索和筛选', async ({ page }) => {
  await page.goto('/products')
  await expect(page.locator('h1')).toContainText('产品')

  // 搜索
  await page.fill('input[placeholder="搜索"]', '关键词')
  await page.waitForTimeout(600) // 等待防抖

  // 验证结果
  const results = page.locator('[data-testid="product-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // 筛选
  await page.click('button:has-text("在售")')
  await expect(results).toHaveCount(3)
})
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
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: mockUsers,
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis Mock

```typescript
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(() => Promise.resolve(JSON.stringify(mockData))),
    set: vi.fn(() => Promise.resolve('OK')),
    del: vi.fn(() => Promise.resolve(1))
  }
}))
```

### API Client Mock

```typescript
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: mockResponse })),
    post: vi.fn(() => Promise.resolve({ data: { id: 'new_id' } }))
  }
}))
```

---

## 必须测试的边界情况

| 类型 | 示例 | 测试目的 |
|------|------|----------|
| Null/Undefined | `null`, `undefined` | 空值处理 |
| 空值 | `""`, `[]`, `{}` | 空集合处理 |
| 边界值 | `0`, `1`, `-1`, `MAX_INT` | 边界行为 |
| 类型错误 | 传入错误类型 | 类型防御 |
| 网络错误 | 请求失败、超时 | 错误恢复 |
| 并发 | 同时多个请求 | 竞态条件 |
| 大数据 | 10000+ 条记录 | 性能边界 |
| 特殊字符 | Unicode、Emoji、SQL 注入 | 安全边界 |

---

## 测试反模式

### ❌ 测试实现细节

```typescript
// 错误：测试内部状态
expect(component.state.count).toBe(5)
```

### ✅ 测试用户可见行为

```typescript
// 正确：测试用户看到的内容
expect(screen.getByText('计数: 5')).toBeInTheDocument()
```

### ❌ 测试相互依赖

```typescript
// 错误：依赖前一个测试的状态
test('创建用户', () => { /* ... */ })
test('更新同一用户', () => { /* 依赖上一个测试 */ })
```

### ✅ 测试相互独立

```typescript
// 正确：每个测试独立设置数据
test('创建用户', () => {
  const user = createTestUser()
  // 测试逻辑
})

test('更新用户', () => {
  const user = createTestUser()
  // 独立的测试数据
})
```

### ❌ 脆弱的选择器

```typescript
// 错误：依赖 CSS 类名
await page.click('.css-class-xyz')
```

### ✅ 语义化选择器

```typescript
// 正确：使用语义化选择器
await page.click('button:has-text("提交")')
await page.click('[data-testid="submit-button"]')
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

---

## 覆盖率配置

### Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})
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

## 测试质量检查清单

### 提交前检查

- [ ] 所有公共函数有单元测试
- [ ] 所有 API 端点有集成测试
- [ ] 关键用户流程有 E2E 测试
- [ ] 边界情况已覆盖（null、空、无效）
- [ ] 错误路径已测试（不只是 happy path）
- [ ] 外部依赖已 Mock
- [ ] 测试相互独立（无共享状态）
- [ ] 测试名称描述清晰
- [ ] 断言具体且有意义
- [ ] 覆盖率达到 80%+

### 持续集成

```bash
# 推荐的 CI 命令
npm test -- --coverage --ci --reporter=dot
```

---

## 最佳实践

1. **测试先行** - 始终 TDD，先写测试
2. **单一断言** - 每个测试聚焦一个行为
3. **描述性命名** - 清楚说明测试什么
4. **AAA 模式** - Arrange-Act-Assert 结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边界** - null、undefined、空、大值
7. **测试错误路径** - 不只测试 happy path
8. **保持快速** - 单元测试 < 50ms
9. **清理副作用** - 测试后无残留
10. **审查覆盖报告** - 识别盲点

---

## 成功指标

- ✅ 80%+ 代码覆盖率
- ✅ 所有测试通过（绿色）
- ✅ 无跳过或禁用的测试
- ✅ 快速执行（单元测试 < 30s）
- ✅ E2E 覆盖关键用户流程

---

**记住**：测试不是可选项。它是支持自信重构、快速开发和生产可靠性的安全网。

> **TDD 格言**：没有测试的代码就是遗留代码。
