#!/usr/bin/env node
/**
 * 阻止随机创建 .md 文件
 *
 * 在 PreToolUse Write hook 中运行，防止意外创建不必要的 markdown 文件
 *
 * 跨平台支持（Windows/macOS/Linux）
 *
 * Exit codes:
 * - 0: 允许执行
 * - 2: 阻止执行
 */

const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

// 允许创建的 markdown 文件模式
const ALLOWED_MD_PATTERNS = [
  // memory-bank 目录下的文档
  "memory-bank/",
  // .claude 配置目录
  ".claude/",
  // 标准文档文件
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE.md",
  "CODE_OF_CONDUCT.md",
  // 文档目录
  "docs/",
  "documentation/",
  // API 文档
  "api-docs/",
  // 规范文件
  "specs/",
  "spec/",
];

// 必须阻止的模式
const BLOCKED_MD_PATTERNS = [
  // 随机临时文件
  "temp.md",
  "tmp.md",
  "test.md",
  "notes.md",
  "scratch.md",
  "untitled.md",
];

/**
 * 检查文件路径是否被允许
 * @param {string} filePath - 文件路径
 * @returns {boolean}
 */
function isAllowedPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();

  // 不是 markdown 文件，允许
  if (!normalized.endsWith(".md")) {
    return true;
  }

  // 检查是否匹配允许的模式
  for (const pattern of ALLOWED_MD_PATTERNS) {
    if (pattern.endsWith("/")) {
      // 目录模式
      if (normalized.includes(pattern.toLowerCase())) {
        return true;
      }
    } else {
      // 文件名模式
      if (normalized.endsWith(pattern.toLowerCase())) {
        return true;
      }
    }
  }

  // 检查是否是被阻止的模式
  const fileName = path.basename(normalized);
  for (const blocked of BLOCKED_MD_PATTERNS) {
    if (fileName === blocked.toLowerCase()) {
      log(`[BlockMD] 阻止: 不允许创建临时 .md 文件: ${filePath}`);
      return false;
    }
  }

  // 默认阻止根目录下的随机 md 文件
  // 计算相对深度
  const parts = normalized.split("/").filter((p) => p);
  if (parts.length <= 2) {
    // 根目录或一级目录
    log(`[BlockMD] 阻止: 不允许在项目根目录创建随机 .md 文件: ${filePath}`);
    log(`[BlockMD] 提示: 文档应放在 docs/, memory-bank/, 或 .claude/ 目录下`);
    return false;
  }

  return true;
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

  if (!isAllowedPath(filePath)) {
    process.exit(2); // Exit code 2 = 阻止执行
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[BlockRandomMd] Error:", err.message);
  process.exit(0);
});
