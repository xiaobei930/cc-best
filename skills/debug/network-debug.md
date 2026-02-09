# 网络与数据库调试

## 网络调试

### 请求/响应日志

```typescript
// Axios 拦截器
axios.interceptors.request.use((config) => {
  console.log("[HTTP Request]", {
    method: config.method,
    url: config.url,
    data: config.data,
  });
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log("[HTTP Response]", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[HTTP Error]", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });
    throw error;
  },
);
```

### cURL 调试

```bash
# 详细输出
curl -v https://api.example.com/users

# 只显示响应头
curl -I https://api.example.com/users

# 带认证
curl -H "Authorization: Bearer TOKEN" https://api.example.com/users

# POST JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}' \
  https://api.example.com/users
```

## 数据库调试

### 查询日志

```typescript
// Prisma 查询日志
const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
  ],
});

prisma.$on("query", (e) => {
  console.log("Query:", e.query);
  console.log("Params:", e.params);
  console.log("Duration:", e.duration, "ms");
});
```

```python
# SQLAlchemy 查询日志
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### 慢查询分析

```sql
-- PostgreSQL 查询计划
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = '123';

-- MySQL 慢查询
SHOW FULL PROCESSLIST;
SHOW STATUS LIKE 'Slow_queries';
```
