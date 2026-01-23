#!/usr/bin/env node
/**
 * SessionEnd Hook - 会话结束时保存状态
 *
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 功能：
 * - 记录会话结束时间
 * - 保存会话统计信息（可选）
 */

const path = require("path");
const {
  getMemoryBankDir,
  fileExists,
  appendFile,
  getDateTimeString,
  log,
} = require("../lib/utils");

async function main() {
  const memoryBank = getMemoryBankDir();
  const progressFile = path.join(memoryBank, "progress.md");

  // 只在 progress.md 存在时记录
  if (fileExists(progressFile)) {
    log(`[SessionEnd] 会话结束于 ${getDateTimeString()}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[SessionEnd] Error:", err.message);
  process.exit(0);
});
