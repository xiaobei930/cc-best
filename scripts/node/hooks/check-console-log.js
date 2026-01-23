#!/usr/bin/env node
/**
 * Claude Code Hook: 检查 console.log 语句
 *
 * 在编辑 JS/TS 文件后检查是否有 console.log 语句。
 *
 * 跨平台支持（Windows/macOS/Linux）
 */

const fs = require("fs");
const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path || "";

  // 只检查 JS/TS 文件
  if (!/\.(js|jsx|ts|tsx)$/i.test(filePath)) {
    process.exit(0);
  }

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  // 读取文件内容
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    process.exit(0);
  }

  // 检查 console.log
  const consoleLogs = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 跳过注释行
    if (line.trim().startsWith("//")) {
      continue;
    }
    if (line.includes("console.log")) {
      const lineNum = i + 1;
      const preview = line.trim().slice(0, 60);
      consoleLogs.push(`  Line ${lineNum}: ${preview}`);
    }
  }

  if (consoleLogs.length > 0) {
    log(`[Hook] WARNING: console.log found in ${filePath}`);
    // 最多显示 5 个
    for (const logLine of consoleLogs.slice(0, 5)) {
      log(logLine);
    }
    if (consoleLogs.length > 5) {
      log(`  ... and ${consoleLogs.length - 5} more`);
    }
    log("[Hook] Remove console.log before committing");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[CheckConsoleLog] Error:", err.message);
  process.exit(0);
});
