#!/usr/bin/env node
/**
 * Session End: 会话结束时持久化状态
 *
 * 在会话结束时运行，提醒保存重要信息。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: SessionEnd
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 正常完成
 */

const path = require("path");
const {
  fileExists,
  getMemoryBankDir,
  runCommand,
  log,
} = require("../lib/utils");

const PROJECT_ROOT = process.cwd();

/**
 * 主函数
 */
async function main() {
  try {
    const memoryBankDir = getMemoryBankDir(PROJECT_ROOT);
    const progressPath = path.join(memoryBankDir, "progress.md");

    // 检查 progress.md 是否存在
    if (fileExists(progressPath)) {
      log("[SessionEnd] 请确保已更新 progress.md");
    }

    // 检查是否有未提交的变更
    const result = runCommand("git status --porcelain");
    if (result.success && result.output) {
      const lines = result.output
        .trim()
        .split("\n")
        .filter((l) => l.trim());
      if (lines.length > 0) {
        log(`[SessionEnd] 有 ${lines.length} 个未提交的变更`);
      }
    }

    process.exit(0);
  } catch {
    // 静默失败
    process.exit(0);
  }
}

main();
