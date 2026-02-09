#!/usr/bin/env node
/**
 * Evaluate Session: 会话结束自动学习评估
 *
 * 会话结束时评估是否有可提取的学习模式，
 * 融入 memory-bank 体系，输出到 .claude/learned/。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: SessionEnd
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 评估完成
 */

const fs = require("fs");
const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

// 配置
const MIN_SESSION_LENGTH = 10; // 最小会话消息数
const LEARNED_DIR = ".claude/learned";

// 模式类型
const PATTERN_TYPES = {
  error_resolution: "错误解决 Error Resolution",
  debugging_techniques: "调试技巧 Debugging Techniques",
  workarounds: "变通方案 Workarounds",
  project_specific: "项目知识 Project Knowledge",
  user_corrections: "用户纠正 User Corrections",
};

/**
 * 获取会话统计信息
 */
function getSessionStats(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return { messageCount: 0, hasErrors: false, hasCorrections: false };
  }

  try {
    const content = fs.readFileSync(transcriptPath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    let messageCount = 0;
    let hasErrors = false;
    let hasCorrections = false;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === "user" || entry.type === "assistant") {
          messageCount++;
        }
        // 检测错误解决模式
        if (entry.type === "tool_result" && entry.error) {
          hasErrors = true;
        }
        // 检测用户纠正（简单启发式：用户消息包含"不对"、"错了"、"应该"等）
        if (entry.type === "user" && entry.content) {
          const text =
            typeof entry.content === "string"
              ? entry.content
              : JSON.stringify(entry.content);
          if (/不对|错了|应该|wrong|incorrect|should be/i.test(text)) {
            hasCorrections = true;
          }
        }
      } catch {
        // 忽略解析错误
      }
    }

    return { messageCount, hasErrors, hasCorrections };
  } catch {
    return { messageCount: 0, hasErrors: false, hasCorrections: false };
  }
}

/**
 * 确保学习目录存在
 */
function ensureLearnedDir(workingDir) {
  const learnedPath = path.join(workingDir, LEARNED_DIR);
  if (!fs.existsSync(learnedPath)) {
    fs.mkdirSync(learnedPath, { recursive: true });
  }
  return learnedPath;
}

/**
 * 生成学习提示
 */
function generateLearningPrompt(stats) {
  const prompts = [];

  if (stats.hasErrors) {
    prompts.push(`  - ${PATTERN_TYPES.error_resolution}`);
  }
  if (stats.hasCorrections) {
    prompts.push(`  - ${PATTERN_TYPES.user_corrections}`);
  }
  prompts.push(`  - ${PATTERN_TYPES.debugging_techniques}`);
  prompts.push(`  - ${PATTERN_TYPES.workarounds}`);
  prompts.push(`  - ${PATTERN_TYPES.project_specific}`);

  return prompts.join("\n");
}

/**
 * 主函数
 */
async function main() {
  try {
    const input = await readStdinJson();
    const workingDir = input.working_directory || process.cwd();
    const transcriptPath =
      input.transcript_path || process.env.CLAUDE_TRANSCRIPT_PATH;

    // 获取会话统计
    const stats = getSessionStats(transcriptPath);

    // 短会话跳过
    if (stats.messageCount < MIN_SESSION_LENGTH) {
      // 静默退出，不输出任何内容
      process.exit(0);
    }

    // 确保学习目录存在
    ensureLearnedDir(workingDir);

    // 输出学习提示
    log("");
    log("[Learning 学习] 会话包含 " + stats.messageCount + " 条消息");
    log("[Learning 学习] 检测到可能的学习模式 Potential patterns detected:");
    log(generateLearningPrompt(stats));
    log("");
    log("[Learning 学习] 如有值得记录的模式，可保存到:");
    log(`  ${path.join(workingDir, LEARNED_DIR)}/`);
    log("");
    log("[Learning 学习] 使用 /learn 命令手动提取模式");
    log("");

    process.exit(0);
  } catch (err) {
    // 静默失败，不影响会话结束
    process.exit(0);
  }
}

main();
