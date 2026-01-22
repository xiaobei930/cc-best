---
allowed-tools: Read, Glob, Bash
---

# /run - 启动服务

启动项目的开发服务器。

## 参数
`$ARGUMENTS` - 可选，指定启动的服务

示例：
- `/run` - 启动所有服务
- `/run api` - 只启动后端 API
- `/run frontend` - 只启动前端

## 任务
1. 检测可用的服务组件
2. 根据 $ARGUMENTS 启动指定服务（或全部）
3. 显示服务访问地址

## 服务类型
- 后端 API：Flask, FastAPI, Django, Spring Boot, ASP.NET
- 前端：Vite, Webpack Dev Server, Vue CLI

## 启动步骤
- 检查端口占用情况
- 按依赖顺序启动服务
- 显示各服务的访问 URL

## 注意事项
- 确保虚拟环境已激活（Python）
- 确保依赖已安装（npm install / pip install）
- 检查必要的环境变量
