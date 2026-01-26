# CI/CD 最佳实践

本文档提供 CI/CD 流水线的最佳实践，涵盖 GitHub Actions 和 GitLab CI。

## GitHub Actions

### 基础工作流结构

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          retention-days: 7
```

### 带数据库的测试

```yaml
# .github/workflows/test-with-db.yml
name: Test with Database

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
```

### Docker 镜像构建和推送

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 部署工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Staging
        run: |
          echo "Deploying to staging..."
          # 部署命令

  deploy-production:
    if: github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # 部署命令
```

### 多平台构建

```yaml
# .github/workflows/multi-platform.yml
name: Multi-Platform Build

on:
  push:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

---

## GitLab CI

### 基础流水线

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

default:
  image: node:${NODE_VERSION}-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

# Lint 阶段
lint:
  stage: lint
  script:
    - npm ci
    - npm run lint
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

# 测试阶段
test:
  stage: test
  services:
    - name: postgres:16-alpine
      alias: db
    - name: redis:7-alpine
      alias: redis
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://test:test@db:5432/testdb
    REDIS_URL: redis://redis:6379
  script:
    - npm ci
    - npm run db:migrate
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# 构建阶段
build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# 部署到 Staging
deploy:staging:
  stage: deploy
  image: alpine:latest
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - echo "Deploying to staging..."
    # 部署命令
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# 部署到 Production（手动）
deploy:production:
  stage: deploy
  image: alpine:latest
  environment:
    name: production
    url: https://example.com
  script:
    - echo "Deploying to production..."
    # 部署命令
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
```

### Docker 镜像构建

```yaml
# .gitlab-ci.yml
stages:
  - build
  - push

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_NAME: $CI_REGISTRY_IMAGE

build:docker:
  stage: build
  image: docker:24-dind
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

push:latest:
  stage: push
  image: docker:24-dind
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker pull $IMAGE_NAME:$CI_COMMIT_SHA
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest
    - docker push $IMAGE_NAME:latest
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

push:tag:
  stage: push
  image: docker:24-dind
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker pull $IMAGE_NAME:$CI_COMMIT_SHA
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:$CI_COMMIT_TAG
    - docker push $IMAGE_NAME:$CI_COMMIT_TAG
  rules:
    - if: $CI_COMMIT_TAG
```

---

## 通用最佳实践

### 缓存策略

```yaml
# GitHub Actions 缓存
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# GitLab CI 缓存
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
  policy: pull-push
```

### 并行执行

```yaml
# GitHub Actions 矩阵
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npm test -- --shard=${{ matrix.shard }}/4

# GitLab CI 并行
test:
  parallel: 4
  script:
    - npm test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

### 条件执行

```yaml
# GitHub Actions
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

  # 路径过滤
  test-frontend:
    if: contains(github.event.head_commit.modified, 'frontend/')

# GitLab CI
deploy:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_TAG
    - changes:
        - src/**/*
      when: always
    - when: never
```

### 环境变量和密钥

```yaml
# GitHub Actions
jobs:
  deploy:
    environment: production
    env:
      API_URL: ${{ vars.API_URL }}
      API_KEY: ${{ secrets.API_KEY }}

# GitLab CI
deploy:
  environment: production
  variables:
    API_URL: $API_URL
  script:
    - echo "Using API key from CI/CD variables"
```

### 通知

```yaml
# GitHub Actions - Slack 通知
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

# GitLab CI - Slack 通知
notify:success:
  stage: .post
  script:
    - |
      curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"Pipeline succeeded for '"$CI_PROJECT_NAME"'"}' \
        $SLACK_WEBHOOK_URL
  when: on_success
```

---

## 安全扫描

### 依赖漏洞扫描

```yaml
# GitHub Actions
- name: Run npm audit
  run: npm audit --audit-level=high

- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

# GitLab CI（内置）
include:
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  - template: Security/SAST.gitlab-ci.yml
```

### 代码质量扫描

```yaml
# GitHub Actions - SonarCloud
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

# GitLab CI（内置）
include:
  - template: Code-Quality.gitlab-ci.yml
```

---

## 版本发布

### 自动版本号

```yaml
# GitHub Actions - semantic-release
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

### Changelog 生成

```yaml
# .releaserc.yml
branches:
  - main
plugins:
  - '@semantic-release/commit-analyzer'
  - '@semantic-release/release-notes-generator'
  - '@semantic-release/changelog'
  - '@semantic-release/npm'
  - '@semantic-release/github'
  - '@semantic-release/git'
```

---

## 最佳实践清单

### 流水线设计

- [ ] 保持流水线快速（< 10 分钟）
- [ ] 使用缓存减少安装时间
- [ ] 并行执行独立任务
- [ ] 失败快速（lint 在 test 之前）
- [ ] 使用矩阵测试多版本/多平台

### 安全

- [ ] 密钥存储在 CI 变量中，不在代码中
- [ ] 使用最小权限原则
- [ ] 启用依赖漏洞扫描
- [ ] 启用代码安全扫描
- [ ] 审计第三方 Actions/Scripts

### 可维护性

- [ ] 使用可复用的工作流/模板
- [ ] 版本锁定 Actions/Scripts
- [ ] 添加有意义的日志输出
- [ ] 配置通知（成功/失败）
- [ ] 文档化流水线配置

### 部署

- [ ] 使用环境保护规则
- [ ] 生产部署需要审批
- [ ] 支持回滚
- [ ] 使用金丝雀/蓝绿部署
- [ ] 部署后执行健康检查
