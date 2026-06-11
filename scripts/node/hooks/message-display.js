#!/usr/bin/env node
/**
 * Message Display: 显示层敏感信息打码
 *
 * 在助手消息显示时检测并打码常见密钥格式（API key、token 等），
 * 仅影响屏幕显示，不影响 transcript 和 Claude 看到的内容。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: MessageDisplay (Claude Code v2.1.152+)
 * 匹配工具: *（该事件不支持 matcher）
 *
 * 输出: hookSpecificOutput.displayContent（仅在检测到敏感信息时输出）
 *
 * Exit codes:
 * - 0: 正常完成
 */

// --help 支持
if (process.argv.includes("--help")) {
  console.log(`message-display.js - 显示层敏感信息打码

用途: MessageDisplay hook，在显示时打码助手消息中的密钥
触发: 每条助手消息显示时（仅影响显示，不影响上下文）`);
  process.exit(0);
}

const { readStdinJson, shouldRunInProfile } = require("../lib/utils");

// Hook Profile 检查
if (!shouldRunInProfile("message-display")) {
  process.exit(0);
}

// 常见密钥格式（与 check-secrets.js 保持一致的检测范围）
const SECRET_PATTERNS = [
  /sk-ant-[A-Za-z0-9_-]{20,}/g, // Anthropic API key
  /sk-[A-Za-z0-9]{32,}/g, // OpenAI 风格 API key
  /ghp_[A-Za-z0-9]{36,}/g, // GitHub PAT
  /gho_[A-Za-z0-9]{36,}/g, // GitHub OAuth token
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
  /xox[baprs]-[A-Za-z0-9-]{10,}/g, // Slack token
  /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, // JWT
];

/** 打码：保留前 6 位，其余替换为 *** */
function maskSecret(match) {
  return `${match.slice(0, 6)}***[已打码]`;
}

async function main() {
  try {
    const input = await readStdinJson();
    const text = input.message_text || "";
    if (!text) process.exit(0);

    let masked = text;
    for (const pattern of SECRET_PATTERNS) {
      masked = masked.replace(pattern, maskSecret);
    }

    // 仅在发生替换时输出，避免无意义的显示层处理
    if (masked !== text) {
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "MessageDisplay",
            displayContent: masked,
          },
        }),
      );
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

main();
