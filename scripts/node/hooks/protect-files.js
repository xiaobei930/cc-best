#!/usr/bin/env node
/**
 * Claude Code Hook: 敏感文件保护
 *
 * 在 Edit/Write 操作前检查目标文件：
 * - 阻止修改 .env 和密钥文件
 * - 阻止修改锁定文件（package-lock.json 等）
 * - 阻止修改 .git 目录
 *
 * 跨平台支持（Windows/macOS/Linux）
 *
 * Exit codes:
 * - 0: 允许执行
 * - 2: 阻止执行
 */

const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

// 禁止修改的文件/目录模式
const PROTECTED_PATTERNS = [
  ".env",
  ".env.local",
  ".env.production",
  "*.key",
  "*.pem",
  "credentials.json",
  "secrets.json",
  ".git/",
];

// 需要警告但允许的文件
const WARN_PATTERNS = [
  // "*.md",  // 文档文件修改时提醒
];

/**
 * 检查文件是否受保护
 * @param {string} filePath - 文件路径
 * @returns {{blocked: boolean, reason: string}}
 */
function isProtected(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const fileName = path.basename(normalized);

  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.startsWith("*")) {
      // 通配符匹配扩展名
      const ext = pattern.slice(1);
      if (fileName.endsWith(ext)) {
        return { blocked: true, reason: `受保护的文件类型: ${pattern}` };
      }
    } else if (pattern.endsWith("/")) {
      // 目录匹配 - 确保匹配的是目录路径而非文件名的一部分
      // 例如 ".git/" 应匹配 "/.git/config" 但不应匹配 ".gitignore"
      const dirPattern = pattern.slice(0, -1);
      if (
        normalized.includes(`/${dirPattern}/`) ||
        normalized.startsWith(`${dirPattern}/`)
      ) {
        return { blocked: true, reason: `受保护的目录: ${pattern}` };
      }
    } else {
      // 精确匹配
      if (fileName === pattern.toLowerCase()) {
        return { blocked: true, reason: `受保护的文件: ${pattern}` };
      }
    }
  }

  // 检查警告模式
  for (const pattern of WARN_PATTERNS) {
    if (pattern.startsWith("*")) {
      const ext = pattern.slice(1);
      if (fileName.endsWith(ext)) {
        log(`[警告] 正在修改文档文件: ${filePath}`);
      }
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

  const filePath = input?.tool_input?.file_path || "";

  if (!filePath) {
    process.exit(0);
  }

  const { blocked, reason } = isProtected(filePath);

  if (blocked) {
    log(`[文件保护] 操作被阻止: ${reason}`);
    log(`文件: ${filePath}`);
    log("如果确实需要修改，请手动操作。");
    process.exit(2);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[ProtectFiles] Error:", err.message);
  process.exit(0);
});
