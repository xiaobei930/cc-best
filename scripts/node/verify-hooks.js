#!/usr/bin/env node
/**
 * Hooks 配置验证脚本
 *
 * 功能：
 * - 验证 hooks 配置的脚本路径是否存在
 * - 验证 timeout 是否在合理范围
 * - 验证 matcher 语法是否正确
 * - 输出诊断报告和修复建议
 *
 * 使用：node verify-hooks.js [--global] [--project]
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

// 配置
const CONFIG = {
  // timeout 合理范围 (秒) - Claude Code timeout 单位是秒
  timeout: {
    min: 1,
    max: 600, // 10 分钟
    recommended: {
      PreToolUse: 5,
      PostToolUse: 60,
      SessionStart: 5,
      SessionEnd: 5,
    },
  },
  // 有效的生命周期事件
  validLifecycles: [
    "PreToolUse",
    "PostToolUse",
    "Notification",
    "Stop", // 旧版
    "SessionEnd", // 新版
    "SessionStart",
    "PreCompact",
    "Setup",
  ],
  // 有效的 hook 类型
  validHookTypes: ["command"],
};

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol}${colors.reset} ${message}`);
}

function logError(message) {
  log("red", "❌", message);
}
function logWarning(message) {
  log("yellow", "⚠️ ", message);
}
function logSuccess(message) {
  log("green", "✅", message);
}
function logInfo(message) {
  log("cyan", "ℹ️ ", message);
}

// 获取配置文件路径
function getConfigPaths() {
  const homeDir = os.homedir();
  const cwd = process.cwd();

  return {
    global: path.join(homeDir, ".claude", "settings.json"),
    projectLocal: path.join(cwd, ".claude", "settings.local.json"),
    project: path.join(cwd, ".claude", "settings.json"),
  };
}

// 读取 JSON 文件
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return { success: true, data: JSON.parse(content), path: filePath };
  } catch (e) {
    if (e.code === "ENOENT") {
      return { success: false, error: "文件不存在", path: filePath };
    }
    return {
      success: false,
      error: `JSON 解析错误: ${e.message}`,
      path: filePath,
    };
  }
}

// 验证脚本路径
function validateScriptPath(command) {
  // 提取脚本路径
  const match = command.match(/(?:node|python3?|bash)\s+["']?([^"'\s]+)/i);
  if (!match) {
    return { valid: false, error: "无法解析脚本路径", path: null };
  }

  let scriptPath = match[1];

  // 处理 Windows 路径
  if (process.platform === "win32") {
    scriptPath = scriptPath.replace(/\//g, "\\");
  }

  // 展开 ~ 和环境变量
  if (scriptPath.startsWith("~")) {
    scriptPath = path.join(os.homedir(), scriptPath.slice(1));
  }
  scriptPath = scriptPath.replace(
    /%([^%]+)%/g,
    (_, key) => process.env[key] || "",
  );
  scriptPath = scriptPath.replace(
    /\$([A-Za-z_][A-Za-z0-9_]*)/g,
    (_, key) => process.env[key] || "",
  );

  // 检查文件是否存在
  const exists = fs.existsSync(scriptPath);

  return {
    valid: exists,
    error: exists ? null : "脚本文件不存在",
    path: scriptPath,
  };
}

// 验证 matcher 语法
function validateMatcher(matcher) {
  if (!matcher || typeof matcher !== "string") {
    return { valid: false, error: "matcher 不能为空" };
  }

  // 有效的 matcher 模式
  const validPatterns = [
    "*", // 通配符
    /^[A-Za-z]+$/, // 单个工具名
    /^[A-Za-z]+\|[A-Za-z|]+$/, // 多个工具名（管道分隔）
    /^[A-Za-z]+\(.*\)$/, // 带参数的工具
  ];

  const isValid = validPatterns.some((pattern) => {
    if (typeof pattern === "string") {
      return matcher === pattern;
    }
    return pattern.test(matcher);
  });

  return {
    valid: isValid,
    error: isValid ? null : "matcher 语法可能不正确",
  };
}

// 验证 timeout
function validateTimeout(timeout, lifecycle) {
  if (timeout === undefined || timeout === null) {
    return { valid: true, warning: "未设置 timeout，将使用默认值" };
  }

  if (typeof timeout !== "number" || timeout < CONFIG.timeout.min) {
    return { valid: false, error: `timeout 必须是正数（当前: ${timeout}）` };
  }

  if (timeout > CONFIG.timeout.max) {
    return {
      valid: false,
      error: `timeout 超过最大值 ${CONFIG.timeout.max}s（当前: ${timeout}s）`,
    };
  }

  const recommended = CONFIG.timeout.recommended[lifecycle];
  if (recommended && timeout < recommended / 10) {
    return {
      valid: true,
      warning: `timeout 可能过短（当前: ${timeout}s，建议: ${recommended}s）`,
    };
  }

  return { valid: true };
}

// 验证单个 hook 配置
function validateHook(hook, lifecycle, index) {
  const issues = [];
  const warnings = [];

  // 验证 type
  if (!hook.type || !CONFIG.validHookTypes.includes(hook.type)) {
    issues.push(`无效的 hook type: ${hook.type}`);
  }

  // 验证 command
  if (!hook.command) {
    issues.push("缺少 command 字段");
  } else {
    const pathResult = validateScriptPath(hook.command);
    if (!pathResult.valid) {
      issues.push(`${pathResult.error}: ${pathResult.path || hook.command}`);
    }
  }

  // 验证 timeout
  const timeoutResult = validateTimeout(hook.timeout, lifecycle);
  if (!timeoutResult.valid) {
    issues.push(timeoutResult.error);
  } else if (timeoutResult.warning) {
    warnings.push(timeoutResult.warning);
  }

  return { issues, warnings };
}

// 验证 hooks 配置
function validateHooksConfig(config, source) {
  const results = {
    source,
    valid: true,
    lifecycles: {},
    summary: { errors: 0, warnings: 0, hooks: 0 },
  };

  if (!config.hooks || typeof config.hooks !== "object") {
    results.valid = false;
    results.error = "未找到 hooks 配置";
    return results;
  }

  for (const [lifecycle, entries] of Object.entries(config.hooks)) {
    // 验证生命周期事件
    if (!CONFIG.validLifecycles.includes(lifecycle)) {
      results.lifecycles[lifecycle] = {
        valid: false,
        error: `未知的生命周期事件: ${lifecycle}`,
      };
      results.summary.errors++;
      continue;
    }

    if (!Array.isArray(entries)) {
      results.lifecycles[lifecycle] = {
        valid: false,
        error: "hooks 配置应该是数组",
      };
      results.summary.errors++;
      continue;
    }

    const lifecycleResult = {
      valid: true,
      entries: [],
    };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryResult = {
        index: i,
        matcher: entry.matcher,
        issues: [],
        warnings: [],
      };

      // 验证 matcher
      const matcherResult = validateMatcher(entry.matcher);
      if (!matcherResult.valid) {
        entryResult.issues.push(matcherResult.error);
      }

      // 验证 hooks 数组
      if (!entry.hooks || !Array.isArray(entry.hooks)) {
        entryResult.issues.push("缺少 hooks 数组");
      } else {
        for (let j = 0; j < entry.hooks.length; j++) {
          const hookResult = validateHook(entry.hooks[j], lifecycle, j);
          entryResult.issues.push(...hookResult.issues);
          entryResult.warnings.push(...hookResult.warnings);
          results.summary.hooks++;
        }
      }

      if (entryResult.issues.length > 0) {
        lifecycleResult.valid = false;
        results.summary.errors += entryResult.issues.length;
      }
      results.summary.warnings += entryResult.warnings.length;

      lifecycleResult.entries.push(entryResult);
    }

    results.lifecycles[lifecycle] = lifecycleResult;
    if (!lifecycleResult.valid) {
      results.valid = false;
    }
  }

  return results;
}

// 输出验证报告
function printReport(results) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 Hooks 配置验证报告");
  console.log("=".repeat(60) + "\n");

  console.log(`📁 配置来源: ${results.source}`);
  console.log(`📊 总计: ${results.summary.hooks} 个 hooks\n`);

  if (results.error) {
    logError(results.error);
    return;
  }

  for (const [lifecycle, data] of Object.entries(results.lifecycles)) {
    console.log(`\n📌 ${lifecycle}:`);

    if (data.error) {
      logError(`  ${data.error}`);
      continue;
    }

    for (const entry of data.entries) {
      const status = entry.issues.length === 0 ? "✅" : "❌";
      console.log(`  ${status} [${entry.index}] matcher: "${entry.matcher}"`);

      for (const issue of entry.issues) {
        logError(`      ${issue}`);
      }
      for (const warning of entry.warnings) {
        logWarning(`      ${warning}`);
      }
    }
  }

  // 总结
  console.log("\n" + "-".repeat(60));
  if (results.valid && results.summary.warnings === 0) {
    logSuccess("所有 hooks 配置验证通过！");
  } else if (results.valid) {
    logWarning(`验证通过，但有 ${results.summary.warnings} 个警告`);
  } else {
    logError(
      `验证失败: ${results.summary.errors} 个错误, ${results.summary.warnings} 个警告`,
    );
  }
}

// 输出修复建议
function printSuggestions(results) {
  if (results.valid && results.summary.warnings === 0) {
    return;
  }

  console.log("\n💡 修复建议:\n");

  let suggestionIndex = 1;

  for (const [lifecycle, data] of Object.entries(results.lifecycles)) {
    if (data.error) continue;

    for (const entry of data.entries) {
      for (const issue of entry.issues) {
        if (issue.includes("脚本文件不存在")) {
          console.log(
            `${suggestionIndex}. 脚本路径问题 (${lifecycle}[${entry.index}]):`,
          );
          console.log(`   - 检查脚本路径是否正确`);
          console.log(`   - 如果使用插件，确认插件版本是否匹配`);
          console.log(`   - 运行 /setup --hooks 重新配置 hooks`);
          suggestionIndex++;
        } else if (issue.includes("timeout")) {
          console.log(
            `${suggestionIndex}. Timeout 配置问题 (${lifecycle}[${entry.index}]):`,
          );
          console.log(
            `   - 建议值: ${CONFIG.timeout.recommended[lifecycle] || 5}s`,
          );
          suggestionIndex++;
        }
      }
    }
  }

  if (suggestionIndex === 1) {
    console.log("  暂无具体建议，请检查配置文件格式");
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const checkGlobal = args.includes("--global") || args.length === 0;
  const checkProject = args.includes("--project") || args.length === 0;

  console.log("🔍 Hooks 配置验证工具");
  console.log("=".repeat(60));

  const paths = getConfigPaths();
  const allResults = [];

  // 检查全局配置
  if (checkGlobal) {
    logInfo(`检查全局配置: ${paths.global}`);
    const globalConfig = readJsonFile(paths.global);

    if (globalConfig.success) {
      const results = validateHooksConfig(globalConfig.data, paths.global);
      allResults.push(results);
      printReport(results);
      printSuggestions(results);
    } else {
      logWarning(`全局配置: ${globalConfig.error}`);
    }
  }

  // 检查项目配置
  if (checkProject) {
    // 优先检查 settings.local.json
    logInfo(`\n检查项目配置: ${paths.projectLocal}`);
    let projectConfig = readJsonFile(paths.projectLocal);

    if (!projectConfig.success) {
      logInfo(`检查项目配置: ${paths.project}`);
      projectConfig = readJsonFile(paths.project);
    }

    if (projectConfig.success) {
      const results = validateHooksConfig(
        projectConfig.data,
        projectConfig.path,
      );
      allResults.push(results);
      printReport(results);
      printSuggestions(results);
    } else {
      logInfo(`项目配置: ${projectConfig.error}`);
    }
  }

  // 最终总结
  console.log("\n" + "=".repeat(60));
  console.log("📊 验证总结");
  console.log("=".repeat(60));

  const totalErrors = allResults.reduce((sum, r) => sum + r.summary.errors, 0);
  const totalWarnings = allResults.reduce(
    (sum, r) => sum + r.summary.warnings,
    0,
  );
  const totalHooks = allResults.reduce((sum, r) => sum + r.summary.hooks, 0);

  console.log(
    `\n检查了 ${allResults.length} 个配置文件，共 ${totalHooks} 个 hooks`,
  );

  if (totalErrors === 0 && totalWarnings === 0) {
    logSuccess("\n所有配置验证通过！Hooks 配置正确。\n");
    process.exit(0);
  } else if (totalErrors === 0) {
    logWarning(`\n验证通过，但有 ${totalWarnings} 个警告需要关注。\n`);
    process.exit(0);
  } else {
    logError(`\n验证失败: ${totalErrors} 个错误, ${totalWarnings} 个警告\n`);
    console.log("运行 '/setup --hooks' 重新配置 hooks\n");
    process.exit(1);
  }
}

main();
