#!/usr/bin/env node
/**
 * Git push 前暂停确认
 *
 * 在 PreToolUse Bash hook 中运行，检测 git push 命令
 * 跨平台支持（Windows/macOS/Linux）
 */

const { readStdinJson, log, runCommand } = require("../lib/utils");

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  const command = input?.tool_input?.command || "";

  // 检查是否是 git push 命令
  if (!/git\s+push/i.test(command)) {
    process.exit(0);
  }

  // 检查是否是推送到 main/master 分支
  if (/git\s+push.*\s+(main|master)/i.test(command)) {
    log("[GitPush] 警告: 正在推送到主分支，请确认：");
    log("[GitPush]   - 所有测试已通过？");
    log("[GitPush]   - 代码已审查？");
    log("[GitPush]   - CI/CD 流水线正常？");
  } else {
    log("[GitPush] 检测到 git push 命令，确认推送...");
  }

  // 检查是否有未暂存的更改
  const diffResult = runCommand("git diff --quiet");
  if (!diffResult.success) {
    log("[GitPush] 提示: 存在未暂存的更改");
  }

  // 检查是否有未提交的更改
  const cachedResult = runCommand("git diff --cached --quiet");
  if (!cachedResult.success) {
    log("[GitPush] 提示: 存在已暂存但未提交的更改");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[GitPush] Error:", err.message);
  process.exit(0);
});
