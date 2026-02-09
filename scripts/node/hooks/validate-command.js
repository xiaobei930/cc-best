#!/usr/bin/env node
/**
 * Validate Command: 命令安全验证
 *
 * 在 Bash 命令执行前检查危险模式：
 * 1. 阻止危险的删除命令（rm -rf 等）
 * 2. 阻止敏感文件操作
 * 3. 记录所有命令到日志
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: PreToolUse
 * 匹配工具: Bash
 *
 * Exit codes:
 * - 0: 允许执行
 * - 2: 阻止执行（会反馈给 Claude）
 */

// --help 支持
if (process.argv.includes("--help")) {
  console.log(`validate-command.js - 命令安全验证

用途: PreToolUse hook，在 Bash 命令执行前检查危险模式
触发: Bash 工具调用前

检查项:
  - 阻止 rm -rf 等危险删除命令
  - 阻止修改敏感系统文件
  - 记录所有命令到日志

Exit codes:
  0  允许执行
  2  阻止执行（反馈给 Claude）`);
  process.exit(0);
}

const path = require("path");
const {
  readStdinJson,
  log,
  ensureDir,
  appendFile,
  getDateString,
} = require("../lib/utils");

// 危险命令模式（正则表达式）
const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+(-rf|-fr|--force).*[/~]/, desc: "rm -rf 危险路径" },
  { pattern: /rm\s+(-rf|-fr|--force).*\$HOME/, desc: "rm -rf HOME" },
  { pattern: /chmod\s+777/, desc: "过于宽松的权限" },
  { pattern: />\s*\/dev\/sd[a-z]/, desc: "直接写磁盘" },
  { pattern: /mkfs\./, desc: "格式化磁盘" },
  { pattern: /dd\s+if=.*of=\/dev\//, desc: "dd 写入设备" },
  { pattern: /:\(\)\{\s*:\|:&\s*\};:/, desc: "Fork bomb" },
  { pattern: /del\s+\/s\s+\/q\s+[A-Z]:\\/, desc: "Windows 危险删除" },
  { pattern: /rmdir\s+\/s\s+\/q\s+[A-Z]:\\/, desc: "Windows 危险删除" },
  { pattern: /format\s+[A-Z]:/, desc: "Windows 格式化" },
  { pattern: /git\s+reset\s+--hard/, desc: "hard reset（CLAUDE.md 禁止操作）" },
];

// 需要警告的敏感操作
const SENSITIVE_PATTERNS = [
  { pattern: /git\s+push.*--force/, desc: "force push" },
  { pattern: /git\s+commit\s+.*--amend/, desc: "commit amend（已推送时禁止）" },
  { pattern: /drop\s+database/i, desc: "drop database" },
  { pattern: /truncate\s+table/i, desc: "truncate table" },
];

// 日志目录
const LOG_DIR = path.join(".claude", "logs");

/**
 * 记录命令到日志文件
 */
function logCommand(command, blocked, reason = "") {
  try {
    ensureDir(LOG_DIR);
    const logFile = path.join(
      LOG_DIR,
      `commands_${getDateString().replace(/-/g, "")}.log`,
    );

    const entry = {
      timestamp: new Date().toISOString(),
      command: command.slice(0, 200), // 截断过长命令
      blocked,
      reason,
    };

    appendFile(logFile, JSON.stringify(entry) + "\n");
  } catch (err) {
    // 日志错误不应阻断主流程，但记录以便调试
    console.error("[validate-command] 日志写入失败:", err.message);
  }
}

/**
 * 检查命令是否危险
 */
function checkCommand(command) {
  // 检查危险模式
  for (const { pattern, desc } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return { blocked: true, reason: `匹配危险模式: ${desc}` };
    }
  }

  // 检查敏感操作（记录但不阻止）
  for (const { pattern, desc } of SENSITIVE_PATTERNS) {
    if (pattern.test(command)) {
      log(`[Hook 警告] 敏感操作 (${desc}): ${command.slice(0, 50)}...`);
    }
  }

  return { blocked: false, reason: "" };
}

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

  // 检查命令
  const { blocked, reason } = checkCommand(command);

  // 记录日志
  logCommand(command, blocked, reason);

  if (blocked) {
    // 输出反馈给 Claude
    log(`[安全检查] 命令被阻止: ${reason}`);
    log(`命令: ${command.slice(0, 100)}...`);
    process.exit(2); // Exit code 2 = 阻止执行
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[ValidateCommand] Error:", err.message);
  process.exit(0);
});
