# MySQL 最佳实践

本文档补充 SKILL.md 中的通用指南，专注于 MySQL/MariaDB 特定优化。

## 触发条件

- 使用 MySQL 或 MariaDB 数据库
- 配置 InnoDB 存储引擎
- 优化 MySQL 查询性能
- 配置字符集和排序规则

---

## 1. 数据类型选择

### 快速参考

| 场景     | 推荐类型          | 避免             | 原因                 |
| -------- | ----------------- | ---------------- | -------------------- |
| ID       | `BIGINT UNSIGNED` | `INT`            | UNSIGNED 范围更大    |
| 字符串   | `VARCHAR(n)`      | `TEXT`           | VARCHAR 可建索引     |
| 定长字符 | `CHAR(n)`         | `VARCHAR`        | 固定长度性能更好     |
| 时间戳   | `DATETIME`        | `TIMESTAMP`      | DATETIME 范围更大    |
| 金额     | `DECIMAL(10,2)`   | `FLOAT`/`DOUBLE` | 精确计算无浮点误差   |
| 布尔     | `TINYINT(1)`      | `ENUM('Y','N')`  | 标准做法，ORM 支持好 |
| JSON     | `JSON`（5.7+）    | `TEXT`           | 支持 JSON 函数和索引 |
| 枚举     | `ENUM('a','b')`   | `VARCHAR`        | 存储小，有约束       |

### 代码示例

```sql
-- ✅ 正确的表定义
CREATE TABLE orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    metadata JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    INDEX idx_user_id (user_id),
    INDEX idx_status_created (status, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. 索引优化

### 索引类型

| 类型     | 语法                   | 适用场景               |
| -------- | ---------------------- | ---------------------- |
| B-tree   | `INDEX idx (col)`      | 等值、范围查询（默认） |
| 全文索引 | `FULLTEXT INDEX (col)` | 文本搜索               |
| 空间索引 | `SPATIAL INDEX (col)`  | GIS 数据               |
| 前缀索引 | `INDEX idx (col(10))`  | 长字符串列             |
| 覆盖索引 | 包含 SELECT 所有列     | 避免回表               |

### 索引最佳实践

```sql
-- 复合索引：最左前缀原则
CREATE INDEX idx_composite ON orders (user_id, status, created_at);
-- 可用于:
--   WHERE user_id = ?
--   WHERE user_id = ? AND status = ?
--   WHERE user_id = ? AND status = ? AND created_at > ?
-- 不可用于:
--   WHERE status = ?  (缺少最左列)

-- 前缀索引：长字符串
CREATE INDEX idx_email ON users (email(20));

-- 覆盖索引：避免回表
CREATE INDEX idx_covering ON orders (user_id, status, total_amount);
-- SELECT status, total_amount FROM orders WHERE user_id = ?
-- 所有数据都在索引中，无需访问数据页

-- 函数索引（MySQL 8.0+）
CREATE INDEX idx_email_lower ON users ((LOWER(email)));
```

### 避免索引失效

```sql
-- ❌ 函数导致索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- ✅ 改用范围查询
SELECT * FROM users
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ❌ 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000;  -- phone 是 VARCHAR

-- ✅ 使用正确类型
SELECT * FROM users WHERE phone = '13800138000';

-- ❌ LIKE 前缀通配符
SELECT * FROM users WHERE name LIKE '%张';

-- ✅ LIKE 后缀通配符可用索引
SELECT * FROM users WHERE name LIKE '张%';
```

---

## 3. InnoDB 优化

### 关键配置

```ini
# my.cnf / my.ini

[mysqld]
# Buffer Pool - 通常设为可用内存的 70-80%
innodb_buffer_pool_size = 4G

# 日志文件大小 - 影响写入性能
innodb_log_file_size = 256M

# 刷新策略 - 1=最安全，2=更快
innodb_flush_log_at_trx_commit = 1

# 并发线程数
innodb_thread_concurrency = 0  # 自动

# 文件格式
innodb_file_format = Barracuda
innodb_file_per_table = 1
```

### InnoDB vs MyISAM

| 特性     | InnoDB         | MyISAM      |
| -------- | -------------- | ----------- |
| 事务     | ✅ 支持        | ❌ 不支持   |
| 外键     | ✅ 支持        | ❌ 不支持   |
| 行级锁   | ✅ 支持        | ❌ 表级锁   |
| 崩溃恢复 | ✅ 自动        | ❌ 需要修复 |
| 全文索引 | ✅（5.6+）     | ✅ 支持     |
| 计数性能 | ❌ 需要扫描    | ✅ O(1)     |
| **推荐** | **大多数场景** | 只读/日志表 |

---

## 4. 字符集配置

### 推荐配置

```sql
-- 数据库级别
CREATE DATABASE myapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 表级别
CREATE TABLE users (
    name VARCHAR(100)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 列级别（特殊需求）
ALTER TABLE users
MODIFY name VARCHAR(100)
CHARACTER SET utf8mb4
COLLATE utf8mb4_bin;  -- 区分大小写
```

### 排序规则对比

| 排序规则           | 区分大小写 | 区分重音 | 用途         |
| ------------------ | ---------- | -------- | ------------ |
| utf8mb4_general_ci | ❌         | ❌       | 通用（较快） |
| utf8mb4_unicode_ci | ❌         | ✅       | 国际化       |
| utf8mb4_bin        | ✅         | ✅       | 精确匹配     |
| utf8mb4_0900_ai_ci | ❌         | ❌       | MySQL 8 默认 |

---

## 5. 查询优化

### EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 123;

-- 关键指标
-- type: 访问类型（const > eq_ref > ref > range > index > ALL）
-- key: 使用的索引
-- rows: 预估扫描行数
-- Extra: 额外信息（Using index = 覆盖索引）
```

### 常见优化

```sql
-- ❌ SELECT *
SELECT * FROM orders WHERE user_id = 123;

-- ✅ 只选需要的列
SELECT id, status, total_amount FROM orders WHERE user_id = 123;

-- ❌ 子查询
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active');

-- ✅ JOIN（通常更快）
SELECT o.* FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.status = 'active';

-- 分页优化
-- ❌ 大 OFFSET
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;

-- ✅ 游标分页
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;

-- ✅ 延迟关联
SELECT o.* FROM orders o
JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 20) t
ON o.id = t.id;
```

### 批量操作

```sql
-- ❌ 逐条插入
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');

-- ✅ 批量插入
INSERT INTO logs (message) VALUES ('log1'), ('log2'), ('log3');

-- 批量更新
UPDATE orders SET status = 'completed'
WHERE id IN (1, 2, 3, 4, 5);

-- 大批量分批处理
-- 每次处理 1000 条，避免长事务
UPDATE orders SET status = 'archived'
WHERE status = 'completed' AND created_at < '2023-01-01'
LIMIT 1000;
```

---

## 6. 诊断命令

```sql
-- 查看进程
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- 查看状态
SHOW STATUS LIKE 'Threads%';
SHOW STATUS LIKE 'Innodb_buffer%';

-- 查看变量
SHOW VARIABLES LIKE 'innodb%';

-- 查看表状态
SHOW TABLE STATUS LIKE 'orders';

-- 查看索引使用
SHOW INDEX FROM orders;

-- 慢查询日志
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 1;

-- 性能 Schema（MySQL 5.6+）
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC LIMIT 10;
```

---

## 7. 连接池配置

### 应用端配置

```javascript
// Node.js (mysql2)
const pool = mysql.createPool({
  host: "localhost",
  user: "app",
  database: "myapp",
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0, // 等待队列无限制
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
```

```python
# Python (SQLAlchemy)
from sqlalchemy import create_engine

engine = create_engine(
    "mysql+pymysql://user:pass@localhost/myapp",
    pool_size=5,           # 常驻连接数
    max_overflow=10,       # 最大溢出连接
    pool_timeout=30,       # 获取连接超时
    pool_recycle=1800,     # 连接回收时间
    pool_pre_ping=True     # 连接健康检查
)
```

### MySQL 端配置

```sql
-- 最大连接数
SET GLOBAL max_connections = 200;

-- 连接超时
SET GLOBAL wait_timeout = 28800;
SET GLOBAL interactive_timeout = 28800;
```

---

## 检查清单

### 设计阶段

- [ ] 使用 InnoDB 引擎
- [ ] 字符集 utf8mb4
- [ ] 主键 BIGINT UNSIGNED AUTO_INCREMENT
- [ ] 必备字段：created_at, updated_at

### 索引阶段

- [ ] 外键列建索引
- [ ] 高频查询列建索引
- [ ] 复合索引遵循最左前缀
- [ ] 避免冗余索引

### 运维阶段

- [ ] 开启慢查询日志
- [ ] 定期 ANALYZE TABLE
- [ ] 监控 Buffer Pool 命中率
- [ ] 大表考虑分区

---

## 参考资源

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [Percona MySQL Best Practices](https://www.percona.com/blog/)
- [High Performance MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/)
