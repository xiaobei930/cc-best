#!/usr/bin/env node
/**
 * Claude Code Hook: 自动格式化代码文件
 *
 * 在 Write/Edit 操作后自动运行，根据文件类型选择对应的格式化工具：
 * - Python (.py): black + isort
 * - TypeScript/JavaScript (.ts, .tsx, .js, .jsx): prettier
 * - Vue (.vue): prettier
 * - C/C++ (.c, .cpp, .h, .hpp, .cc, .cxx): clang-format
 * - Java (.java): google-java-format
 * - C# (.cs): dotnet format
 *
 * 跨平台支持（Windows/macOS/Linux）
 */

const path = require("path");
const { execSync } = require("child_process");
const fs = require("fs");
const { readStdinJson, log, commandExists } = require("../lib/utils");

/**
 * 执行命令并返回是否成功
 * @param {string} cmd - 命令
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {boolean}
 */
function runCommand(cmd, timeout = 30000) {
  try {
    execSync(cmd, {
      timeout,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 使用 black + isort 格式化 Python 文件
 */
function formatPython(filePath) {
  let success = true;

  // isort 排序导入
  if (commandExists("isort")) {
    success = runCommand(`isort --quiet "${filePath}"`) && success;
  }

  // black 格式化
  if (commandExists("black")) {
    success = runCommand(`black --quiet "${filePath}"`) && success;
  }

  return success;
}

/**
 * 使用 prettier 格式化前端文件
 */
function formatFrontend(filePath) {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

  if (!commandExists("npx")) {
    return false;
  }

  return runCommand(`${npxCmd} prettier --write "${filePath}"`);
}

/**
 * 使用 clang-format 格式化 C/C++ 文件
 */
function formatCpp(filePath) {
  if (!commandExists("clang-format")) {
    return false;
  }

  return runCommand(`clang-format -i "${filePath}"`);
}

/**
 * 使用 google-java-format 格式化 Java 文件
 */
function formatJava(filePath) {
  // 尝试多种可能的命令名称
  for (const cmd of ["google-java-format", "gjf"]) {
    if (commandExists(cmd)) {
      return runCommand(`${cmd} -i "${filePath}"`, 60000);
    }
  }
  return false;
}

/**
 * 使用 dotnet format 格式化 C# 文件
 */
function formatCsharp(filePath) {
  if (!commandExists("dotnet")) {
    return false;
  }

  // dotnet format 需要在项目目录中运行
  // 尝试找到最近的 .csproj 或 .sln 文件
  let current = path.dirname(path.resolve(filePath));

  for (let i = 0; i < 10; i++) {
    const files = fs.readdirSync(current);
    if (files.some((f) => f.endsWith(".csproj") || f.endsWith(".sln"))) {
      return runCommand(`dotnet format --include "${filePath}"`, 60000);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return false;
}

// 文件扩展名到格式化函数的映射
const FORMATTERS = {
  // Python
  ".py": formatPython,

  // 前端
  ".ts": formatFrontend,
  ".tsx": formatFrontend,
  ".js": formatFrontend,
  ".jsx": formatFrontend,
  ".vue": formatFrontend,
  ".css": formatFrontend,
  ".scss": formatFrontend,
  ".less": formatFrontend,
  ".json": formatFrontend,
  ".yaml": formatFrontend,
  ".yml": formatFrontend,
  ".md": formatFrontend,

  // C/C++
  ".c": formatCpp,
  ".cpp": formatCpp,
  ".cc": formatCpp,
  ".cxx": formatCpp,
  ".h": formatCpp,
  ".hpp": formatCpp,
  ".hxx": formatCpp,

  // Java
  ".java": formatJava,

  // C#
  ".cs": formatCsharp,
};

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

  const ext = path.extname(filePath).toLowerCase();
  const formatter = FORMATTERS[ext];

  if (formatter) {
    const success = formatter(filePath);
    if (success) {
      log(`[Hook] Formatted: ${path.basename(filePath)}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[FormatFile] Error:", err.message);
  process.exit(0);
});
