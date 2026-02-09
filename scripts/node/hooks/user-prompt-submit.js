#!/usr/bin/env node
/**
 * User Prompt Submit: 用户提交提示时注入项目上下文
 *
 * 在用户每次提交提示时检查项目状态，注入有用的上下文信息：
 * 1. memory-bank 可用状态
 * 2. 当前工作阶段（从 progress.md 推断）
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: UserPromptSubmit
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 正常完成
 */

const path = require("path");
const {
  fileExists,
  readFile,
  getMemoryBankDir,
  output,
} = require("../lib/utils");

// 配置
const PROJECT_ROOT = process.cwd();

/**
 * 检查 memory-bank 状态
 */
function getMemoryBankStatus() {
  const mbDir = getMemoryBankDir(PROJECT_ROOT);
  if (!fileExists(mbDir)) {
    return null;
  }

  const keyFiles = ["progress.md", "architecture.md", "tech-stack.md"];
  const available = [];

  for (const file of keyFiles) {
    if (fileExists(path.join(mbDir, file))) {
      available.push(file);
    }
  }

  return available.length > 0 ? available : null;
}

/**
 * 从 progress.md 推断当前阶段
 */
function getCurrentPhase() {
  const progressPath = path.join(getMemoryBankDir(PROJECT_ROOT), "progress.md");
  if (!fileExists(progressPath)) {
    return null;
  }

  const content = readFile(progressPath);
  if (!content) return null;

  // 查找阶段标记
  const phaseMatch = content.match(
    /##\s*(?:当前阶段|Current Phase)[:\s]*(.+)/i,
  );
  if (phaseMatch) {
    return phaseMatch[1].trim();
  }

  return null;
}

/**
 * 主函数
 */
function main() {
  const context = [];

  // 检查 memory-bank
  const mbFiles = getMemoryBankStatus();
  if (mbFiles) {
    context.push(`[Memory Bank] 可用: ${mbFiles.join(", ")}`);
  }

  // 检查当前阶段
  const phase = getCurrentPhase();
  if (phase) {
    context.push(`[Phase] ${phase}`);
  }

  // 输出上下文信息（UserPromptSubmit 通过 additionalContext 注入）
  if (context.length > 0) {
    output({
      hookSpecificOutput: {
        additionalContext: context.join("\n"),
      },
    });
  } else {
    output({});
  }

  process.exit(0);
}

try {
  main();
} catch {
  // Hook 应静默失败，不阻止用户操作
  process.exit(0);
}
