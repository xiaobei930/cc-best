# Next.js App Router API 模式

## 路由实现

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const [users, total] = await Promise.all([
      db.users.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.users.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: "获取用户失败" } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateUserSchema.parse(body);

    const user = await db.users.create({ data: validated });

    return NextResponse.json(
      { success: true, data: user, message: "创建成功" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "请求参数无效",
            details: error.errors,
          },
        },
        { status: 400 },
      );
    }
    throw error;
  }
}
```

## 认证与授权

### JWT 认证中间件

```typescript
// middlewares/auth.ts
import jwt from "jsonwebtoken";

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "未提供认证信息" },
      },
      { status: 401 },
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    request.user = decoded;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Token 无效" },
      },
      { status: 401 },
    );
  }
}
```

### 权限检查

```typescript
export function requireRole(...roles: string[]) {
  return (request: NextRequest) => {
    if (!roles.includes(request.user.role)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "权限不足" } },
        { status: 403 },
      );
    }
  };
}

// 使用
export async function DELETE(request: NextRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  const roleError = requireRole("admin")(request);
  if (roleError) return roleError;

  // 执行删除
}
```

## 版本控制实现

```typescript
// app/api/v1/users/route.ts
export async function GET() { ... }

// app/api/v2/users/route.ts
export async function GET() { ... }
```
