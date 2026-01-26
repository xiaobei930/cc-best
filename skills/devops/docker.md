# Docker 最佳实践

本文档提供 Docker 容器化的最佳实践和模式。

## Dockerfile 最佳实践

### 多阶段构建

```dockerfile
# ========== 构建阶段 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件（利用缓存）
COPY package*.json ./
RUN npm ci --only=production

# 复制源码并构建
COPY . .
RUN npm run build

# ========== 运行阶段 ==========
FROM node:20-alpine AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 只复制必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 切换到非 root 用户
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Python 多阶段构建

```dockerfile
# ========== 构建阶段 ==========
FROM python:3.12-slim AS builder

WORKDIR /app

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 创建虚拟环境
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ========== 运行阶段 ==========
FROM python:3.12-slim AS runner

WORKDIR /app

# 创建非 root 用户
RUN useradd --create-home --shell /bin/bash appuser

# 复制虚拟环境
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 复制应用代码
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Go 多阶段构建

```dockerfile
# ========== 构建阶段 ==========
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 复制 go.mod 和 go.sum
COPY go.mod go.sum ./
RUN go mod download

# 复制源码并构建
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server

# ========== 运行阶段 ==========
FROM scratch

# 复制 CA 证书（HTTPS 请求需要）
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 复制二进制文件
COPY --from=builder /app/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]
```

---

## 镜像优化

### 层缓存优化

```dockerfile
# ✅ 好：变化少的层在前面
COPY package*.json ./
RUN npm ci
COPY . .

# ❌ 差：每次代码变更都重新安装依赖
COPY . .
RUN npm ci
```

### 减小镜像大小

```dockerfile
# ✅ 使用 Alpine 基础镜像
FROM node:20-alpine    # ~50MB
# 而非
FROM node:20           # ~350MB

# ✅ 清理缓存
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ✅ 使用 .dockerignore
# .dockerignore 文件:
node_modules
.git
*.md
.env*
coverage
```

### .dockerignore 示例

```
# 依赖目录
node_modules
__pycache__
venv
.venv

# 版本控制
.git
.gitignore

# 开发文件
*.md
.env*
.vscode
.idea

# 测试和覆盖率
coverage
.pytest_cache
__tests__

# 构建产物
dist
build
*.log
```

---

## Docker Compose

### 开发环境 Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules  # 排除 node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 生产环境 Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
```

---

## 健康检查

### Dockerfile 健康检查

```dockerfile
# HTTP 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 或使用自定义脚本
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD ["/app/healthcheck.sh"]
```

### 健康检查端点

```typescript
// Node.js 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await db.$queryRaw`SELECT 1`

    // 检查 Redis 连接
    await redis.ping()

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        redis: 'ok'
      }
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message
    })
  }
})
```

---

## 安全最佳实践

### 非 root 用户运行

```dockerfile
# 创建用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 设置文件权限
COPY --chown=appuser:appuser . .

# 切换用户
USER appuser
```

### 最小权限原则

```dockerfile
# ✅ 只读文件系统
docker run --read-only myapp

# ✅ 限制能力
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp

# ✅ 无新权限
docker run --security-opt=no-new-privileges myapp
```

### 镜像扫描

```bash
# 使用 Docker Scout 扫描
docker scout cves myimage:tag

# 使用 Trivy 扫描
trivy image myimage:tag

# 使用 Snyk 扫描
snyk container test myimage:tag
```

---

## 日志管理

### 日志驱动配置

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"    # 单个日志文件最大 10MB
        max-file: "3"      # 最多保留 3 个文件
        labels: "app,env"
        env: "NODE_ENV"
```

### 应用日志输出

```typescript
// ✅ 日志输出到 stdout/stderr
console.log(JSON.stringify({
  level: 'info',
  message: '应用启动',
  timestamp: new Date().toISOString()
}))

// ❌ 不要写入文件
// fs.appendFileSync('/var/log/app.log', message)
```

---

## 网络配置

### 自定义网络

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    networks:
      - frontend-net

  backend:
    networks:
      - frontend-net
      - backend-net

  database:
    networks:
      - backend-net

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true  # 内部网络，无法访问外部
```

### 网络别名

```yaml
services:
  db:
    image: postgres:16-alpine
    networks:
      backend:
        aliases:
          - database
          - postgres
```

---

## 数据持久化

### Volume 类型

```yaml
services:
  db:
    volumes:
      # 命名卷 - 推荐用于数据库
      - postgres_data:/var/lib/postgresql/data

      # 绑定挂载 - 开发时使用
      - ./data:/app/data

      # 临时卷 - 临时文件
      - type: tmpfs
        target: /tmp

volumes:
  postgres_data:
    driver: local
```

### 备份和恢复

```bash
# 备份数据库卷
docker run --rm \
  -v postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# 恢复数据库卷
docker run --rm \
  -v postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 常用命令

```bash
# 构建镜像
docker build -t myapp:v1 .
docker build -t myapp:v1 -f Dockerfile.prod .

# 运行容器
docker run -d -p 3000:3000 --name myapp myapp:v1
docker run -it --rm myapp:v1 sh  # 交互式运行

# 查看日志
docker logs myapp
docker logs -f myapp  # 跟踪日志
docker logs --tail 100 myapp  # 最后 100 行

# 进入容器
docker exec -it myapp sh

# 资源使用
docker stats

# 清理
docker system prune -a  # 清理未使用的镜像、容器、网络
docker volume prune     # 清理未使用的卷

# Compose 命令
docker compose up -d
docker compose down
docker compose logs -f
docker compose ps
docker compose exec app sh
```

---

## 最佳实践清单

- [ ] 使用多阶段构建减小镜像大小
- [ ] 使用特定版本标签，而非 `latest`
- [ ] 以非 root 用户运行容器
- [ ] 配置健康检查
- [ ] 使用 .dockerignore 排除不必要文件
- [ ] 优化层缓存（变化少的层在前）
- [ ] 日志输出到 stdout/stderr
- [ ] 配置资源限制
- [ ] 定期扫描镜像漏洞
- [ ] 使用命名卷持久化数据
