#!/usr/bin/env node
/**
 * Stop Check: 响应完成时检查遗漏任务和决策表置信度
 *
 * 在 Claude 完成响应时检查：
 * 1. progress.md 中是否有 [ ] 未完成项
 * 2. 决策表中是否有缺失置信度的记录
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: Stop
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 正常完成
 */

// --help 支持
if (process.argv.includes("--help")) {
  console.log(`stop-check.js - 遗漏检查

用途: Stop hook，响应完成时检查 progress.md 中未完成任务
触发: AI 响应完成时`);
  process.exit(0);
}

const path = require("path");
const {
  readStdinJson,
  readFile,
  fileExists,
  getMemoryBankDir,
  log,
  shouldRunInProfile,
} = require("../lib/utils");

// Hook Profile 检查
if (!shouldRunInProfile("stop-check")) {
  process.exit(0);
}

// 配置
const PROJECT_ROOT = process.cwd();

/**
 * 检查 progress.md 中的未完成任务数量
 */
function getPendingTaskCount() {
  const progressPath = path.join(getMemoryBankDir(PROJECT_ROOT), "progress.md");
  if (!fileExists(progressPath)) {
    return 0;
  }

  const content = readFile(progressPath);
  if (!content) return 0;

  // 统计 [ ] 未完成项（排除 [x] 已完成项）
  const pendingMatches = content.match(/- \[ \]/g);
  return pendingMatches ? pendingMatches.length : 0;
}

/**
 * 检查决策表中缺失置信度的记录数量
 */
function getMissingConfidenceCount() {
  const progressPath = path.join(getMemoryBankDir(PROJECT_ROOT), "progress.md");
  if (!fileExists(progressPath)) {
    return 0;
  }

  const content = readFile(progressPath);
  if (!content) return 0;

  // 查找决策表区域（| 日期 | 角色 | 决策 | 依据 | 置信度 |）
  const tableHeader =
    /\|\s*日期\s*\|\s*角色\s*\|\s*决策\s*\|\s*依据\s*\|\s*置信度\s*\|/;
  const headerMatch = content.match(tableHeader);
  if (!headerMatch) return 0;

  // 从表头之后开始，查找数据行
  const afterHeader = content.slice(headerMatch.index + headerMatch[0].length);
  const lines = afterHeader.split("\n");

  let missingCount = 0;
  for (const line of lines) {
    // 跳过分隔行（| ---- | ...）
    if (/^\|\s*-+\s*\|/.test(line)) continue;
    // 如果不是表格行，表格结束
    if (!line.startsWith("|")) break;
    // 空行跳过
    if (line.trim() === "") break;

    // 解析表格行，检查置信度列（第 5 列）是否为空
    const cells = line.split("|").filter((c) => c.trim() !== "");
    if (cells.length >= 5) {
      const confidence = cells[4].trim();
      if (!confidence || confidence === "") {
        missingCount++;
      }
    } else if (cells.length >= 1 && cells[0].trim()) {
      // 有数据行但列数不够（可能缺失置信度列）
      missingCount++;
    }
  }

  return missingCount;
}

/**
 * 幻觉红旗检测 (v0.9.0)
 * 检测响应中可能的无证据声明
 */
function detectHallucinationRedFlags(responseText) {
  if (!responseText) return [];

  const RED_FLAG_PATTERNS = [
    {
      pattern: /一切正常|全部通过|所有测试通过/,
      flag: "无证据的'全部通过'声明",
    },
    { pattern: /已修复|已解决|问题已处理/, flag: "无证据的'已修复'声明" },
    { pattern: /性能良好|性能正常|性能没问题/, flag: "无基准数据的性能声明" },
    { pattern: /安全无问题|没有安全[问隐]/, flag: "无扫描结果的安全声明" },
    {
      pattern: /没有\s*bug|不存在\s*bug|无\s*bug/,
      flag: "无测试证据的无Bug声明",
    },
  ];

  const flags = [];
  for (const { pattern, flag } of RED_FLAG_PATTERNS) {
    if (pattern.test(responseText)) {
      flags.push(flag);
    }
  }
  return flags;
}

/**
 * Stall 模式检测 (v0.9.0)
 * 检测工具失败的重复模式
 */
function detectStallPatterns() {
  const failurePath = path.join(
    getMemoryBankDir(PROJECT_ROOT),
    ".tool-failures.json",
  );
  if (!fileExists(failurePath)) return null;

  try {
    const data = JSON.parse(readFile(failurePath));
    const recent = (data.recent_failures || []).slice(-6);
    if (recent.length < 3) return null;

    // 检测连续相同错误
    const last3 = recent.slice(-3);
    const sameError = last3.every(
      (f) => f.tool === last3[0].tool && f.error_hint === last3[0].error_hint,
    );
    if (sameError) {
      return `工具 ${last3[0].tool} 连续 3 次相同失败: ${last3[0].error_hint}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 主函数
 */

async function main() {
  try {
    const input = await readStdinJson();
    const stopReason = input.stop_reason || "end_turn";

    // 只在正常结束时检查（不在错误或中断时检查）
    if (stopReason === "end_turn") {
      const pendingCount = getPendingTaskCount();

      if (pendingCount > 0) {
        log(`[StopCheck] 📋 progress.md 中仍有 ${pendingCount} 个未完成任务`);
      }

      // 检查决策表置信度
      const missingConfidence = getMissingConfidenceCount();
      if (missingConfidence > 0) {
        log(
          `[StopCheck] ⚠️ 决策表中有 ${missingConfidence} 条记录缺失置信度（A2 原则要求记录置信度）`,
        );
      }

      // 幻觉红旗检测 (v0.9.0)
      const responseText = input.response || "";
      const redFlags = detectHallucinationRedFlags(responseText);
      if (redFlags.length > 0) {
        log(
          `[StopCheck] 🚩 检测到 ${redFlags.length} 个幻觉红旗: ${redFlags.join("; ")}`,
        );
      }

      // Stall 模式检测 (v0.9.0)
      const stallInfo = detectStallPatterns();
      if (stallInfo) {
        log(`[StopCheck] ⚠️ Stall 检测: ${stallInfo}，建议切换策略`);
      }
    }

    // 不阻止停止，只提供信息
    // 注：v2.1.145+ Stop hook 支持 hookSpecificOutput.additionalContext 让对话继续，
    // 但 progress.md 常驻未完成任务会导致每次 Stop 都继续对话（无限循环），故有意不使用
    process.exit(0);
  } catch {
    // 静默失败
    process.exit(0);
  }
}

main();
