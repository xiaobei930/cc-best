---
paths:
  - "**/*.py"
---

# Python 性能优化规范 | Python Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供 Python 特定性能规范

## 禁止操作

### 禁止在循环中执行数据库查询（N+1 问题）

```python
# ❌ 每次循环一条 SQL，100 个订单 = 100 次查询
for order in orders:
    user = db.query(User).filter(User.id == order.user_id).first()
    order.user_name = user.name

# ✅ 批量查询 + 字典关联
user_ids = {order.user_id for order in orders}
users = db.query(User).filter(User.id.in_(user_ids)).all()
user_map = {u.id: u for u in users}

for order in orders:
    order.user_name = user_map[order.user_id].name

# ✅ SQLAlchemy joinedload 预加载
from sqlalchemy.orm import joinedload

orders = db.query(Order).options(joinedload(Order.user)).all()
```

### 禁止在循环中拼接字符串

```python
# ❌ 每次拼接创建新字符串对象，O(n^2) 复杂度
result = ""
for item in items:
    result += str(item) + ", "

# ✅ 使用 join，O(n) 复杂度
result = ", ".join(str(item) for item in items)

# ✅ 大量格式化字符串使用 io.StringIO
from io import StringIO

buffer = StringIO()
for item in items:
    buffer.write(f"{item}\n")
result = buffer.getvalue()
```

### 禁止在热路径中使用全局解释器锁（GIL）密集操作替代并发

```python
# ❌ CPU 密集型任务用多线程（GIL 限制，无法真正并行）
from threading import Thread

threads = [Thread(target=heavy_computation, args=(data,)) for data in chunks]

# ✅ CPU 密集型使用多进程
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(heavy_computation, chunks))

# ✅ IO 密集型使用 asyncio 或多线程
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(fetch_url, urls))
```

---

## 必须遵守

### asyncio 正确使用模式

```python
import asyncio
import aiohttp

# ✅ 并发执行多个 IO 操作
async def fetch_all(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

async def fetch_one(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json()

# ✅ 使用 asyncio.Semaphore 限制并发数
async def fetch_with_limit(urls: list[str], max_concurrent: int = 10):
    semaphore = asyncio.Semaphore(max_concurrent)

    async def limited_fetch(url: str):
        async with semaphore:
            return await fetch_one(session, url)

    async with aiohttp.ClientSession() as session:
        return await asyncio.gather(*[limited_fetch(url) for url in urls])

# ❌ 在异步代码中调用阻塞函数
async def bad_handler():
    result = requests.get("https://api.example.com")  # 阻塞整个事件循环

# ✅ 使用 run_in_executor 包装阻塞调用
async def good_handler():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, requests.get, "https://api.example.com")
```

### 使用生成器和迭代器处理大数据集

```python
# ❌ 一次性加载全部数据到内存
def process_large_file(path: str) -> list[dict]:
    with open(path) as f:
        data = json.load(f)  # 可能耗尽内存
    return [transform(item) for item in data]

# ✅ 使用生成器逐行处理
def process_large_file(path: str):
    with open(path) as f:
        for line in f:
            yield transform(json.loads(line))

# ✅ 使用 itertools 高效组合
import itertools

def process_in_batches(items, batch_size: int = 1000):
    iterator = iter(items)
    while batch := list(itertools.islice(iterator, batch_size)):
        yield batch
```

### 缓存策略

```python
from functools import lru_cache, cache

# ✅ 使用 lru_cache 缓存纯函数结果
@lru_cache(maxsize=256)
def get_user_permissions(user_id: int) -> frozenset[str]:
    return frozenset(db.get_permissions(user_id))

# ✅ Python 3.9+ 无限缓存
@cache
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# ✅ 使用 Redis 缓存热数据（分布式场景）
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def get_product(product_id: int) -> dict:
    cache_key = f"product:{product_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    product = db.query(Product).get(product_id)
    r.setex(cache_key, 600, json.dumps(product.to_dict()))  # 缓存 10 分钟
    return product.to_dict()
```

### 连接池管理

```python
# ✅ SQLAlchemy 连接池配置
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # 常驻连接数
    max_overflow=20,        # 允许的额外连接
    pool_timeout=30,        # 获取连接超时（秒）
    pool_recycle=1800,      # 连接回收周期（秒），需小于数据库 wait_timeout
    pool_pre_ping=True,     # 每次使用前检测连接存活
)

# ✅ aiohttp 连接池
import aiohttp

connector = aiohttp.TCPConnector(
    limit=100,              # 总连接数上限
    limit_per_host=10,      # 每个主机连接数上限
    ttl_dns_cache=300,      # DNS 缓存时间
)
session = aiohttp.ClientSession(connector=connector)
```

---

## 推荐做法

### 性能分析工具

```python
# cProfile — 函数级性能分析
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# ... 被测代码 ...
profiler.disable()
stats = pstats.Stats(profiler).sort_stats("cumulative")
stats.print_stats(20)  # 打印耗时最长的 20 个函数

# tracemalloc — 内存分析
import tracemalloc

tracemalloc.start()
# ... 被测代码 ...
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics("lineno")
for stat in top_stats[:10]:
    print(stat)
```

```bash
# py-spy — 生产环境性能采样（无需修改代码）
py-spy record -o profile.svg --pid 12345
py-spy top --pid 12345

# memory_profiler — 逐行内存分析
# @profile 装饰目标函数后运行：
python -m memory_profiler script.py
```

### C 扩展加速计算密集型操作

```python
# ✅ 使用 NumPy 向量化替代 Python 循环
import numpy as np

# ❌ 纯 Python 循环
result = [x ** 2 + 2 * x + 1 for x in data]  # 慢

# ✅ NumPy 向量化
arr = np.array(data)
result = arr ** 2 + 2 * arr + 1  # 快 10-100x

# ✅ 使用 Cython 加速关键路径（需要编译）
# cython: boundscheck=False, wraparound=False
# def heavy_compute(double[:] data): ...

# ✅ 使用 ctypes/cffi 调用 C 库
import ctypes

lib = ctypes.CDLL("./libcompute.so")
lib.process.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int]
lib.process.restype = ctypes.c_double
```

### 常见性能反模式

```python
# ❌ 使用 list 做成员检查（O(n)）
if item in large_list:  # 线性搜索
    pass

# ✅ 使用 set 或 frozenset（O(1)）
large_set = set(large_list)
if item in large_set:  # 哈希查找
    pass

# ❌ 重复创建相同的正则表达式
import re
for line in lines:
    match = re.search(r"\d{4}-\d{2}-\d{2}", line)  # 每次重新编译

# ✅ 预编译正则表达式
DATE_PATTERN = re.compile(r"\d{4}-\d{2}-\d{2}")
for line in lines:
    match = DATE_PATTERN.search(line)

# ❌ 使用全局变量作为默认可变参数
def append_to(item, target=[]):  # 所有调用共享同一个 list
    target.append(item)
    return target

# ✅ 使用 None 作为默认值
def append_to(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```

### 数据类与 **slots** 优化内存

```python
# ✅ 使用 __slots__ 减少实例内存占用（适合大量实例的场景）
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

# ✅ 使用 dataclass + slots（Python 3.10+）
from dataclasses import dataclass

@dataclass(slots=True)
class Point:
    x: float
    y: float

# 对比：普通类每个实例约 200+ 字节，__slots__ 约 64 字节
```
