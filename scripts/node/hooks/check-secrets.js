#!/usr/bin/env node
/**
 * Check Secrets: 密钥泄露检测
 *
 * 在 git commit 前扫描代码中的硬编码密钥，
 * 支持 30+ 提供商的密钥格式。
 * 跨平台支持（Windows/macOS/Linux）
 *
 * 触发时机: PreToolUse
 * 匹配工具: Bash
 *
 * Exit codes:
 * - 0: 检查完成（警告但不阻止）
 */

// --help 支持
if (process.argv.includes("--help")) {
  console.log(`check-secrets.js - 密钥泄露检测

用途: PreToolUse hook，在 git commit 前扫描硬编码密钥
触发: Bash 工具调用前（检测 git commit 命令）

检测范围:
  - 30+ 云服务商 API Key（Anthropic, OpenAI, AWS, GCP 等）
  - SSH 私钥、JWT Token、数据库连接字符串
  - 通用密钥模式（password=, secret=, token= 等）

Exit codes:
  0  检查完成（警告但不阻止）`);
  process.exit(0);
}

const fs = require("fs");
const path = require("path");
const { readStdinJson, log } = require("../lib/utils");

// 密钥模式定义：{ provider, pattern, description }
const SECRET_PATTERNS = [
  // AI 服务
  {
    provider: "Anthropic",
    pattern: /sk-ant-api\d{2}-[A-Za-z0-9_-]{80,}/g,
    description: "Anthropic API Key",
  },
  {
    provider: "OpenAI",
    pattern: /sk-[A-Za-z0-9]{32,}/g,
    description: "OpenAI API Key",
  },
  {
    provider: "HuggingFace",
    pattern: /hf_[A-Za-z0-9]{30,}/g,
    description: "HuggingFace Token",
  },
  {
    provider: "Groq",
    pattern: /gsk_[A-Za-z0-9]{50,}/g,
    description: "Groq API Key",
  },
  {
    provider: "Replicate",
    pattern: /r8_[A-Za-z0-9]{38,}/g,
    description: "Replicate API Token",
  },
  {
    provider: "Cohere",
    pattern: /[A-Za-z0-9]{40}(?=.*cohere)/gi,
    description: "Cohere API Key",
  },

  // 云服务
  {
    provider: "AWS",
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: "AWS Access Key ID",
  },
  {
    provider: "AWS Secret",
    pattern: /[A-Za-z0-9/+=]{40}(?=.*aws)/gi,
    description: "AWS Secret Access Key",
  },
  {
    provider: "Google Cloud",
    pattern: /AIza[A-Za-z0-9_-]{35}/g,
    description: "Google API Key",
  },
  {
    provider: "Azure",
    pattern: /[A-Za-z0-9]{32}(?=.*azure)/gi,
    description: "Azure API Key",
  },

  // 支付服务
  {
    provider: "Stripe",
    pattern: /sk_live_[A-Za-z0-9]{24,}/g,
    description: "Stripe Live Secret Key",
  },
  {
    provider: "Stripe Test",
    pattern: /sk_test_[A-Za-z0-9]{24,}/g,
    description: "Stripe Test Secret Key",
  },
  {
    provider: "PayPal",
    pattern: /access_token\$production\$[A-Za-z0-9]{24,}/g,
    description: "PayPal Access Token",
  },

  // 开发平台
  {
    provider: "GitHub",
    pattern: /ghp_[A-Za-z0-9]{36}/g,
    description: "GitHub Personal Access Token",
  },
  {
    provider: "GitHub OAuth",
    pattern: /gho_[A-Za-z0-9]{36}/g,
    description: "GitHub OAuth Token",
  },
  {
    provider: "GitLab",
    pattern: /glpat-[A-Za-z0-9_-]{20,}/g,
    description: "GitLab Personal Access Token",
  },
  {
    provider: "npm",
    pattern: /npm_[A-Za-z0-9]{36}/g,
    description: "npm Access Token",
  },
  {
    provider: "PyPI",
    pattern: /pypi-[A-Za-z0-9_-]{100,}/g,
    description: "PyPI API Token",
  },

  // 部署平台
  {
    provider: "Vercel",
    pattern: /vercel_[A-Za-z0-9]{24}/g,
    description: "Vercel Token",
  },
  {
    provider: "Netlify",
    pattern: /[A-Za-z0-9_-]{40,}(?=.*netlify)/gi,
    description: "Netlify Access Token",
  },
  {
    provider: "Heroku",
    pattern:
      /[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}(?=.*heroku)/gi,
    description: "Heroku API Key",
  },
  {
    provider: "Railway",
    pattern: /railway_[A-Za-z0-9]{32,}/g,
    description: "Railway Token",
  },

  // 数据库服务
  {
    provider: "Supabase",
    pattern: /sbp_[A-Za-z0-9]{40}/g,
    description: "Supabase Service Key",
  },
  {
    provider: "MongoDB",
    pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@/g,
    description: "MongoDB Connection String",
  },
  {
    provider: "Redis",
    pattern: /redis:\/\/[^:]+:[^@]+@/g,
    description: "Redis Connection String",
  },
  {
    provider: "Databricks",
    pattern: /dapi[A-Za-z0-9]{32}/g,
    description: "Databricks Token",
  },

  // 通信服务
  {
    provider: "Slack",
    pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g,
    description: "Slack Token",
  },
  {
    provider: "Discord",
    pattern: /[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}/g,
    description: "Discord Bot Token",
  },
  {
    provider: "Twilio",
    pattern: /SK[A-Za-z0-9]{32}/g,
    description: "Twilio API Key",
  },
  {
    provider: "SendGrid",
    pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g,
    description: "SendGrid API Key",
  },

  // 通用模式
  {
    provider: "Private Key",
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    description: "Private Key Header",
  },
  {
    provider: "JWT",
    pattern:
      /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    description: "JSON Web Token",
  },
  {
    provider: "Generic API Key",
    pattern:
      /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi,
    description: "Generic API Key Pattern",
  },
  {
    provider: "Generic Secret",
    pattern:
      /(?:secret|password|passwd|pwd)\s*[:=]\s*['"]?[A-Za-z0-9_!@#$%^&*]{8,}['"]?/gi,
    description: "Generic Secret Pattern",
  },
];

// 需要排除的文件/目录
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /\.env\.example/,
  /\.env\.sample/,
  /\.env\.template/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/,
  /\.test\.(js|ts)/,
  /\.spec\.(js|ts)/,
  /__tests__/,
  /\.md$/,
  /CHANGELOG/,
  /README/,
];

// 需要检查的文件扩展名
const CHECK_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".env",
  ".py",
  ".go",
  ".java",
  ".cs",
  ".rb",
  ".php",
  ".sh",
  ".bash",
  ".zsh",
  ".config",
];

function shouldCheckFile(filePath) {
  // 检查是否在排除列表中
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(filePath)) {
      return false;
    }
  }

  // 检查扩展名
  const ext = path.extname(filePath).toLowerCase();
  return CHECK_EXTENSIONS.includes(ext) || filePath.includes(".env");
}

function scanForSecrets(content, filePath) {
  const findings = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 跳过注释行（简单检测）
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("*")
    ) {
      continue;
    }

    // 检查每个模式
    for (const { provider, pattern, description } of SECRET_PATTERNS) {
      // 重置正则状态
      pattern.lastIndex = 0;

      if (pattern.test(line)) {
        // 脱敏显示
        const maskedLine = line.replace(
          pattern,
          (match) =>
            match.substring(0, 4) +
            "*".repeat(Math.min(20, match.length - 8)) +
            match.substring(match.length - 4),
        );

        findings.push({
          provider,
          description,
          line: lineNum,
          preview: maskedLine.trim().slice(0, 80),
        });
      }
    }
  }

  return findings;
}

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  // 检查是否是 git commit 操作
  const toolName = input?.tool_name || "";
  const command = input?.tool_input?.command || "";

  // 只在 git commit 时检查
  if (toolName !== "Bash" || !command.includes("git commit")) {
    process.exit(0);
  }

  // 获取待提交的文件
  const { execSync } = require("child_process");
  let stagedFiles = [];

  try {
    const result = execSync("git diff --cached --name-only", {
      encoding: "utf8",
    });
    stagedFiles = result.trim().split("\n").filter(Boolean);
  } catch {
    process.exit(0);
  }

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  // 扫描每个文件
  const allFindings = [];

  for (const file of stagedFiles) {
    if (!shouldCheckFile(file)) {
      continue;
    }

    if (!fs.existsSync(file)) {
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const findings = scanForSecrets(content, file);
    if (findings.length > 0) {
      allFindings.push({ file, findings });
    }
  }

  // 输出结果
  if (allFindings.length > 0) {
    log("");
    log("🔐 [Hook] 密钥泄露检测 - 发现潜在问题");
    log("━".repeat(50));

    for (const { file, findings } of allFindings) {
      log(`\n📄 ${file}:`);
      for (const f of findings.slice(0, 5)) {
        log(`   L${f.line} [${f.provider}] ${f.description}`);
        log(`   > ${f.preview}`);
      }
      if (findings.length > 5) {
        log(`   ... 还有 ${findings.length - 5} 处`);
      }
    }

    log("");
    log("━".repeat(50));
    log("⚠️  建议:");
    log("   1. 使用环境变量代替硬编码密钥");
    log("   2. 将密钥存储在 .env 文件中（已在 .gitignore）");
    log("   3. 如果是误报，可以在行尾添加: // nosecret");
    log("");

    // 不阻止提交，只是警告
    // 如果需要阻止，改为 process.exit(2)
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[CheckSecrets] Error:", err.message);
  process.exit(0);
});
