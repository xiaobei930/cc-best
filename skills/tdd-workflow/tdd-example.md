# 完整 TDD 示例

本文件展示一个完整的 TDD 会话示例，从需求到实现的全过程。

## 场景：实现用户积分计算器

### Step 1: 用户故事

```markdown
作为用户，我想要根据我的活动计算积分，
以便了解我的会员等级和可兑换奖励。

验收标准：

- 购买金额每 10 元 = 1 积分
- 连续签到天数 × 2 = 额外积分
- VIP 用户积分翻倍
- 积分上限：每月 10000 分
```

### Step 2: 定义接口（SCAFFOLD）

```typescript
// src/services/points.ts

export interface UserActivity {
  purchaseAmount: number; // 购买金额（元）
  consecutiveCheckIns: number; // 连续签到天数
  isVip: boolean; // 是否 VIP
  currentMonthPoints: number; // 本月已有积分
}

export interface PointsResult {
  earnedPoints: number; // 本次获得积分
  totalPoints: number; // 累计积分
  capped: boolean; // 是否触发上限
  cappedAmount: number; // 被限制的积分数
}

export function calculatePoints(activity: UserActivity): PointsResult {
  // TODO: Implementation
  throw new Error("Not implemented");
}
```

### Step 3: 写失败的测试（RED）

```typescript
// src/services/points.test.ts

import { calculatePoints, type UserActivity } from "./points";

describe("calculatePoints", () => {
  // 基础场景
  describe("基础积分计算", () => {
    it("购买金额每 10 元获得 1 积分", () => {
      const activity: UserActivity = {
        purchaseAmount: 100,
        consecutiveCheckIns: 0,
        isVip: false,
        currentMonthPoints: 0,
      };

      const result = calculatePoints(activity);

      expect(result.earnedPoints).toBe(10);
      expect(result.totalPoints).toBe(10);
      expect(result.capped).toBe(false);
    });

    it("连续签到天数 × 2 = 额外积分", () => {
      const activity: UserActivity = {
        purchaseAmount: 0,
        consecutiveCheckIns: 7,
        isVip: false,
        currentMonthPoints: 0,
      };

      const result = calculatePoints(activity);

      expect(result.earnedPoints).toBe(14); // 7 × 2
    });

    it("组合计算购买积分和签到积分", () => {
      const activity: UserActivity = {
        purchaseAmount: 50,
        consecutiveCheckIns: 5,
        isVip: false,
        currentMonthPoints: 100,
      };

      const result = calculatePoints(activity);

      expect(result.earnedPoints).toBe(15); // 5 + 10
      expect(result.totalPoints).toBe(115); // 100 + 15
    });
  });

  // VIP 场景
  describe("VIP 用户", () => {
    it("VIP 用户积分翻倍", () => {
      const activity: UserActivity = {
        purchaseAmount: 100,
        consecutiveCheckIns: 5,
        isVip: true,
        currentMonthPoints: 0,
      };

      const result = calculatePoints(activity);

      // 基础: (10 + 10) = 20，VIP 翻倍: 40
      expect(result.earnedPoints).toBe(40);
    });
  });

  // 边界场景
  describe("边界情况", () => {
    it("触发月度积分上限", () => {
      const activity: UserActivity = {
        purchaseAmount: 10000,
        consecutiveCheckIns: 30,
        isVip: true,
        currentMonthPoints: 9500,
      };

      const result = calculatePoints(activity);

      // 应该只获得 500 分（达到上限）
      expect(result.earnedPoints).toBe(500);
      expect(result.totalPoints).toBe(10000);
      expect(result.capped).toBe(true);
      expect(result.cappedAmount).toBeGreaterThan(0);
    });

    it("零购买和零签到返回零积分", () => {
      const activity: UserActivity = {
        purchaseAmount: 0,
        consecutiveCheckIns: 0,
        isVip: false,
        currentMonthPoints: 0,
      };

      const result = calculatePoints(activity);

      expect(result.earnedPoints).toBe(0);
    });

    it("负数购买金额视为零", () => {
      const activity: UserActivity = {
        purchaseAmount: -100,
        consecutiveCheckIns: 5,
        isVip: false,
        currentMonthPoints: 0,
      };

      const result = calculatePoints(activity);

      expect(result.earnedPoints).toBe(10); // 只有签到积分
    });
  });
});
```

### Step 4: 运行测试，确认失败

```bash
npm test src/services/points.test.ts

# 预期输出：
FAIL src/services/points.test.ts
  ● calculatePoints › 基础积分计算 › 购买金额每 10 元获得 1 积分
    Error: Not implemented

  6 tests failed
```

✅ 测试按预期失败，可以开始实现。

### Step 5: 实现最少代码（GREEN）

```typescript
// src/services/points.ts

const POINTS_PER_10_YUAN = 1;
const CHECKIN_MULTIPLIER = 2;
const VIP_MULTIPLIER = 2;
const MONTHLY_CAP = 10000;

export function calculatePoints(activity: UserActivity): PointsResult {
  // 计算购买积分
  const purchasePoints =
    Math.max(0, Math.floor(activity.purchaseAmount / 10)) * POINTS_PER_10_YUAN;

  // 计算签到积分
  const checkInPoints =
    Math.max(0, activity.consecutiveCheckIns) * CHECKIN_MULTIPLIER;

  // 基础积分
  let basePoints = purchasePoints + checkInPoints;

  // VIP 翻倍
  if (activity.isVip) {
    basePoints *= VIP_MULTIPLIER;
  }

  // 应用月度上限
  const remainingCap = MONTHLY_CAP - activity.currentMonthPoints;
  const earnedPoints = Math.min(basePoints, remainingCap);
  const capped = basePoints > remainingCap;
  const cappedAmount = capped ? basePoints - earnedPoints : 0;

  return {
    earnedPoints,
    totalPoints: activity.currentMonthPoints + earnedPoints,
    capped,
    cappedAmount,
  };
}
```

### Step 6: 运行测试，确认通过

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

### Step 7: 重构（REFACTOR）

```typescript
// src/services/points.ts - 重构版本

/** 积分配置常量 */
const CONFIG = {
  POINTS_PER_YUAN: 0.1, // 每元积分
  CHECKIN_MULTIPLIER: 2, // 签到倍率
  VIP_MULTIPLIER: 2, // VIP 倍率
  MONTHLY_CAP: 10000, // 月度上限
} as const;

/**
 * 确保数值非负
 */
function nonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * 计算购买获得的积分
 */
function calculatePurchasePoints(amount: number): number {
  return Math.floor(nonNegative(amount) * CONFIG.POINTS_PER_YUAN);
}

/**
 * 计算签到获得的积分
 */
function calculateCheckInPoints(days: number): number {
  return nonNegative(days) * CONFIG.CHECKIN_MULTIPLIER;
}

/**
 * 应用 VIP 倍率
 */
function applyVipMultiplier(points: number, isVip: boolean): number {
  return isVip ? points * CONFIG.VIP_MULTIPLIER : points;
}

/**
 * 应用月度积分上限
 */
function applyMonthlyCap(
  points: number,
  currentMonthPoints: number,
): { earnedPoints: number; capped: boolean; cappedAmount: number } {
  const remainingCap = CONFIG.MONTHLY_CAP - currentMonthPoints;
  const earnedPoints = Math.min(points, remainingCap);
  const capped = points > remainingCap;

  return {
    earnedPoints,
    capped,
    cappedAmount: capped ? points - earnedPoints : 0,
  };
}

/**
 * 计算用户活动积分
 *
 * @param activity - 用户活动数据
 * @returns 积分计算结果
 */
export function calculatePoints(activity: UserActivity): PointsResult {
  const purchasePoints = calculatePurchasePoints(activity.purchaseAmount);
  const checkInPoints = calculateCheckInPoints(activity.consecutiveCheckIns);

  const basePoints = applyVipMultiplier(
    purchasePoints + checkInPoints,
    activity.isVip,
  );

  const { earnedPoints, capped, cappedAmount } = applyMonthlyCap(
    basePoints,
    activity.currentMonthPoints,
  );

  return {
    earnedPoints,
    totalPoints: activity.currentMonthPoints + earnedPoints,
    capped,
    cappedAmount,
  };
}
```

### Step 8: 再次运行测试 + 覆盖率

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

## 关键要点

1. **先定义接口** - 明确输入输出，抛出 `Not implemented`
2. **测试覆盖所有场景** - 基础、边界、异常
3. **最小实现** - 只写让测试通过的代码
4. **重构保持绿色** - 每次重构后立即验证测试
5. **100% 覆盖率** - 对于核心业务逻辑必须达到
