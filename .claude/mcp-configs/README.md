# MCP 服务器配置

本目录提供开箱即用的 MCP (Model Context Protocol) 服务器配置，与项目的角色系统和工作流深度集成。

## 快速开始

### 1. 复制配置到全局

```bash
# 查看配置
cat .claude/mcp-configs/mcp-servers.json

# 将 mcpServers 部分合并到 ~/.claude.json
```

### 2. 修改必要配置

| MCP | 需要修改 | 获取方式 |
|-----|----------|----------|
| `filesystem` | args 中的路径 | 改为你的项目目录 |
| `supabase` | `--project-ref` | Supabase 项目设置页面 |
| `firecrawl` | `FIRECRAWL_API_KEY` | [firecrawl.dev](https://firecrawl.dev) |
| `github` | `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub Settings → Developer settings |

### 3. 项目级配置

在 `.claude/settings.local.json` 中启用/禁用：

```json
{
  "enabledMcpjsonServers": ["memory", "playwright", "context7"],
  "disabledMcpServers": ["github", "vercel"]
}
```

---

## MCP 分类

### 核心推荐（日常开发必备）

| MCP | 用途 | 配合角色 |
|-----|------|----------|
| `memory` | 跨会话持久化记忆 | 所有角色 |
| `sequential-thinking` | 链式思考推理增强 | `/lead`, `/pm` |
| `playwright` | 浏览器自动化和前端测试 | `/qa`, `/dev` |
| `context7` | 实时文档查询 | `/dev`, `/lead` |

### 数据库 & 后端

| MCP | 用途 | 配合角色 |
|-----|------|----------|
| `supabase` | Supabase 数据库操作 | `/dev` |
| `clickhouse` | ClickHouse 分析查询 | `/dev` |

### 部署 & 运维

| MCP | 用途 | 配合角色 |
|-----|------|----------|
| `vercel` | Vercel 部署和项目管理 | `/dev` |
| `railway` | Railway 部署 | `/dev` |
| `cloudflare-docs` | Cloudflare 文档搜索 | `/dev` |
| `cloudflare-workers-builds` | Cloudflare Workers 构建 | `/dev` |
| `cloudflare-workers-bindings` | Cloudflare Workers 绑定 | `/dev` |
| `cloudflare-observability` | Cloudflare 可观测性/日志 | `/qa`, `/dev` |

### 外部服务

| MCP | 用途 | 配合角色 |
|-----|------|----------|
| `github` | GitHub 操作（PR、Issue、仓库） | `/lead`, `/dev` |
| `firecrawl` | 网页抓取和爬取 | `/pm`, `/dev` |
| `filesystem` | 文件系统操作 | 所有角色 |

### UI & 设计

| MCP | 用途 | 配合角色 |
|-----|------|----------|
| `magic` | Magic UI 组件库 | `/designer`, `/dev` |

---

## 场景选择指南

### 前端项目

```json
{
  "enabledMcpjsonServers": [
    "memory",
    "playwright",        // 前端测试必备
    "context7",          // 框架文档查询
    "magic",             // UI 组件
    "vercel"             // 部署
  ]
}
```

### 后端 API 项目

```json
{
  "enabledMcpjsonServers": [
    "memory",
    "sequential-thinking",  // 复杂逻辑推理
    "supabase",             // 数据库
    "railway"               // 部署
  ]
}
```

### 全栈项目

```json
{
  "enabledMcpjsonServers": [
    "memory",
    "sequential-thinking",
    "playwright",
    "context7",
    "supabase",
    "vercel"
  ]
}
```

### 研究/分析项目

```json
{
  "enabledMcpjsonServers": [
    "memory",
    "sequential-thinking",
    "firecrawl",         // 网页抓取
    "clickhouse"         // 数据分析
  ]
}
```

---

## 与角色系统的配合

### /pm（产品经理）
- `firecrawl` - 竞品分析、市场调研
- `memory` - 跨会话保持需求上下文

### /lead（技术负责人）
- `sequential-thinking` - 架构决策推理
- `github` - PR 审查、代码管理
- `context7` - 技术文档查询

### /designer（设计师）
- `magic` - UI 组件参考
- `playwright` - UI 截图验证

### /dev（开发者）
- `context7` - 框架/库文档
- `supabase`/`clickhouse` - 数据库操作
- `vercel`/`railway` - 部署

### /qa（质量保证）
- `playwright` - E2E 测试
- `cloudflare-observability` - 日志分析

---

## 性能与限制

### 数量控制

> **关键原则**: 同时启用不超过 10 个 MCP

| 状态 | MCP 数量 | 影响 |
|------|----------|------|
| 推荐 | 5-7 个 | 响应快速，上下文充足 |
| 可接受 | 8-10 个 | 略有延迟 |
| 不推荐 | > 10 个 | 明显延迟，上下文压缩 |

### 按需启用原则

1. **只启用当前任务需要的 MCP**
2. **完成任务后禁用不再需要的**
3. **核心 MCP（memory, context7）可以常开**

### 环境变量安全

```bash
# ✅ 正确：使用环境变量
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export FIRECRAWL_API_KEY="fc-xxx"

# ❌ 错误：硬编码在配置文件
```

可以在 shell 配置文件中设置：
```bash
# ~/.bashrc 或 ~/.zshrc
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
```

---

## 默认配置

### 默认启用（7 个）

| MCP | 选择原因 |
|-----|----------|
| `memory` | 跨会话记忆，核心功能 |
| `sequential-thinking` | 复杂任务推理增强 |
| `playwright` | 前端测试必备 |
| `filesystem` | 文件操作基础 |
| `context7` | 实时文档查询 |
| `supabase` | 常用数据库方案 |
| `firecrawl` | 网页抓取常用 |

### 默认禁用（按需启用）

| MCP | 启用时机 |
|-----|----------|
| `github` | 需要管理 PR/Issue 时 |
| `vercel` | 使用 Vercel 部署时 |
| `railway` | 使用 Railway 部署时 |
| `cloudflare-*` | 使用 Cloudflare 服务时 |
| `clickhouse` | 需要分析型查询时 |
| `magic` | 需要 UI 组件参考时 |

---

## 故障排除

### MCP 无响应

1. 检查 npx 是否可用：`npx -v`
2. 清除 npx 缓存：`npx clear-npx-cache`
3. 检查网络连接（HTTP 类型 MCP）

### 环境变量未生效

1. 确认已 export：`echo $GITHUB_PERSONAL_ACCESS_TOKEN`
2. 重启 Claude Code
3. 检查 shell 配置文件是否正确

### 上下文过大

1. 减少启用的 MCP 数量
2. 使用 `disabledMcpServers` 临时禁用
3. 执行 `/compact` 压缩上下文

---

## 添加新 MCP

1. 在 `mcp-servers.json` 中添加配置
2. 更新本 README 的分类和说明
3. 在 `settings.local.json.example` 中更新列表

### MCP 配置格式

**NPX 类型**：
```json
{
  "my-mcp": {
    "command": "npx",
    "args": ["-y", "@scope/package-name"],
    "env": {
      "API_KEY": "YOUR_KEY_HERE"
    },
    "description": "用途说明"
  }
}
```

**HTTP 类型**：
```json
{
  "my-mcp": {
    "type": "http",
    "url": "https://mcp.example.com",
    "description": "用途说明"
  }
}
```

---

## 参考链接

- [MCP 官方文档](https://modelcontextprotocol.io)
- [MCP 服务器列表](https://github.com/modelcontextprotocol/servers)
- [Claude Code MCP 集成](https://docs.anthropic.com/claude/docs/claude-code-mcp)
