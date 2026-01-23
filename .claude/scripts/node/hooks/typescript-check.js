#!/usr/bin/env node
/**
 * TypeScript 类型检查
 *
 * 在 PostToolUse Edit|Write hook 中运行
 * 跨平台支持（Windows/macOS/Linux）
 */

const path = require("path");
const { readStdinJson, log, fileExists, runCommand } = require("../lib/utils");

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  // 获取修改的文件路径
  let filePath = input?.tool_input?.file_path || "";

  if (!filePath) {
    process.exit(0);
  }

  // 检查是否是 TypeScript 文件
  if (!/\.(ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  // 检查是否存在 tsconfig.json
  if (!fileExists("tsconfig.json")) {
    process.exit(0);
  }

  log(`[TSCheck] 检查 TypeScript 类型: ${path.basename(filePath)}`);

  // 使用 tsc --noEmit 进行类型检查
  const result = runCommand(`npx tsc --noEmit --skipLibCheck "${filePath}"`);

  if (!result.success) {
    log("[TSCheck] 类型错误:");
    // 只显示前 20 行错误
    const lines = result.output.split("\n").slice(0, 20);
    lines.forEach((line) => log(line));
    // 不阻止操作，只警告
  } else {
    log("[TSCheck] 类型检查通过");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[TSCheck] Error:", err.message);
  process.exit(0);
});
