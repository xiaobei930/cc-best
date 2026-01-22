---
name: database-patterns
description: "数据库模式技能：包含数据库设计、查询优化、迁移、索引等最佳实践。Use when designing database schemas, writing queries, optimizing performance, or managing migrations."
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# 数据库模式技能

本技能提供数据库设计和操作的最佳实践。

## 触发条件

- 设计数据库 Schema
- 编写数据库查询
- 优化查询性能
- 管理数据库迁移
- 配置索引

## Schema 设计原则

### 命名规范

```sql
-- 表名：小写下划线，复数形式
users
order_items
user_preferences

-- 列名：小写下划线
created_at
updated_at
user_id
is_active

-- 索引名：idx_表名_列名
idx_users_email
idx_orders_user_id_created_at

-- 外键名：fk_表名_关联表
fk_orders_users
```

### 必备字段

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 业务字段...
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ  -- 软删除
);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 关系设计

```sql
-- 一对多：用户 -> 订单
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    -- ...
);

-- 多对多：用户 <-> 角色
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 一对一：用户 -> 用户配置
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- ...
);
```

## ORM 使用模式

### Prisma (TypeScript)

```typescript
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String

  @@index([authorId])
}
```

```typescript
// 查询示例
// 获取用户及其文章
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
})

// 批量创建
await prisma.user.createMany({
  data: users,
  skipDuplicates: true
})

// 事务
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { balance: { decrement: amount } } }),
  prisma.transaction.create({ data: { userId: id, amount, type: 'debit' } })
])
```

### SQLAlchemy (Python)

```python
# models.py
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String)
    published = Column(Boolean, default=False)
    author_id = Column(String, ForeignKey("users.id"), index=True)

    author = relationship("User", back_populates="posts")
```

```python
# 查询示例
# 获取用户及文章
user = session.query(User)\
    .options(joinedload(User.posts))\
    .filter(User.id == user_id)\
    .first()

# 批量插入
session.bulk_insert_mappings(User, user_dicts)
session.commit()

# 事务
try:
    user.balance -= amount
    session.add(Transaction(user_id=user.id, amount=amount))
    session.commit()
except:
    session.rollback()
    raise
```

## 查询优化

### 索引策略

```sql
-- 单列索引：高选择性列
CREATE INDEX idx_users_email ON users(email);

-- 复合索引：按查询顺序
-- 适用于 WHERE user_id = ? AND status = ? ORDER BY created_at
CREATE INDEX idx_orders_user_status_created
    ON orders(user_id, status, created_at DESC);

-- 部分索引：只索引部分数据
CREATE INDEX idx_orders_pending
    ON orders(created_at)
    WHERE status = 'pending';

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- 全文索引
CREATE INDEX idx_posts_content_fts
    ON posts USING GIN(to_tsvector('chinese', content));
```

### N+1 问题解决

```typescript
// ❌ N+1 问题
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
}

// ✅ 使用 include 预加载
const users = await prisma.user.findMany({
  include: { posts: true }
})

// ✅ 使用 select 只获取需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: { id: true, title: true }
    }
  }
})
```

```python
# ❌ N+1 问题
users = session.query(User).all()
for user in users:
    print(user.posts)  # 每次访问触发查询

# ✅ 使用 joinedload 预加载
users = session.query(User)\
    .options(joinedload(User.posts))\
    .all()

# ✅ 使用 subqueryload 子查询加载
users = session.query(User)\
    .options(subqueryload(User.posts))\
    .all()
```

### 分页优化

```sql
-- ❌ 大偏移量慢
SELECT * FROM posts ORDER BY created_at DESC OFFSET 10000 LIMIT 20;

-- ✅ 使用游标分页
SELECT * FROM posts
WHERE created_at < '2024-01-01'
ORDER BY created_at DESC
LIMIT 20;

-- ✅ 使用覆盖索引
SELECT id, title FROM posts  -- 索引覆盖，无需回表
WHERE author_id = ?
ORDER BY created_at DESC
LIMIT 20;
```

### 查询分析

```sql
-- 分析查询计划
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = '123' AND status = 'pending'
ORDER BY created_at DESC;

-- 查看索引使用
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ...
```

## 数据库迁移

### Prisma 迁移

```bash
# 创建迁移
npx prisma migrate dev --name add_user_avatar

# 应用迁移
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 生成客户端
npx prisma generate
```

### Alembic 迁移 (Python)

```bash
# 创建迁移
alembic revision --autogenerate -m "add user avatar"

# 应用迁移
alembic upgrade head

# 回滚
alembic downgrade -1

# 查看历史
alembic history
```

```python
# migrations/versions/xxx_add_user_avatar.py
def upgrade():
    op.add_column('users',
        sa.Column('avatar_url', sa.String(500), nullable=True)
    )

def downgrade():
    op.drop_column('users', 'avatar_url')
```

## 数据完整性

### 约束

```sql
-- 非空约束
email VARCHAR(255) NOT NULL

-- 唯一约束
UNIQUE(email)

-- 检查约束
CHECK (age >= 0 AND age <= 150)

-- 外键约束
FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE

-- 默认值
created_at TIMESTAMPTZ DEFAULT NOW()
```

### 事务隔离级别

```sql
-- 读已提交（默认）
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 可重复读
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 串行化（最严格）
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

## 连接池配置

```typescript
// Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error']
})

// 连接池通过 URL 参数配置
// postgresql://user:pass@host/db?connection_limit=10&pool_timeout=30
```

```python
# SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800
)
```

## 最佳实践

1. **命名规范** - 统一的命名约定
2. **必备字段** - id, created_at, updated_at
3. **软删除** - deleted_at 而非物理删除
4. **索引优化** - 基于查询模式创建索引
5. **避免 N+1** - 使用预加载
6. **分页优化** - 大数据量使用游标分页
7. **迁移管理** - 版本控制迁移文件
8. **连接池** - 合理配置连接数
9. **查询分析** - 使用 EXPLAIN 分析
10. **事务边界** - 明确事务范围
