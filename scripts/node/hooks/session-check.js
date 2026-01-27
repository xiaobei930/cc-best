#!/usr/bin/env node
/**
 * Claude Code Hook: 会话启动检查
 *
 * 在每次会话开始时自动执行健康检查：
 * 1. 检查 CLAUDE.md 文件大小（过大会影响性能）
 * 2. 检查 memory-bank 文档是否过期
 * 3. 提醒未完成的任务
 *
 * 输出提示信息供 Claude 参考。
 *
 * 跨平台支持（Windows/macOS/Linux）
 */

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

function main() {
  const allIssues = [];

  // 执行各项检查
  allIssues.push(...checkClaudeMd());
  allIssues.push(...checkMemoryBank());
  allIssues.push(...checkGitStatus());

  // SessionStart hook 必须输出 JSON 格式，否则会报 'hook error'
  // 参考：https://github.com/anthropics/claude-code/issues/12671
  if (allIssues.length > 0) {
    const context =
      "[Session Check]\\n" + allIssues.map((i) => `- ${i}`).join("\\n");
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext: context,
        },
      }),
    );
  } else {
    // 无问题时也输出空 JSON
    console.log("{}");
  }

  process.exit(0);
}

main();
