---
name: isolated-research
description: "Deep code research in isolated context without polluting main session. Use for exploring large codebases, understanding complex modules, or tracing call chains."
argument-hint: [研究主题或问题]
context: fork
agent: Explore
model: haiku
allowed-tools: Read, Grep, Glob
parent-skill: codebase-exploration
---

# 隔离研究任务

> 本技能是 `codebase-exploration` 的子策略，适用于快速、一次性的代码探索。

你正在一个**隔离的子代理上下文**中运行。这意味着：

- 你无法访问主会话的对话历史
- 你的研究结果将被汇总返回给主会话
- 你可以自由探索，不用担心上下文污染

## 研究目标

$ARGUMENTS

## 研究方法

### 第一步：理解问题范围

1. 使用 Glob 找到相关文件：
   - 按文件名模式搜索
   - 按目录结构探索

2. 使用 Grep 定位关键代码：
   - 搜索函数/类定义
   - 搜索关键变量或常量
   - 搜索注释和文档

### 第二步：深入分析

1. Read 关键文件获取完整上下文
2. 追踪调用链和依赖关系
3. 理解数据流和控制流

### 第三步：形成结论

1. 总结发现的关键信息
2. 列出相关文件和代码位置
3. 提供可操作的建议

## 输出格式

请以以下格式输出研究结果：

```markdown
## 研究结论

### 摘要

[1-2 句话总结发现]

### 关键文件

- `path/to/file.ts:123` - 功能说明
- `path/to/another.ts:456` - 功能说明

### 详细发现

[按重要性排列的发现]

### 建议

[可操作的下一步建议]
```

## 重要提示

- **只读操作**：你只能使用 Read、Grep、Glob 工具
- **聚焦主题**：不要偏离研究目标
- **引用具体**：始终包含文件路径和行号
- **高效搜索**：先用 Glob/Grep 缩小范围，再用 Read 深入

---

开始研究 "$ARGUMENTS"...
