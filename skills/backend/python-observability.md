# Python 可观测性 | Observability

> 日志、指标、追踪三大支柱的 Python 实现

## 触发条件

- 配置日志系统
- 添加性能监控
- 实现分布式追踪
- 设计告警规则

---

## 四个黄金信号

```
┌─────────────────────────────────────────────────────┐
│                 Four Golden Signals                  │
├─────────────────────────────────────────────────────┤
│  Latency     响应时间 - p50, p95, p99               │
│  Traffic     流量 - QPS, 请求数/秒                  │
│  Errors      错误率 - 5xx 比例, 失败请求            │
│  Saturation  饱和度 - CPU, 内存, 连接池使用率       │
└─────────────────────────────────────────────────────┘
```

---

## 结构化日志

### 基础配置

```python
import structlog
from structlog.processors import JSONRenderer, TimeStamper

# ✅ DO: 配置结构化日志
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()
```

### 请求上下文绑定

```python
from contextvars import ContextVar
from uuid import uuid4

request_id_var: ContextVar[str] = ContextVar("request_id", default="")

# FastAPI 中间件
@app.middleware("http")
async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    request_id_var.set(request_id)

    # 绑定到所有后续日志
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        path=request.url.path,
        method=request.method,
    )

    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        structlog.contextvars.clear_contextvars()
```

### DO / DON'T 示例

```python
# ❌ DON'T: 字符串拼接日志
logger.info(f"User {user_id} logged in from {ip}")

# ✅ DO: 结构化字段
logger.info("user_login", user_id=user_id, ip=ip, action="login")

# ❌ DON'T: 日志敏感信息
logger.info("auth", password=password, token=token)

# ✅ DO: 脱敏处理
logger.info("auth", user_id=user_id, token_suffix=token[-8:])

# ❌ DON'T: 在循环中频繁日志
for item in large_list:
    logger.debug("processing", item=item)

# ✅ DO: 批量汇总
logger.info("batch_processing", total=len(large_list), batch_size=100)
```

---

## 指标收集 (Prometheus)

### 基础指标类型

```python
from prometheus_client import Counter, Histogram, Gauge, Summary

# Counter: 只增不减（请求数、错误数）
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

# Histogram: 分布统计（响应时间）
http_request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# Gauge: 可增可减（并发连接数）
active_connections = Gauge(
    "active_connections",
    "Number of active connections"
)

# Summary: 分位数统计
request_size = Summary(
    "request_size_bytes",
    "Request size in bytes"
)
```

### 中间件集成

```python
import time
from functools import wraps

def track_request_metrics(func):
    """请求指标追踪装饰器"""
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        method = request.method
        endpoint = request.url.path

        active_connections.inc()
        start_time = time.perf_counter()

        try:
            response = await func(request, *args, **kwargs)
            status = response.status_code
            return response
        except Exception as e:
            status = 500
            raise
        finally:
            duration = time.perf_counter() - start_time

            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=status
            ).inc()

            http_request_duration.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)

            active_connections.dec()

    return wrapper
```

### 业务指标

```python
# 订单相关指标
orders_created = Counter(
    "orders_created_total",
    "Total orders created",
    ["product_type", "payment_method"]
)

order_value = Histogram(
    "order_value_dollars",
    "Order value in dollars",
    buckets=[10, 50, 100, 500, 1000, 5000]
)

# 使用
orders_created.labels(
    product_type="subscription",
    payment_method="credit_card"
).inc()

order_value.observe(order.total_amount)
```

---

## 分布式追踪 (OpenTelemetry)

### 基础配置

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# 配置追踪器
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)
```

### Span 使用

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer(__name__)

async def process_order(order_id: str) -> Order:
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)

        try:
            # 子 Span
            with tracer.start_as_current_span("validate_order"):
                order = await validate_order(order_id)
                span.set_attribute("order.amount", order.amount)

            with tracer.start_as_current_span("charge_payment"):
                await charge_payment(order)

            with tracer.start_as_current_span("send_notification"):
                await send_confirmation(order)

            span.set_status(Status(StatusCode.OK))
            return order

        except Exception as e:
            span.set_status(Status(StatusCode.ERROR, str(e)))
            span.record_exception(e)
            raise
```

### 上下文传播

```python
from opentelemetry.propagate import inject, extract

# 发送请求时注入 trace context
async def call_external_service(url: str, data: dict):
    headers = {}
    inject(headers)  # 注入 traceparent 等 header

    async with httpx.AsyncClient() as client:
        return await client.post(url, json=data, headers=headers)

# 接收请求时提取 trace context
@app.middleware("http")
async def extract_trace_context(request: Request, call_next):
    context = extract(request.headers)
    with trace.use_span(
        tracer.start_span("http_request", context=context)
    ):
        return await call_next(request)
```

---

## 健康检查

```python
from enum import Enum
from pydantic import BaseModel

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

class ComponentHealth(BaseModel):
    name: str
    status: HealthStatus
    latency_ms: float | None = None
    message: str | None = None

class HealthResponse(BaseModel):
    status: HealthStatus
    components: list[ComponentHealth]

async def check_database() -> ComponentHealth:
    start = time.perf_counter()
    try:
        await db.execute("SELECT 1")
        latency = (time.perf_counter() - start) * 1000
        return ComponentHealth(
            name="database",
            status=HealthStatus.HEALTHY,
            latency_ms=latency
        )
    except Exception as e:
        return ComponentHealth(
            name="database",
            status=HealthStatus.UNHEALTHY,
            message=str(e)
        )

@app.get("/health")
async def health_check() -> HealthResponse:
    components = await asyncio.gather(
        check_database(),
        check_redis(),
        check_external_api(),
    )

    # 任一组件不健康则整体降级
    overall = HealthStatus.HEALTHY
    for c in components:
        if c.status == HealthStatus.UNHEALTHY:
            overall = HealthStatus.UNHEALTHY
            break
        elif c.status == HealthStatus.DEGRADED:
            overall = HealthStatus.DEGRADED

    return HealthResponse(status=overall, components=components)
```

---

## 告警规则示例

```yaml
# Prometheus 告警规则
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过 5%"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 延迟超过 1 秒"

      - alert: DatabaseConnectionPoolExhausted
        expr: db_pool_available_connections < 5
        for: 1m
        labels:
          severity: critical
```

---

## 最佳实践清单

| 维度 | 实践                                   |
| ---- | -------------------------------------- |
| 日志 | 结构化 JSON、关联 request_id、脱敏处理 |
| 指标 | 四个黄金信号、业务指标、合理的 bucket  |
| 追踪 | 关键路径 Span、上下文传播、异常记录    |
| 告警 | 分级告警、避免告警疲劳、关联 Runbook   |

---

## 相关文件

- [python.md](./python.md) - Python 后端主文件
- [python-patterns.md](./python-patterns.md) - 设计模式
- [python-types.md](./python-types.md) - 高级类型提示

---

## Maintenance

- Sources: OpenTelemetry docs, Prometheus docs, agents/python-observability
- Last updated: 2026-02-05
- Pattern: DO/DON'T 示例驱动
