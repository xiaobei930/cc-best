#!/usr/bin/env node
/**
 * SessionStart Hook - 会话启动时加载上下文
 *
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 功能：
 * - 检查 memory-bank 中的进度文件
 * - 显示待完成任务数量
 * - 报告检测到的包管理器
 */

const path = require("path");
const {
  getMemoryBankDir,
  readFile,
  fileExists,
  findFiles,
  log,
  grepFile,
} = require("../lib/utils");

const { detect, getAvailableManagers } = require("../lib/package-manager");

async function main() {
  const memoryBank = getMemoryBankDir();
  const progressFile = path.join(memoryBank, "progress.md");

  // 检查 progress.md
  if (fileExists(progressFile)) {
    const content = readFile(progressFile);
    if (content) {
      // 统计待完成任务
      const pendingTasks = (content.match(/^- \[ \]/gm) || []).length;
      const completedTasks = (content.match(/^- \[x\]/gim) || []).length;

      if (pendingTasks > 0) {
        log(
          `[SessionStart] 发现 ${pendingTasks} 个待完成任务, ${completedTasks} 个已完成`,
        );
      }

      // 获取当前阶段
      const phaseMatch = content.match(/## 当前阶段[：:]\s*(.+)/);
      if (phaseMatch) {
        log(`[SessionStart] 当前阶段: ${phaseMatch[1].trim()}`);
      }
    }
  }

  // 检查 learned skills
  const learnedDir = path.join(
    process.env.HOME || process.env.USERPROFILE,
    ".claude",
    "skills",
    "learned",
  );
  const learnedSkills = findFiles(learnedDir, "*.md");
  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} 个已学习技能可用`);
  }

  // 检测包管理器
  const pm = detect();
  log(`[SessionStart] 包管理器: ${pm.name} (来源: ${pm.source})`);

  // 如果是回退检测，提示用户配置
  if (pm.source === "fallback" || pm.source === "default") {
    const available = getAvailableManagers();
    if (available.length > 1) {
      log(
        `[SessionStart] 可用: ${available.join(", ")} - 运行 /setup-pm 配置首选项`,
      );
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[SessionStart] Error:", err.message);
  process.exit(0); // 不阻止会话启动
});
