# Oracle 最佳实践

本文档补充 SKILL.md 中的通用指南，专注于 Oracle Database 特定优化。

## 触发条件

- 使用 Oracle Database
- 设计分区表策略
- 配置索引（本地/全局）
- 编写 PL/SQL 存储过程

---

## 1. 数据类型选择

### 快速参考

| 场景   | 推荐类型                   | 避免       | 原因              |
| ------ | -------------------------- | ---------- | ----------------- |
| ID     | `NUMBER(19)`               | `INTEGER`  | NUMBER 更灵活     |
| 字符串 | `VARCHAR2(n)`              | `CHAR`     | 变长节省空间      |
| 长文本 | `CLOB`                     | `LONG`     | LONG 已废弃       |
| 时间戳 | `TIMESTAMP WITH TIME ZONE` | `DATE`     | 支持时区和精度    |
| 金额   | `NUMBER(10,2)`             | `FLOAT`    | 精确计算          |
| 布尔   | `NUMBER(1)` 或 `CHAR(1)`   | -          | Oracle 无原生布尔 |
| 二进制 | `BLOB`                     | `RAW`      | BLOB 无大小限制   |
| UUID   | `RAW(16)`                  | `VARCHAR2` | 存储效率高        |

### 代码示例

```sql
-- ✅ 正确的表定义
CREATE TABLE orders (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' NOT NULL
        CONSTRAINT chk_status CHECK (status IN ('pending', 'paid', 'shipped', 'completed')),
    total_amount NUMBER(10,2) NOT NULL,
    metadata CLOB CONSTRAINT chk_metadata CHECK (metadata IS JSON),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

---

## 2. 分区策略

### 分区类型

| 类型      | 适用场景             | 示例                   |
| --------- | -------------------- | ---------------------- |
| Range     | 时间序列、有序数据   | 按月/年分区            |
| List      | 离散值、地区/类型    | 按状态/区域分区        |
| Hash      | 均匀分布、无明显规律 | 按 ID 哈希分区         |
| Composite | 复杂场景             | Range-Hash、Range-List |

### 分区示例

```sql
-- Range 分区（按时间）
CREATE TABLE orders (
    id NUMBER(19) PRIMARY KEY,
    user_id NUMBER(19) NOT NULL,
    order_date DATE NOT NULL,
    total_amount NUMBER(10,2)
)
PARTITION BY RANGE (order_date) (
    PARTITION p_2023_q1 VALUES LESS THAN (DATE '2023-04-01'),
    PARTITION p_2023_q2 VALUES LESS THAN (DATE '2023-07-01'),
    PARTITION p_2023_q3 VALUES LESS THAN (DATE '2023-10-01'),
    PARTITION p_2023_q4 VALUES LESS THAN (DATE '2024-01-01'),
    PARTITION p_max VALUES LESS THAN (MAXVALUE)
);

-- List 分区（按状态）
CREATE TABLE orders (
    id NUMBER(19) PRIMARY KEY,
    status VARCHAR2(20) NOT NULL,
    total_amount NUMBER(10,2)
)
PARTITION BY LIST (status) (
    PARTITION p_pending VALUES ('pending'),
    PARTITION p_processing VALUES ('paid', 'shipped'),
    PARTITION p_completed VALUES ('completed', 'cancelled')
);

-- Hash 分区（均匀分布）
CREATE TABLE orders (
    id NUMBER(19) PRIMARY KEY,
    user_id NUMBER(19) NOT NULL
)
PARTITION BY HASH (user_id)
PARTITIONS 8;

-- 复合分区（Range + Hash）
CREATE TABLE orders (
    id NUMBER(19) PRIMARY KEY,
    user_id NUMBER(19) NOT NULL,
    order_date DATE NOT NULL
)
PARTITION BY RANGE (order_date)
SUBPARTITION BY HASH (user_id)
SUBPARTITIONS 4 (
    PARTITION p_2024_q1 VALUES LESS THAN (DATE '2024-04-01'),
    PARTITION p_2024_q2 VALUES LESS THAN (DATE '2024-07-01')
);
```

### 分区管理

```sql
-- 添加分区
ALTER TABLE orders ADD PARTITION p_2024_q1
VALUES LESS THAN (DATE '2024-04-01');

-- 删除分区
ALTER TABLE orders DROP PARTITION p_2023_q1;

-- 截断分区（保留结构清空数据）
ALTER TABLE orders TRUNCATE PARTITION p_2023_q1;

-- 合并分区
ALTER TABLE orders MERGE PARTITIONS p_2023_q1, p_2023_q2
INTO PARTITION p_2023_h1;

-- 拆分分区
ALTER TABLE orders SPLIT PARTITION p_max
AT (DATE '2025-01-01')
INTO (PARTITION p_2024_q4, PARTITION p_max);
```

---

## 3. 索引策略

### 本地索引 vs 全局索引

| 特性     | 本地索引         | 全局索引         |
| -------- | ---------------- | ---------------- |
| 对齐     | 与表分区对齐     | 独立分区或不分区 |
| 维护     | 分区操作自动维护 | 分区操作需重建   |
| 可用性   | 分区独立，高可用 | 分区操作影响全局 |
| 适用场景 | OLAP、DSS        | OLTP、唯一约束   |
| 查询优化 | 分区裁剪高效     | 跨分区查询高效   |

### 索引示例

```sql
-- 本地索引（与表分区对齐）
CREATE INDEX idx_orders_date_local ON orders(order_date) LOCAL;

-- 本地前缀索引（分区键在最左）
CREATE INDEX idx_orders_date_status ON orders(order_date, status) LOCAL;

-- 全局索引（不分区）
CREATE INDEX idx_orders_user_global ON orders(user_id) GLOBAL;

-- 全局分区索引
CREATE INDEX idx_orders_user_hash ON orders(user_id)
GLOBAL PARTITION BY HASH (user_id) PARTITIONS 4;

-- 位图索引（低基数列，OLAP）
CREATE BITMAP INDEX idx_orders_status_bmp ON orders(status) LOCAL;

-- 函数索引
CREATE INDEX idx_orders_upper_status ON orders(UPPER(status));

-- 不可见索引（测试用）
CREATE INDEX idx_test ON orders(created_at) INVISIBLE;
ALTER INDEX idx_test VISIBLE;
```

### 索引选择指南

```
OLTP 应用:
├── 主键/唯一键 → 全局索引
├── 查询包含分区键 → 本地前缀索引
└── 查询不含分区键 → 全局索引

OLAP/DSS 应用:
├── 范围查询 → 本地索引
├── 低基数列 → 位图索引
└── 并行查询 → 本地索引
```

---

## 4. PL/SQL 最佳实践

### 游标处理

```sql
-- ✅ 隐式游标（推荐）
FOR rec IN (SELECT id, name FROM users WHERE status = 'active') LOOP
    DBMS_OUTPUT.PUT_LINE(rec.id || ': ' || rec.name);
END LOOP;

-- ✅ 批量处理（BULK COLLECT）
DECLARE
    TYPE t_ids IS TABLE OF users.id%TYPE;
    l_ids t_ids;
BEGIN
    SELECT id BULK COLLECT INTO l_ids
    FROM users WHERE status = 'active';

    FORALL i IN 1..l_ids.COUNT
        UPDATE orders SET processed = 'Y' WHERE user_id = l_ids(i);
END;

-- ✅ LIMIT 控制内存
DECLARE
    CURSOR c_users IS SELECT id FROM users;
    TYPE t_ids IS TABLE OF users.id%TYPE;
    l_ids t_ids;
BEGIN
    OPEN c_users;
    LOOP
        FETCH c_users BULK COLLECT INTO l_ids LIMIT 1000;
        EXIT WHEN l_ids.COUNT = 0;

        FORALL i IN 1..l_ids.COUNT
            UPDATE orders SET processed = 'Y' WHERE user_id = l_ids(i);
        COMMIT;
    END LOOP;
    CLOSE c_users;
END;
```

### 异常处理

```sql
CREATE OR REPLACE PROCEDURE process_order(p_order_id IN NUMBER) AS
    e_order_not_found EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_order_not_found, -20001);
BEGIN
    -- 业务逻辑
    UPDATE orders SET status = 'processing' WHERE id = p_order_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, '订单不存在: ' || p_order_id);
    END IF;

    COMMIT;
EXCEPTION
    WHEN e_order_not_found THEN
        ROLLBACK;
        -- 记录日志
        INSERT INTO error_logs (error_msg, created_at)
        VALUES (SQLERRM, SYSTIMESTAMP);
        COMMIT;
        RAISE;
    WHEN OTHERS THEN
        ROLLBACK;
        INSERT INTO error_logs (error_msg, created_at)
        VALUES (SQLERRM || ' - ' || DBMS_UTILITY.FORMAT_ERROR_BACKTRACE, SYSTIMESTAMP);
        COMMIT;
        RAISE;
END;
```

---

## 5. 性能诊断

### AWR 报告

```sql
-- 生成 AWR 报告
@$ORACLE_HOME/rdbms/admin/awrrpt.sql

-- 手动创建快照
EXEC DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT();

-- 查看快照
SELECT snap_id, begin_interval_time, end_interval_time
FROM dba_hist_snapshot
ORDER BY snap_id DESC
FETCH FIRST 10 ROWS ONLY;
```

### 执行计划

```sql
-- 查看执行计划
EXPLAIN PLAN FOR
SELECT * FROM orders WHERE user_id = 123;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- 实际执行统计
SELECT /*+ GATHER_PLAN_STATISTICS */ *
FROM orders WHERE user_id = 123;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));
```

### 常用诊断视图

```sql
-- 当前会话
SELECT sid, serial#, username, status, sql_id
FROM v$session
WHERE username IS NOT NULL;

-- 活跃 SQL
SELECT sql_id, sql_text, elapsed_time/1000000 elapsed_sec, executions
FROM v$sql
WHERE elapsed_time > 1000000
ORDER BY elapsed_time DESC;

-- 等待事件
SELECT event, total_waits, time_waited
FROM v$system_event
ORDER BY time_waited DESC;

-- 锁等待
SELECT l.sid, l.type, l.mode, s.username, s.program
FROM v$lock l
JOIN v$session s ON l.sid = s.sid
WHERE l.block = 1;
```

---

## 6. 优化器提示

```sql
-- 索引提示
SELECT /*+ INDEX(orders idx_orders_user_id) */ *
FROM orders WHERE user_id = 123;

-- 全表扫描
SELECT /*+ FULL(orders) */ *
FROM orders WHERE created_at > SYSDATE - 1;

-- 并行执行
SELECT /*+ PARALLEL(orders, 4) */ COUNT(*)
FROM orders;

-- 连接顺序
SELECT /*+ LEADING(u o) USE_NL(o) */ *
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 优化器模式
SELECT /*+ FIRST_ROWS(10) */ *
FROM orders ORDER BY created_at DESC;
```

---

## 检查清单

### 设计阶段

- [ ] 大表（>1000 万行）考虑分区
- [ ] 选择合适的分区策略
- [ ] 时间序列使用 Range 分区
- [ ] 评估本地索引 vs 全局索引

### 开发阶段

- [ ] PL/SQL 使用 BULK COLLECT
- [ ] 批量操作使用 FORALL
- [ ] 异常处理完整
- [ ] 避免在循环中 COMMIT

### 运维阶段

- [ ] 定期收集统计信息
- [ ] 监控 AWR 报告
- [ ] 关注等待事件
- [ ] 索引使用情况分析

---

## 参考资源

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Oracle SQL & PL/SQL Optimization](https://oracle.readthedocs.io/)
- [Oracle Partitioning Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/vldbg/)
