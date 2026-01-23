#!/usr/bin/env node
/**
 * PreCompact Hook - 上下文压缩前保存状态
 *
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 功能：
 * - 在 /compact 执行前保存当前进度
 * - 记录压缩前的上下文状态
 */

const path = require("path");
const {
  getMemoryBankDir,
  fileExists,
  readFile,
  appendFile,
  getDateTimeString,
  log,
} = require("../lib/utils");

async function main() {
  const memoryBank = getMemoryBankDir();
  const progressFile = path.join(memoryBank, "progress.md");

  if (fileExists(progressFile)) {
    const content = readFile(progressFile);

    // 统计当前状态
    const pendingTasks = (content?.match(/^- \[ \]/gm) || []).length;
    const completedTasks = (content?.match(/^- \[x\]/gim) || []).length;

    log(
      `[PreCompact] 压缩前状态: ${completedTasks} 已完成, ${pendingTasks} 待完成`,
    );
    log(`[PreCompact] 建议: 压缩后请先阅读 progress.md 恢复上下文`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[PreCompact] Error:", err.message);
  process.exit(0);
});
