#!/usr/bin/env node
/**
 * PreCompact Hook - 上下文压缩前保存状态
 *
 * 在 Claude Code 执行上下文压缩前触发，
 * 保存当前工作状态以便压缩后恢复上下文。
 *
 * 保存内容：
 * - 当前 git 状态（分支、未提交更改）
 * - 未完成的任务（从 progress.md 提取）
 * - 最近修改的文件列表
 *
 * 跨平台支持（Windows/macOS/Linux）
 */

const path = require("path");
const {
  getMemoryBankDir,
  fileExists,
  readFile,
  writeFile,
  ensureDir,
  getDateTimeString,
  log,
  runCommand,
  isGitRepo,
  getGitBranch,
  getGitModifiedFiles,
} = require("../lib/utils");

/**
 * 从 progress.md 提取未完成的任务
 */
function extractPendingTasks(content) {
  if (!content) return [];

  const tasks = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // 匹配 - [ ] 格式的未完成任务
    if (/^[\s]*-\s*\[\s*\]/.test(line)) {
      tasks.push(line.trim());
    }
  }

  return tasks.slice(0, 10); // 最多保留 10 个
}

/**
 * 生成压缩前状态摘要
 */
function generateStateSummary(progressContent) {
  const summary = {
    timestamp: getDateTimeString(),
    git: {},
    tasks: {
      pending: 0,
      completed: 0,
      list: [],
    },
    modifiedFiles: [],
  };

  // Git 状态
  if (isGitRepo()) {
    summary.git.branch = getGitBranch() || "unknown";
    summary.modifiedFiles = getGitModifiedFiles().slice(0, 20);

    // 获取未提交的更改数量
    const statusResult = runCommand("git status --porcelain");
    if (statusResult.success) {
      const changes = statusResult.output
        .split("\n")
        .filter((l) => l.trim()).length;
      summary.git.uncommittedChanges = changes;
    }
  }

  // 任务统计
  if (progressContent) {
    summary.tasks.pending = (
      progressContent.match(/^[\s]*-\s*\[\s*\]/gm) || []
    ).length;
    summary.tasks.completed = (
      progressContent.match(/^[\s]*-\s*\[x\]/gim) || []
    ).length;
    summary.tasks.list = extractPendingTasks(progressContent);
  }

  return summary;
}

/**
 * 保存状态到文件
 */
function saveState(summary, memoryBankDir) {
  ensureDir(memoryBankDir);
  const statePath = path.join(memoryBankDir, ".pre-compact-state.json");
  writeFile(statePath, JSON.stringify(summary, null, 2));
  return statePath;
}

async function main() {
  const memoryBank = getMemoryBankDir();
  const progressFile = path.join(memoryBank, "progress.md");

  let progressContent = null;
  if (fileExists(progressFile)) {
    progressContent = readFile(progressFile);
  }

  // 生成状态摘要
  const summary = generateStateSummary(progressContent);

  // 保存状态
  try {
    saveState(summary, memoryBank);
  } catch {
    // 忽略保存错误
  }

  // 输出摘要信息
  log(`[PreCompact] 压缩前状态已保存`);

  if (summary.git.branch) {
    log(`  分支: ${summary.git.branch}`);
  }

  if (summary.git.uncommittedChanges > 0) {
    log(`  未提交: ${summary.git.uncommittedChanges} 个文件`);
  }

  log(
    `  任务: ${summary.tasks.completed} 已完成, ${summary.tasks.pending} 待完成`,
  );

  if (summary.tasks.list.length > 0) {
    log(`  待办事项:`);
    summary.tasks.list.slice(0, 5).forEach((task) => {
      log(`    ${task}`);
    });
  }

  log(`[PreCompact] 建议: 压缩后请先阅读 progress.md 恢复上下文`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[PreCompact] Error:", err.message);
  process.exit(0);
});
