#!/usr/bin/env node
/**
 * 长时间运行命令提醒
 *
 * 检测 dev server、watch 等可能长时间运行的命令
 * 跨平台支持（Windows/macOS/Linux）
 */

const { readStdinJson, log } = require("../lib/utils");

// 长时间运行命令模式
const LONG_RUNNING_PATTERNS = [
  /npm\s+run\s+(dev|start|watch)/i,
  /yarn\s+(dev|start|watch)/i,
  /pnpm\s+(dev|start|watch)/i,
  /bun\s+(run\s+)?(dev|start|watch)/i,
  /nodemon/i,
  /ts-node-dev/i,
  /vite(\s|$)/i,
  /next\s+dev/i,
  /nuxt\s+dev/i,
  /webpack.*--watch/i,
  /tsc.*--watch/i,
  /jest.*--watch/i,
  /vitest.*--watch/i,
  /python.*manage\.py\s+runserver/i,
  /flask\s+run/i,
  /uvicorn.*--reload/i,
  /cargo\s+watch/i,
  /go\s+run.*--watch/i,
  /npm\s+start/i,
  /serve\s+-/i,
  /live-server/i,
  /browser-sync/i,
];

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  const command = input?.tool_input?.command || "";

  if (!command) {
    process.exit(0);
  }

  // 检查是否匹配长时间运行模式
  for (const pattern of LONG_RUNNING_PATTERNS) {
    if (pattern.test(command)) {
      log("");
      log("⚠️  检测到长时间运行命令: " + command.slice(0, 60));
      log("");
      log("建议:");
      log("  - 使用 run_in_background: true 在后台运行");
      log("  - 或在单独的终端窗口中手动启动");
      log("");
      log("如果需要在前台运行，请确保设置合适的 timeout");
      log("");
      // 不阻止，只是警告
      break;
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[LongRunning] Error:", err.message);
  process.exit(0);
});
