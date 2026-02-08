#!/usr/bin/env node
/**
 * Subagent Stop: 子代理完成时任务追踪
 *
 * 在子代理（Agent）完成任务时记录完成状态，
 * 帮助追踪多 Agent 工作流的进度。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: SubagentStop
 * 匹配工具: *
 *
 * Exit codes:
 * - 0: 正常完成
 */

const { readStdinJson, log } = require("../lib/utils");

/**
 * 主函数
 */
async function main() {
  try {
    const input = await readStdinJson();

    // 提取子代理信息
    const agentName = input.agent_name || input.subagent_type || "unknown";
    const stopReason = input.stop_reason || "completed";

    // 输出追踪日志到 stderr（用户可见）
    log(`[AgentTracker] Agent "${agentName}" 完成 (${stopReason})`);

    // 不阻止停止，只提供追踪信息
    process.exit(0);
  } catch {
    // 静默失败，不影响主流程
    process.exit(0);
  }
}

main();
