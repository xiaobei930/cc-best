# SQLite 最佳实践

本文档补充 SKILL.md 中的通用指南，专注于 SQLite 特定优化。

## 触发条件

- 使用 SQLite 数据库
- 开发移动端/桌面端应用
- 配置 WAL 模式
- 优化嵌入式数据库性能

---

## 1. WAL 模式

### 什么是 WAL

WAL（Write-Ahead Logging）是 SQLite 的日志模式，相比默认的回滚日志模式：

| 特性         | 回滚日志模式    | WAL 模式             |
| ------------ | --------------- | -------------------- |
| 读写并发     | ❌ 写入阻塞读取 | ✅ 读写可并发        |
| 写入性能     | 慢（写两次）    | 快（写一次）         |
| 读取性能     | 良好            | 更好                 |
| 文件数量     | 1 个            | 3 个（db, wal, shm） |
| 网络文件系统 | ✅ 支持         | ❌ 不支持            |

### 启用 WAL

```sql
-- 启用 WAL 模式
PRAGMA journal_mode = WAL;

-- 验证
PRAGMA journal_mode;  -- 应返回 'wal'
```

```python
# Python
import sqlite3
conn = sqlite3.connect('app.db')
conn.execute('PRAGMA journal_mode=WAL')
```

```javascript
// Node.js (better-sqlite3)
const db = require("better-sqlite3")("app.db");
db.pragma("journal_mode = WAL");
```

```swift
// Swift (iOS)
var config = Configuration()
config.prepareDatabase { db in
    try db.execute(sql: "PRAGMA journal_mode=WAL")
}
let dbQueue = try DatabaseQueue(path: dbPath, configuration: config)
```

### WAL 检查点

```sql
-- 手动检查点（将 WAL 写回主数据库）
PRAGMA wal_checkpoint(PASSIVE);   -- 不阻塞
PRAGMA wal_checkpoint(FULL);      -- 等待读取完成
PRAGMA wal_checkpoint(RESTART);   -- 重置 WAL
PRAGMA wal_checkpoint(TRUNCATE);  -- 重置并截断 WAL 文件

-- 自动检查点阈值（默认 1000 页）
PRAGMA wal_autocheckpoint = 1000;
```

---

## 2. PRAGMA 优化

### 推荐配置

```sql
-- 基础优化配置
PRAGMA journal_mode = WAL;           -- WAL 模式
PRAGMA synchronous = NORMAL;         -- 平衡安全和性能
PRAGMA temp_store = MEMORY;          -- 临时表存内存
PRAGMA mmap_size = 268435456;        -- 内存映射 256MB
PRAGMA cache_size = -64000;          -- 缓存 64MB（负数表示 KB）
PRAGMA busy_timeout = 5000;          -- 锁等待 5 秒
```

### PRAGMA 详解

| PRAGMA       | 值          | 说明                     |
| ------------ | ----------- | ------------------------ |
| journal_mode | WAL         | 启用 WAL 模式            |
| synchronous  | NORMAL      | WAL 下安全且快           |
| temp_store   | MEMORY      | 临时表存内存             |
| mmap_size    | 268435456   | 内存映射大小（字节）     |
| cache_size   | -64000      | 页缓存大小（-N 表示 KB） |
| busy_timeout | 5000        | 锁等待超时（毫秒）       |
| foreign_keys | ON          | 启用外键约束             |
| auto_vacuum  | INCREMENTAL | 增量自动清理             |

### synchronous 级别

| 级别   | 安全性 | 性能 | 推荐场景         |
| ------ | ------ | ---- | ---------------- |
| OFF    | 低     | 最快 | 可重建的缓存数据 |
| NORMAL | 中     | 快   | WAL 模式（推荐） |
| FULL   | 高     | 慢   | 回滚日志模式     |
| EXTRA  | 最高   | 最慢 | 极端可靠性需求   |

---

## 3. 数据类型

### SQLite 类型系统

SQLite 使用动态类型，但建议显式声明：

| 场景   | 推荐类型            | 存储亲和性 | 说明                 |
| ------ | ------------------- | ---------- | -------------------- |
| ID     | `INTEGER`           | INTEGER    | 自增主键效率最高     |
| 字符串 | `TEXT`              | TEXT       | UTF-8 编码           |
| 数值   | `REAL`              | REAL       | 8 字节浮点           |
| 金额   | `INTEGER`           | INTEGER    | 存分/最小单位        |
| 布尔   | `INTEGER`           | INTEGER    | 0/1                  |
| 时间戳 | `TEXT` 或 `INTEGER` | -          | ISO8601 或 Unix 时间 |
| 二进制 | `BLOB`              | BLOB       | 原样存储             |
| JSON   | `TEXT`              | TEXT       | 配合 JSON 函数       |

### 代码示例

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,  -- 自动 ROWID 别名，自增
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'shipped', 'completed')),
    total_cents INTEGER NOT NULL,  -- 金额存分
    metadata TEXT,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 触发器更新 updated_at
CREATE TRIGGER update_orders_timestamp
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = datetime('now') WHERE id = NEW.id;
END;
```

---

## 4. 索引优化

### 索引类型

```sql
-- 普通索引
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 部分索引（条件索引）
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- 表达式索引
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
```

### EXPLAIN 分析

```sql
-- 查看查询计划
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id = 123;

-- 输出示例
-- SEARCH orders USING INDEX idx_orders_user_id (user_id=?)
```

### 覆盖索引

```sql
-- 创建覆盖索引
CREATE INDEX idx_orders_user_status_total ON orders(user_id, status, total_cents);

-- 查询只需要索引列，无需访问表
SELECT status, total_cents FROM orders WHERE user_id = 123;
```

---

## 5. 事务优化

### 批量写入

```sql
-- ❌ 慢：每条 INSERT 一个事务
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');

-- ✅ 快：包装在事务中
BEGIN TRANSACTION;
INSERT INTO logs (message) VALUES ('log1');
INSERT INTO logs (message) VALUES ('log2');
INSERT INTO logs (message) VALUES ('log3');
COMMIT;
```

```python
# Python 批量插入
conn = sqlite3.connect('app.db')
data = [('log1',), ('log2',), ('log3',)]

with conn:  # 自动事务
    conn.executemany('INSERT INTO logs (message) VALUES (?)', data)
```

### 事务隔离

```sql
-- SQLite 默认 SERIALIZABLE
-- WAL 模式下读取不阻塞写入

-- 显式开始读事务
BEGIN;  -- 或 BEGIN DEFERRED;

-- 立即获取写锁
BEGIN IMMEDIATE;

-- 立即获取排他锁
BEGIN EXCLUSIVE;
```

---

## 6. 连接管理

### 单连接模式

SQLite 最佳实践是单写多读：

```python
# Python - 单连接（简单场景）
import sqlite3
from threading import Lock

class Database:
    def __init__(self, path):
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.conn.execute('PRAGMA journal_mode=WAL')
        self.lock = Lock()

    def execute(self, sql, params=()):
        with self.lock:
            return self.conn.execute(sql, params)
```

### 连接池模式

```python
# Python - 多连接读，单连接写
from queue import Queue

class SQLitePool:
    def __init__(self, path, pool_size=5):
        self.path = path
        self.pool = Queue()
        for _ in range(pool_size):
            conn = sqlite3.connect(path, check_same_thread=False)
            conn.execute('PRAGMA journal_mode=WAL')
            conn.execute('PRAGMA query_only=ON')  # 只读
            self.pool.put(conn)

        # 写连接
        self.write_conn = sqlite3.connect(path, check_same_thread=False)
        self.write_conn.execute('PRAGMA journal_mode=WAL')
```

### 忙等待处理

```sql
-- 设置等待超时
PRAGMA busy_timeout = 5000;  -- 5 秒
```

```python
# Python
conn = sqlite3.connect('app.db', timeout=5.0)  # 5 秒超时
```

---

## 7. 常见场景

### 全文搜索

```sql
-- 创建 FTS5 虚拟表
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    content='posts',
    content_rowid='id'
);

-- 同步数据
INSERT INTO posts_fts(posts_fts) VALUES('rebuild');

-- 搜索
SELECT * FROM posts_fts WHERE posts_fts MATCH 'sqlite AND performance';

-- 高亮结果
SELECT highlight(posts_fts, 0, '<b>', '</b>') as title
FROM posts_fts WHERE posts_fts MATCH 'sqlite';
```

### JSON 操作

```sql
-- 创建带 JSON 的表
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL  -- JSON
);

-- 插入 JSON
INSERT INTO events (data) VALUES ('{"type":"click","x":100,"y":200}');

-- 提取 JSON 字段
SELECT json_extract(data, '$.type') as event_type FROM events;

-- JSON 索引
CREATE INDEX idx_events_type ON events(json_extract(data, '$.type'));

-- JSON 数组操作
SELECT json_each.value FROM events, json_each(events.data, '$.tags');
```

### 备份

```python
# Python 在线备份
import sqlite3

source = sqlite3.connect('app.db')
backup = sqlite3.connect('backup.db')

with backup:
    source.backup(backup)

backup.close()
source.close()
```

```sql
-- 使用 .backup 命令
.backup backup.db

-- 或使用 VACUUM INTO（3.27+）
VACUUM INTO 'backup.db';
```

---

## 8. 移动端最佳实践

### iOS (Swift/GRDB)

```swift
var config = Configuration()
config.prepareDatabase { db in
    // WAL 模式
    try db.execute(sql: "PRAGMA journal_mode=WAL")
    // 外键约束
    try db.execute(sql: "PRAGMA foreign_keys=ON")
}

let dbQueue = try DatabaseQueue(
    path: dbPath,
    configuration: config
)
```

### Android (Room)

```kotlin
// Room 数据库配置
@Database(entities = [User::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    companion object {
        fun create(context: Context): AppDatabase {
            return Room.databaseBuilder(
                context,
                AppDatabase::class.java,
                "app.db"
            )
            .setJournalMode(JournalMode.WRITE_AHEAD_LOGGING)
            .build()
        }
    }
}
```

---

## 检查清单

### 初始化

- [ ] 启用 WAL 模式
- [ ] 设置 synchronous = NORMAL
- [ ] 配置 busy_timeout
- [ ] 启用外键约束

### 开发阶段

- [ ] 批量写入使用事务
- [ ] 使用参数化查询
- [ ] 创建必要的索引
- [ ] EXPLAIN QUERY PLAN 验证

### 运维阶段

- [ ] 定期 VACUUM（或 auto_vacuum）
- [ ] 监控 WAL 文件大小
- [ ] 定期备份
- [ ] ANALYZE 更新统计信息

---

## 参考资源

- [SQLite Documentation](https://sqlite.org/docs.html)
- [Write-Ahead Logging](https://sqlite.org/wal.html)
- [SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)
- [Android SQLite Best Practices](https://developer.android.com/topic/performance/sqlite-performance-best-practices)
