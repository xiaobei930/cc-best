#!/usr/bin/env node
/**
 * Auto Archive: Memory Bank 自动归档提醒
 *
 * 在 progress.md 被修改后检查行数，超过阈值时提醒归档。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: PostToolUse
 * 匹配工具: Write, Edit
 *
 * Exit codes:
 * - 0: 正常退出
 */

const fs = require("fs");
const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

const MAX_LINES = 300;

/**
 * 查找 progress.md 文件
 * 支持不同位置：memory-bank/progress.md 或 progress.md
 */
function findProgressFile(workingDir) {
  const candidates = [
    path.join(workingDir, "memory-bank", "progress.md"),
    path.join(workingDir, "progress.md"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * 检查 progress.md 行数并输出提醒
 */
function checkAndWarn(progressFile) {
  try {
    const content = fs.readFileSync(progressFile, "utf8");
    const lines = content.split("\n");
    const lineCount = lines.length;

    if (lineCount > MAX_LINES) {
      // 输出到 stderr，用户可见
      log(
        `\n[Auto-Archive] ⚠️ progress.md 已有 ${lineCount} 行 (阈值: ${MAX_LINES})`,
      );
      log(`[Auto-Archive] 建议运行 /checkpoint --archive 进行归档`);
      log(`[Auto-Archive] 或手动将历史记录移至 memory-bank/archive/\n`);

      // stderr 已通过 log() 输出警告给用户
    }
  } catch (err) {
    // 读取失败时静默退出，不影响主流程
  }
}

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  // 检查是否是 Write 或 Edit 操作
  const toolName = input?.tool_name;
  if (toolName !== "Write" && toolName !== "Edit") {
    process.exit(0);
  }

  // 获取操作的文件路径
  const filePath = input?.tool_input?.file_path || "";

  // 只在 progress.md 被修改时触发
  if (!filePath.includes("progress.md") && !filePath.includes("progress")) {
    process.exit(0);
  }

  // 获取工作目录
  const workingDir = input?.working_directory || process.cwd();

  // 查找并检查 progress.md
  const progressFile = findProgressFile(workingDir);
  if (progressFile) {
    checkAndWarn(progressFile);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
