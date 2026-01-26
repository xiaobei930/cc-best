# TypeScript/Node.js 后端开发模式

TypeScript/Node.js 后端开发的专属模式，涵盖 Express、NestJS、Fastify 等框架。

## 项目结构

### Express/Fastify 项目
```
project/
├── src/
│   ├── index.ts                 # 应用入口
│   ├── app.ts                   # Express/Fastify 配置
│   ├── config/
│   │   └── index.ts             # 配置管理
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── repositories/
│   │   └── user.repository.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   └── logger.ts
│   └── types/
│       └── index.ts
├── tests/
│   └── user.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### NestJS 项目
```
project/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   └── create-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   └── common/
│       ├── filters/
│       ├── guards/
│       └── interceptors/
├── test/
└── package.json
```

---

## 错误处理

### 自定义错误类

```typescript
// errors/app-error.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} 未找到`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403, 'FORBIDDEN')
  }
}
```

### 全局错误处理中间件

```typescript
// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/app-error'
import { logger } from '../utils/logger'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 记录错误
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId
  })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    })
  }

  // 未知错误，不暴露详情
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }
  })
}
```

---

## 日志配置

```typescript
// utils/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  })
})

// 请求日志中间件
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  req.requestId = requestId
  res.setHeader('X-Request-ID', requestId)

  res.on('finish', () => {
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userAgent: req.get('user-agent')
    })
  })

  next()
}
```

---

## 配置管理

```typescript
// config/index.ts
import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // 数据库
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // 日志
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
})

export type Config = z.infer<typeof configSchema>

function loadConfig(): Config {
  try {
    return configSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
      throw new Error(`配置验证失败:\n${issues.join('\n')}`)
    }
    throw error
  }
}

export const config = loadConfig()
```

---

## Express 路由模板

```typescript
// controllers/user.controller.ts
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { UserService } from '../services/user.service'
import { NotFoundError, ValidationError } from '../errors/app-error'

const router = Router()

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  password: z.string().min(8)
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// Endpoints
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body)
    const user = await UserService.create(data)

    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message))
    }
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.findById(req.params.id)

    if (!user) {
      throw new NotFoundError('用户')
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = querySchema.parse(req.query)
    const { users, total } = await UserService.findAll({ page, limit })

    res.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
```

---

## 缓存服务

```typescript
// services/cache.service.ts
import Redis from 'ioredis'
import { config } from '../config'

class CacheService {
  private redis: Redis | null = null

  constructor() {
    if (config.REDIS_URL) {
      this.redis = new Redis(config.REDIS_URL)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null

    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return

    const data = JSON.stringify(value)
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, data)
    } else {
      await this.redis.set(key, data)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return
    await this.redis.del(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return

    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

export const cache = new CacheService()
```

### 缓存装饰器

```typescript
// decorators/cache.decorator.ts
import { cache } from '../services/cache.service'

export function Cacheable(ttlSeconds: number, keyPrefix?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const prefix = keyPrefix || `${target.constructor.name}:${propertyKey}`
      const key = `${prefix}:${JSON.stringify(args)}`

      const cached = await cache.get(key)
      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      await cache.set(key, result, ttlSeconds)

      return result
    }

    return descriptor
  }
}

// 使用
class UserService {
  @Cacheable(300, 'user')
  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } })
  }
}
```

---

## 数据库事务

```typescript
// Prisma 事务
async function createOrderWithItems(
  orderData: CreateOrderDTO,
  items: CreateOrderItemDTO[]
): Promise<Order> {
  return await prisma.$transaction(async (tx) => {
    // 创建订单
    const order = await tx.order.create({
      data: orderData
    })

    // 创建订单项
    await tx.orderItem.createMany({
      data: items.map(item => ({
        ...item,
        orderId: order.id
      }))
    })

    // 更新库存
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity }
        }
      })
    }

    return order
  })
}
```

---

## 健康检查

```typescript
// routes/health.ts
import { Router } from 'express'
import { prisma } from '../db'
import { cache } from '../services/cache.service'

const router = Router()

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis()
    }
  }

  const allHealthy = Object.values(health.services)
    .every(s => s.status === 'ok')

  res.status(allHealthy ? 200 : 503).json(health)
})

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok' }
  } catch (error: any) {
    return { status: 'error', message: error.message }
  }
}

async function checkRedis() {
  try {
    await cache.set('health-check', 'ok', 1)
    return { status: 'ok' }
  } catch (error: any) {
    return { status: 'error', message: error.message }
  }
}

export default router
```

---

## 优雅关闭

```typescript
// index.ts
import { createServer } from 'http'
import { app } from './app'
import { prisma } from './db'
import { logger } from './utils/logger'

const server = createServer(app)

server.listen(config.PORT, config.HOST, () => {
  logger.info(`Server running on http://${config.HOST}:${config.PORT}`)
})

// 优雅关闭
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`)

  server.close(async () => {
    logger.info('HTTP server closed')

    try {
      await prisma.$disconnect()
      logger.info('Database connection closed')
    } catch (error) {
      logger.error('Error closing database connection', error)
    }

    process.exit(0)
  })

  // 强制退出超时
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

---

## 测试模板

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('User API', () => {
  beforeAll(async () => {
    // 设置测试数据库
  })

  afterAll(async () => {
    // 清理
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe('test@example.com')
    })

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          name: 'Test',
          password: 'password123'
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')

      expect(response.status).toBe(404)
    })
  })
})
```

---

## 常用命令

```bash
# 开发服务器
npm run dev
npx tsx watch src/index.ts

# 构建
npm run build
npx tsc

# 类型检查
npx tsc --noEmit

# 测试
npm test
npx vitest
npx vitest --coverage

# 格式化
npx prettier --write .
npx eslint --fix .

# 数据库
npx prisma generate
npx prisma migrate dev
npx prisma studio
```
