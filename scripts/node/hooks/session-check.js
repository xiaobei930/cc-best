#!/usr/bin/env node
/**
 * Session Check: 会话启动健康检查
 *
 * 在每次会话开始时自动执行健康检查：
 * 1. 恢复上次 session 摘要上下文（F10）
 * 2. 检查 CLAUDE.md 文件大小（过大会影响性能）
 * 3. 检查 memory-bank 文档是否过期
 * 4. 检查 Git 状态，提醒未提交的变更
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: SessionStart
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 检查完成，输出提示信息
 */

// --help 支持
if (process.argv.includes("--help")) {
  console.log(`session-check.js - 会话健康检查

用途: SessionStart hook，启动时检查配置、文档过期和 Git 状态
触发: 会话启动时`);
  process.exit(0);
}

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 配置
const PROJECT_ROOT = process.cwd();
const CLAUDE_MD_SIZE_WARN = 10 * 1024; // 10KB 警告阈值
const CLAUDE_MD_SIZE_LIMIT = 15 * 1024; // 15KB 建议精简
const DOC_STALE_DAYS = 7; // 文档超过 7 天未更新视为过期

/**
 * 检查 CLAUDE.md 文件
 */
function checkClaudeMd() {
  const issues = [];
  const claudeMdPath = path.join(PROJECT_ROOT, "CLAUDE.md");

  if (!fs.existsSync(claudeMdPath)) {
    issues.push("CLAUDE.md 不存在，建议运行 /setup 初始化");
    return issues;
  }

  const stats = fs.statSync(claudeMdPath);
  const size = stats.size;

  if (size > CLAUDE_MD_SIZE_LIMIT) {
    issues.push(
      `CLAUDE.md 过大 (${Math.round(size / 1024)}KB)，建议精简到 15KB 以内`,
    );
  } else if (size > CLAUDE_MD_SIZE_WARN) {
    issues.push(`CLAUDE.md 较大 (${Math.round(size / 1024)}KB)，考虑精简`);
  }

  return issues;
}

/**
 * 检查 memory-bank 文档状态
 */
function checkMemoryBank() {
  const issues = [];
  const memoryBankPath = path.join(PROJECT_ROOT, "memory-bank");

  if (!fs.existsSync(memoryBankPath)) {
    // 项目初期可能没有 memory-bank
    return issues;
  }

  const now = Date.now();
  const staleThreshold = now - DOC_STALE_DAYS * 24 * 60 * 60 * 1000;

  const keyDocs = ["progress.md", "architecture.md", "tech-stack.md"];

  for (const docName of keyDocs) {
    const docPath = path.join(memoryBankPath, docName);
    if (fs.existsSync(docPath)) {
      const stats = fs.statSync(docPath);
      const mtime = stats.mtimeMs;
      if (mtime < staleThreshold) {
        const daysOld = Math.round((now - mtime) / (24 * 60 * 60 * 1000));
        issues.push(`${docName} 已 ${daysOld} 天未更新，可能需要同步`);
      }
    }
  }

  return issues;
}

/**
 * 检查 Git 状态
 */
function checkGitStatus() {
  const issues = [];

  try {
    const result = execSync("git status --porcelain", {
      cwd: PROJECT_ROOT,
      timeout: 5000,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (result.trim()) {
      const lineCount = result.trim().split("\n").length;
      if (lineCount > 10) {
        issues.push(`有 ${lineCount} 个未提交的变更，建议定期提交`);
      }
    }
  } catch {
    // Git 不可用或超时，忽略
  }

  return issues;
}

/**
 * 恢复上次 session 摘要 (F10)
 * 读取 memory-bank/sessions/ 中最近的 1 个 session 文件
 */
function getLastSessionSummary() {
  const sessionsDir = path.join(PROJECT_ROOT, "memory-bank", "sessions");

  if (!fs.existsSync(sessionsDir)) return null;

  try {
    const files = fs
      .readdirSync(sessionsDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const latestFile = path.join(sessionsDir, files[0]);
    const content = fs.readFileSync(latestFile, "utf8");

    // 只取前 500 字符避免注入过多上下文
    return content.length > 500 ? content.slice(0, 500) + "\n..." : content;
  } catch {
    return null;
  }
}

/**
 * 生成会话标题 (v2.1.152+ sessionTitle)
 * 优先使用 git 分支名，回退到目录名；仅在 startup/resume 时生效（官方行为）
 */
function getSessionTitle() {
  try {
    const branch = execSync("git branch --show-current", {
      cwd: PROJECT_ROOT,
      timeout: 3000,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    const dirName = path.basename(PROJECT_ROOT);
    if (branch && branch !== "main" && branch !== "master") {
      return `${dirName}:${branch}`;
    }
    return dirName;
  } catch {
    return null;
  }
}

const { shouldRunInProfile } = require("../lib/utils");

// Hook Profile 检查
if (!shouldRunInProfile("session-check")) {
  process.exit(0);
}

function main() {
  const allIssues = [];
  const contextParts = [];

  // F10: 恢复上次 session 摘要
  const lastSession = getLastSessionSummary();
  if (lastSession) {
    contextParts.push("[Last Session]\n" + lastSession);
  }

  // 执行各项检查
  allIssues.push(...checkClaudeMd());
  allIssues.push(...checkMemoryBank());
  allIssues.push(...checkGitStatus());

  if (allIssues.length > 0) {
    contextParts.push(
      "[Session Check]\n" + allIssues.map((i) => `- ${i}`).join("\n"),
    );
  }

  // SessionStart hook 必须输出 JSON 格式，否则会报 'hook error'
  // 参考：https://github.com/anthropics/claude-code/issues/12671
  const hookOutput = { hookEventName: "SessionStart" };

  if (contextParts.length > 0) {
    hookOutput.additionalContext = contextParts.join("\n\n");
  }

  // 自动命名会话（v2.1.152+，仅 startup/resume 时官方生效，clear/compact 时被忽略）
  const sessionTitle = getSessionTitle();
  if (sessionTitle) {
    hookOutput.sessionTitle = sessionTitle;
  }

  if (hookOutput.additionalContext || hookOutput.sessionTitle) {
    console.log(JSON.stringify({ hookSpecificOutput: hookOutput }));
  } else {
    // 无问题时也输出空 JSON
    console.log("{}");
  }

  process.exit(0);
}

main();
