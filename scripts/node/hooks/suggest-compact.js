#!/usr/bin/env node
/**
 * Suggest Compact: 策略性压缩提醒
 *
 * 在工具调用达到阈值时提醒用户考虑压缩上下文。
 * 这是对 Claude Code 官方 auto-compact bug 的 workaround。
 *
 * 背景：
 * - 官方 auto-compact 设计在 95% 时触发，但有 bug 可能失败
 * - 当上下文超过 ~85% 时，/compact 命令也可能失败
 * - 因此需要在更早的时机（基于工具调用次数估算）提醒用户
 *
 * 触发时机: PostToolUse (每次工具调用后)
 * 匹配工具: * (所有工具)
 *
 * 配置:
 * - COMPACT_THRESHOLD: 首次提醒的工具调用数 (默认: 40)
 * - COMPACT_INTERVAL: 后续提醒间隔 (默认: 20)
 *
 * Exit codes:
 * - 0: 正常（不阻止操作）
 */

const path = require("path");
const {
  getTempDir,
  getSessionId,
  fileExists,
  readFile,
  writeFile,
  log,
} = require("../lib/utils");

// 配置
const THRESHOLD = parseInt(process.env.COMPACT_THRESHOLD || "40", 10);
const INTERVAL = parseInt(process.env.COMPACT_INTERVAL || "20", 10);

/**
 * 获取计数器文件路径（按会话隔离）
 */
function getCounterFilePath() {
  const sessionId = getSessionId("default");
  return path.join(getTempDir(), `claude-tool-count-${sessionId}.txt`);
}

/**
 * 读取当前计数
 */
function readCount() {
  const counterFile = getCounterFilePath();
  if (!fileExists(counterFile)) {
    return 0;
  }
  const content = readFile(counterFile);
  return parseInt(content, 10) || 0;
}

/**
 * 写入计数
 */
function writeCount(count) {
  const counterFile = getCounterFilePath();
  writeFile(counterFile, String(count));
}

/**
 * 主函数
 */
function main() {
  // 增加计数
  const count = readCount() + 1;
  writeCount(count);

  // 首次达到阈值时提醒
  if (count === THRESHOLD) {
    log(
      `[CompactReminder] ⚠️ 已进行 ${THRESHOLD} 次工具调用，建议在任务完成时执行上下文压缩`,
    );
    log(`[CompactReminder] 💡 /iterate 模式: 将在下一个任务完成点自动保存状态`);
  }

  // 超过阈值后定期提醒
  if (count > THRESHOLD && (count - THRESHOLD) % INTERVAL === 0) {
    log(`[CompactReminder] ⚠️ 已进行 ${count} 次工具调用，上下文压力较大`);
    log(`[CompactReminder] 💡 /iterate 模式: 请在当前任务完成后触发自动压缩`);
  }

  // 高频提醒（可能接近上下文极限）
  if (count >= THRESHOLD * 2) {
    if ((count - THRESHOLD * 2) % 10 === 0) {
      log(`[CompactReminder] 🔴 已进行 ${count} 次工具调用，上下文接近极限！`);
      log(
        `[CompactReminder] 🔴 立即保存状态并执行压缩（/cc-best:checkpoint → /clear → /cc-best:catchup）`,
      );
    }
  }

  process.exit(0);
}

try {
  main();
} catch {
  // Hook 应静默失败，不阻止用户操作
  process.exit(0);
}
