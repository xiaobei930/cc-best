#!/usr/bin/env node
/**
 * Claude Code 项目初始化脚本
 *
 * 用法: node .claude/scripts/node/hooks/init.js
 * 跨平台支持（Windows/macOS/Linux）
 */

const fs = require("fs");
const path = require("path");
const { ensureDir, fileExists, writeFile, log } = require("../lib/utils");

// 颜色输出（支持跨平台）
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const NC = "\x1b[0m"; // No Color

function success(msg) {
  console.log(`${GREEN}✅${NC} ${msg}`);
}

function skip(msg) {
  console.log(`${YELLOW}⏭️${NC} ${msg}`);
}

function copyIfNotExists(src, dest, description) {
  if (!fileExists(dest)) {
    if (fileExists(src)) {
      fs.copyFileSync(src, dest);
      success(`创建 ${description}`);
    }
  } else {
    skip(`${description} 已存在`);
  }
}

function createFileIfNotExists(filePath, content, description) {
  if (!fileExists(filePath)) {
    ensureDir(path.dirname(filePath));
    writeFile(filePath, content);
    success(`创建 ${description}`);
  } else {
    skip(`${description} 已存在`);
  }
}

function main() {
  console.log("🚀 Claude Code 项目初始化");
  console.log("==========================");
  console.log("");

  // 1. 创建 settings.local.json
  copyIfNotExists(
    ".claude/settings.local.json.example",
    ".claude/settings.local.json",
    "settings.local.json",
  );

  // 2. 创建 Hookify 规则文件
  const hookifyExamples = fs
    .readdirSync(".claude")
    .filter((f) => f.match(/^hookify\..*\.local\.md\.example$/));
  for (const example of hookifyExamples) {
    const target = example.replace(".example", "");
    copyIfNotExists(
      path.join(".claude", example),
      path.join(".claude", target),
      target,
    );
  }

  // 3. 创建必要目录
  const dirs = [
    ".claude/screenshots",
    ".claude/logs",
    "memory-bank",
    "docs/requirements",
    "docs/designs",
    "docs/tasks",
  ];
  for (const dir of dirs) {
    ensureDir(dir);
  }
  success("创建目录结构");

  // 4. 创建 Memory Bank 文件
  createFileIfNotExists(
    "memory-bank/progress.md",
    `# 项目进度

## 当前状态
- **阶段**: 初始化
- **进度**: 0%

## 待办任务
- [ ] 完成项目初始化
- [ ] 定义技术栈
- [ ] 创建第一个需求

## 已完成
（暂无）

## 阻塞项
（暂无）
`,
    "memory-bank/progress.md",
  );

  createFileIfNotExists(
    "memory-bank/architecture.md",
    `# 系统架构

## 概述
（待定义）

## 模块划分
（待定义）

## 数据流
（待定义）
`,
    "memory-bank/architecture.md",
  );

  createFileIfNotExists(
    "memory-bank/tech-stack.md",
    `# 技术栈

## 后端
- **语言**: （待定义）
- **框架**: （待定义）
- **数据库**: （待定义）

## 前端
- **框架**: （待定义）
- **UI 库**: （待定义）

## 工具链
- **包管理**: （待定义）
- **构建工具**: （待定义）
- **测试框架**: （待定义）
`,
    "memory-bank/tech-stack.md",
  );

  console.log("");
  console.log("==========================");
  success("初始化完成！");
  console.log("");
  console.log("下一步：");
  console.log("  1. 编辑 CLAUDE.md 填写项目信息");
  console.log("  2. 编辑 memory-bank/tech-stack.md 定义技术栈");
  console.log("  3. 运行 /pm 开始第一个需求");
}

try {
  main();
} catch (err) {
  console.error("[Init] Error:", err.message);
  process.exit(1);
}
