# PostgreSQL 最佳实践

本文档补充 SKILL.md，专注于 PostgreSQL 特有的最佳实践和性能优化。

## 触发条件

- 使用 PostgreSQL/Supabase
- 需要查询性能优化
- 实现行级安全（RLS）
- 选择索引类型
- 排查慢查询

---

## 1. 数据类型选择

### 快速参考

| ���景  | 推荐类型        | 避免             | 原因                    |
| ------ | --------------- | ---------------- | ----------------------- |
| ID     | `bigint`        | `int`, UUID      | bigint 性能好，范围足够 |
| 字符串 | `text`          | `varchar(n)`     | 无长度限制，性能相同    |
| 时间戳 | `timestamptz`   | `timestamp`      | 带时区，避免时区问题    |
| 金额   | `numeric(10,2)` | `float`          | 精确计算，无浮点误差    |
| 布尔   | `boolean`       | `int`, `varchar` | 类型明确，存储小        |
| JSON   | `jsonb`         | `json`           | 支持索引，查询更快      |

### 代码示例

```sql
-- ✅ 正确的表定义
CREATE TABLE orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id bigint NOT NULL REFERENCES users(id),
    total_amount numeric(12,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ❌ 避免的定义
CREATE TABLE orders (
    id int PRIMARY KEY,                    -- int 范围可能不够
    user_id int REFERENCES users(id),
    total_amount float,                    -- 浮点精度问题
    status varchar(20),                    -- 无必要的长度限制
    metadata json,                         -- 无法建索引
    created_at timestamp                   -- 无时区
);
```

---

## 2. 索引类型选择

### 索引速查表

| 查询模式                   | 索引类型       | 示例                                           |
| -------------------------- | -------------- | ---------------------------------------------- |
| `WHERE col = value`        | B-tree（默认） | `CREATE INDEX idx ON t (col)`                  |
| `WHERE col > value`        | B-tree         | `CREATE INDEX idx ON t (col)`                  |
| `WHERE a = x AND b > y`    | 复合 B-tree    | `CREATE INDEX idx ON t (a, b)`                 |
| `WHERE jsonb @> '{}'`      | GIN            | `CREATE INDEX idx ON t USING gin (col)`        |
| `WHERE tsv @@ query`       | GIN            | `CREATE INDEX idx ON t USING gin (col)`        |
| 时序数据范围查询           | BRIN           | `CREATE INDEX idx ON t USING brin (col)`       |
| `WHERE col LIKE 'prefix%'` | B-tree         | `CREATE INDEX idx ON t (col text_pattern_ops)` |

### 复合索引顺序

```sql
-- 规则：等值列在前，范围列在后
-- 查询：WHERE status = 'active' AND created_at > '2024-01-01'

-- ✅ 正确顺序
CREATE INDEX idx_orders_status_created
    ON orders (status, created_at);

-- ❌ 错误顺序（效率低）
CREATE INDEX idx_orders_created_status
    ON orders (created_at, status);
```

### 覆盖索引

```sql
-- 避免回表查询
CREATE INDEX idx_users_email_include
    ON users (email)
    INCLUDE (name, created_at);

-- 查询只需索引，不访问表
SELECT email, name, created_at FROM users WHERE email = 'test@example.com';
```

### 部分索引

```sql
-- 只索引活跃数据，减小索引大小
CREATE INDEX idx_users_active_email
    ON users (email)
    WHERE deleted_at IS NULL;

-- 只索引待处理订单
CREATE INDEX idx_orders_pending
    ON orders (created_at)
    WHERE status = 'pending';
```

---

## 3. 行级安全（RLS）

### 基本模式

```sql
-- 1. 启用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. 创建策略（重要：使用 SELECT 包装 auth.uid()）
CREATE POLICY "用户只能查看自己的订单"
    ON orders FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

-- ✅ 正确：SELECT 包装，只执行一次
USING ((SELECT auth.uid()) = user_id)

-- ❌ 错误：每行都执行函数
USING (auth.uid() = user_id)
```

### RLS 性能优化

```sql
-- 确保 RLS 列有索引
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- 组合策略（读写分离）
CREATE POLICY "用户读取自己的订单"
    ON orders FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "用户创建订单"
    ON orders FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "用户更新自己的订单"
    ON orders FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
```

---

## 4. 查询诊断命令

### 常用诊断 SQL

```sql
-- 查看慢查询（需启用 pg_stat_statements）
SELECT
    query,
    calls,
    mean_exec_time::numeric(10,2) as avg_ms,
    total_exec_time::numeric(10,2) as total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 查看表大小
SELECT
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_table_size(relid)) as table_size,
    pg_size_pretty(pg_indexes_size(relid)) as index_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 查看索引使用情况
SELECT
    indexrelname as index_name,
    idx_scan as times_used,
    idx_tup_read as rows_read,
    idx_tup_fetch as rows_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 查找未使用的索引
SELECT
    indexrelname as index_name,
    relname as table_name,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查找缺少索引的外键
SELECT
    conrelid::regclass as table_name,
    a.attname as column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
);

-- 查看表膨胀
SELECT
    relname as table_name,
    n_dead_tup as dead_rows,
    n_live_tup as live_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### 查询计划分析

```sql
-- 基本分析
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123 AND status = 'pending'
ORDER BY created_at DESC;

-- 详细分析（包含缓冲区信息）
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE user_id = 123;

-- 注意事项：
-- Seq Scan 在大表上 = 需要索引
-- 实际行数远大于预估 = 统计信息过期，需要 ANALYZE
-- Buffers: shared hit 低 = 数据不在缓存
```

---

## 5. 分页优化

### 游标分页（推荐）

```sql
-- ✅ O(1) 复杂度，适合大数据集
SELECT * FROM products
WHERE id > $last_id
ORDER BY id
LIMIT 20;

-- 带排序的游标分页
SELECT * FROM orders
WHERE (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 避免 OFFSET

```sql
-- ❌ O(n) 复杂度，offset 越大越慢
SELECT * FROM products
ORDER BY id
OFFSET 10000 LIMIT 20;  -- 需要跳过 10000 行

-- ✅ 使用游标替代
SELECT * FROM products
WHERE id > 10000
ORDER BY id
LIMIT 20;  -- 直接定位
```

---

## 6. 常用模式

### UPSERT（插入或更新）

```sql
INSERT INTO user_settings (user_id, key, value)
VALUES (123, 'theme', 'dark')
ON CONFLICT (user_id, key)
DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();
```

### 批量插入

```sql
-- 使用 COPY（最快）
COPY users (name, email) FROM '/path/to/data.csv' CSV HEADER;

-- 使用多值 INSERT
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com'),
    ('Charlie', 'charlie@example.com');
```

### 递归查询（树形结构）

```sql
-- 查询组织架构树
WITH RECURSIVE org_tree AS (
    -- 基础情况：根节点
    SELECT id, name, parent_id, 0 as depth
    FROM departments
    WHERE parent_id IS NULL

    UNION ALL

    -- 递归情况：子节点
    SELECT d.id, d.name, d.parent_id, t.depth + 1
    FROM departments d
    JOIN org_tree t ON d.parent_id = t.id
)
SELECT * FROM org_tree ORDER BY depth, name;
```

---

## 7. 连接池配置

### Supabase/Vercel 推荐配置

```
# 连接字符串参数
?connection_limit=10      # 最大连接数
&pool_timeout=30          # 等待连接超时（秒）
&statement_timeout=30000  # SQL 执行超时（毫秒）

# 完整示例
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30
```

### 连接池最佳实践

```typescript
// Prisma 配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// 注意：Serverless 环境（Vercel/Cloudflare）
// 使用 Prisma Accelerate 或 Supabase 连接池
// 避免连接耗尽
```

---

## 检查清单

### Schema 设计

- [ ] ID 使用 `bigint`（非 `int`）
- [ ] 字符串使用 `text`（非 `varchar(n)`）
- [ ] 时间戳使用 `timestamptz`
- [ ] 金额使用 `numeric`
- [ ] JSON 使用 `jsonb`

### 索引优化

- [ ] WHERE 常用列有索引
- [ ] 外键列有索引
- [ ] 复合索引顺序正确（等值在前）
- [ ] 定期检查未使用索引
- [ ] 考虑部分索引减小大小

### RLS 安全

- [ ] 多租户表启用 RLS
- [ ] 策略使用 `(SELECT auth.uid())`
- [ ] RLS 列有索引
- [ ] 测试策略有效性

### 性能监控

- [ ] 启用 pg_stat_statements
- [ ] 定期检查慢查询
- [ ] 监控表膨胀
- [ ] 定期 VACUUM ANALYZE
