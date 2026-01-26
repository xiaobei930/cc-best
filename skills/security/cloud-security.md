# 云基础设施安全

本文档补充 SKILL.md 中的安全检查，专注于云部署和基础设施安全。

## 触发条件

- 部署应用到云平台（AWS/Vercel/Railway/Cloudflare）
- 配置 IAM 角色和权限
- 设置 CI/CD 流水线
- 实现基础设施即代码（Terraform/CloudFormation）
- 配置日志和监控
- 管理云环境中的密钥

---

## 1. IAM 与访问控制

### 最小权限原则

```yaml
# ✅ 正确：最小权限
iam_role:
  permissions:
    - s3:GetObject      # 只读
    - s3:ListBucket
  resources:
    - arn:aws:s3:::my-bucket/*  # 特定桶

# ❌ 错误：过于宽泛
iam_role:
  permissions:
    - s3:*              # 所有 S3 操作
  resources:
    - "*"               # 所有资源
```

### 服务账户最佳实践

```typescript
// ✅ 使用短期凭证（AWS SDK 自动轮换）
import { S3Client } from "@aws-sdk/client-s3";

// SDK 自动从环境/IAM Role 获取凭证
const s3 = new S3Client({ region: "us-east-1" });

// ❌ 避免长期凭证
const s3 = new S3Client({
  credentials: {
    accessKeyId: "AKIAXXXXXXXX", // 硬编码
    secretAccessKey: "xxxxx",
  },
});
```

### 检查项

- [ ] 生产环境无 root 账户使用
- [ ] 所有特权账户启用 MFA
- [ ] 服务账户使用 Role，非长期凭证
- [ ] IAM 策略遵循最小权限
- [ ] 定期审查访问权限
- [ ] 未使用的凭证已轮换或删除

---

## 2. 云密钥管理

### 使用云密钥管理服务

```typescript
// ✅ AWS Secrets Manager
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManager({ region: "us-east-1" });

async function getSecret(secretId: string) {
  const response = await client.getSecretValue({ SecretId: secretId });
  return JSON.parse(response.SecretString || "{}");
}

// 使用
const { apiKey, dbPassword } = await getSecret("prod/app-secrets");
```

```typescript
// ✅ Vercel 环境变量（自动加密）
// 通过 Dashboard 或 CLI 设置，代码中直接使用
const apiKey = process.env.API_KEY;

// ✅ Railway 变量（自动注入）
const dbUrl = process.env.DATABASE_URL;
```

### 密钥轮换策略

```bash
# AWS 自动轮换配置
aws secretsmanager rotate-secret \
  --secret-id prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate \
  --rotation-rules AutomaticallyAfterDays=30
```

### 检查项

- [ ] 所有密钥存储在云密钥管理服务
- [ ] 数据库凭证启用自动轮换
- [ ] API 密钥至少每季度轮换
- [ ] 密钥访问启用审计日志
- [ ] 代码/日志/错误信息中无密钥

---

## 3. 网络安全

### VPC 和防火墙配置

```hcl
# Terraform - 私有子网配置
resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false  # 私有子网
}

# 安全组 - 最小开放
resource "aws_security_group" "app" {
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # 仅 VPC 内部
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### Cloudflare 安全配置

```typescript
// wrangler.toml - Workers 安全配置
// [vars]
// 不在这里放敏感信息，使用 secrets

// 添加安全头
export default {
  async fetch(request: Request) {
    const response = await handleRequest(request);

    // 安全响应头
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Strict-Transport-Security", "max-age=31536000");

    return response;
  },
};
```

### 检查项

- [ ] 数据库不暴露公网
- [ ] 仅必要端口开放
- [ ] 启用 WAF（Web 应用防火墙）
- [ ] 配置 DDoS 防护
- [ ] 内部服务使用私有网络
- [ ] 启用 VPC Flow Logs

---

## 4. CI/CD 安全

### GitHub Actions 安全

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write # OIDC 认证

    steps:
      # ✅ 使用 OIDC，无需长期密钥
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: us-east-1

      # ✅ 固定依赖版本
      - uses: actions/checkout@v4

      # ✅ 依赖审计
      - name: Audit dependencies
        run: npm audit --audit-level=high

      # ✅ 密钥扫描
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
```

### 环境隔离

```yaml
# 不同环境使用不同密钥
# GitHub Settings > Environments

# production 环境
# - 需要审批
# - 仅 main 分支可部署
# - 使用生产密钥

# staging 环境
# - 无需审批
# - 使用测试密钥
```

### 检查项

- [ ] CI/CD 使用 OIDC 认证（非长期密钥）
- [ ] Actions/依赖版本已固定
- [ ] 启用依赖漏洞扫描
- [ ] 启用密钥泄露扫描
- [ ] 生产部署需要审批
- [ ] 环境间密钥隔离

---

## 5. 日志与监控

### 集中化日志

```typescript
// 结构化日志
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // 脱敏处理
  redact: ["req.headers.authorization", "password", "token"],
});

// 使用
logger.info({ userId, action: "login" }, "用户登录");
logger.error({ err, requestId }, "请求失败");
```

### 告警配置

```yaml
# CloudWatch 告警示例
resource "aws_cloudwatch_metric_alarm" "errors" {
alarm_name          = "high-error-rate"
comparison_operator = "GreaterThanThreshold"
evaluation_periods  = 2
metric_name         = "5XXError"
namespace           = "AWS/ApiGateway"
period              = 300
statistic           = "Sum"
threshold           = 10
alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

### 检查项

- [ ] 所有服务日志集中收集
- [ ] 日志中敏感信息已脱敏
- [ ] 错误率告警已配置
- [ ] 异常登录告警已配置
- [ ] 日志保留符合合规要求
- [ ] 启用访问日志审计

---

## 6. 各平台安全速查

### Vercel

```bash
# 环境变量加密存储
vercel env add API_KEY production

# 启用安全头
# vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### Railway

```bash
# 私有网络（服务间通信）
# 使用内部 DNS：service-name.railway.internal

# 环境变量
railway variables set API_KEY=xxx
```

### Cloudflare Workers

```bash
# 密钥管理
wrangler secret put API_KEY

# 访问控制
# 使用 Cloudflare Access 保护管理端点
```

---

## 部署前安全检查清单

### 基础设施

- [ ] **IAM**: 最小权限，无 root 使用
- [ ] **网络**: 数据库私有，WAF 启用
- [ ] **密钥**: 云服务托管，自动轮换
- [ ] **日志**: 集中收集，敏感信息脱敏

### CI/CD

- [ ] **认证**: OIDC 或短期凭证
- [ ] **扫描**: 依赖审计 + 密钥扫描
- [ ] **隔离**: 环境间密钥分离
- [ ] **审批**: 生产部署需审批

### 监控

- [ ] **告警**: 错误率、异常访问
- [ ] **审计**: 访问日志、变更记录
- [ ] **响应**: 安全事件响应流程

---

## 参考资源

- [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
- [Vercel Security](https://vercel.com/docs/security)
- [Cloudflare Security Best Practices](https://developers.cloudflare.com/fundamentals/security/)
