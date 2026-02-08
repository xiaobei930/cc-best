#!/usr/bin/env node
/**
 * Stop Check: 响应完成时检查遗漏任务
 *
 * 在 Claude 完成响应时检查是否有未完成的任务：
 * 1. 检查 progress.md 中是否有 [ ] 未完成项
 * 2. 提醒用户注意遗漏
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: Stop
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 正常完成
 */

const path = require("path");
const {
  readStdinJson,
  readFile,
  fileExists,
  getMemoryBankDir,
  log,
} = require("../lib/utils");

// 配置
const PROJECT_ROOT = process.cwd();

/**
 * 检查 progress.md 中的未完成任务数量
 */
function getPendingTaskCount() {
  const progressPath = path.join(getMemoryBankDir(PROJECT_ROOT), "progress.md");
  if (!fileExists(progressPath)) {
    return 0;
  }

  const content = readFile(progressPath);
  if (!content) return 0;

  // 统计 [ ] 未完成项（排除 [x] 已完成项）
  const pendingMatches = content.match(/- \[ \]/g);
  return pendingMatches ? pendingMatches.length : 0;
}

/**
 * 主函数
 */
async function main() {
  try {
    const input = await readStdinJson();
    const stopReason = input.stop_reason || "end_turn";

    // 只在正常结束时检查（不在错误或中断时检查）
    if (stopReason === "end_turn") {
      const pendingCount = getPendingTaskCount();

      if (pendingCount > 0) {
        log(`[StopCheck] 📋 progress.md 中仍有 ${pendingCount} 个未完成任务`);
      }
    }

    // 不阻止停止，只提供信息
    process.exit(0);
  } catch {
    // 静默失败
    process.exit(0);
  }
}

main();
