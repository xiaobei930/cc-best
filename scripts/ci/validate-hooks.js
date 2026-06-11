#!/usr/bin/env node
/**
 * CI 验证脚本: Hooks 格式检查
 *
 * 验证 hooks.json 格式和所有引用的 hook 脚本存在性。
 * 跨平台支持（Windows/macOS/Linux）
 */

const fs = require("fs");
const path = require("path");

const HOOKS_JSON_PATH = path.join(__dirname, "../../hooks/hooks.json");
const SCRIPTS_DIR = path.join(__dirname, "../../scripts/node/hooks");

// 有效的生命周期钩子（对齐 Claude Code v2.1.173，20+ 事件）
const VALID_LIFECYCLES = [
  "Setup",
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "SubagentStart",
  "PermissionRequest",
  "PermissionDenied",
  "InstructionsLoaded",
  "FileChanged",
  "CwdChanged",
  "ConfigChange",
  "TaskCompleted",
  "MessageDisplay",
  "Notification",
  "UserPromptSubmit",
  "Stop",
  "SubagentStop",
  "SessionStart",
  "SessionEnd",
  "PreCompact",
  "PostCompact",
];

/**
 * 从命令中提取脚本路径
 */
function extractScriptPath(command) {
  // 匹配 node "..." 或 node '...' 格式
  const match = command.match(/node\s+["']([^"']+)["']/);
  if (match) {
    return match[1];
  }

  // 匹配 node path 格式（无引号）
  const simpleMatch = command.match(/node\s+(\S+)/);
  if (simpleMatch) {
    return simpleMatch[1];
  }

  return null;
}

/**
 * 验证 hooks.json
 */
function validateHooksJson() {
  const errors = [];
  const warnings = [];

  // 检查文件存在
  if (!fs.existsSync(HOOKS_JSON_PATH)) {
    errors.push("hooks.json 文件不存在");
    return { errors, warnings };
  }

  let content;
  try {
    content = fs.readFileSync(HOOKS_JSON_PATH, "utf-8");
  } catch (err) {
    errors.push(`无法读取文件: ${err.message}`);
    return { errors, warnings };
  }

  // 解析 JSON
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    errors.push(`JSON 格式错误: ${err.message}`);
    return { errors, warnings };
  }

  // 检查根结构
  if (!data.hooks) {
    errors.push("缺少 hooks 字段");
    return { errors, warnings };
  }

  // 验证每个生命周期
  for (const [lifecycle, hookGroups] of Object.entries(data.hooks)) {
    // 检查生命周期名称有效
    if (!VALID_LIFECYCLES.includes(lifecycle)) {
      warnings.push(`未知的生命周期: ${lifecycle}`);
    }

    // 检查 hookGroups 是数组
    if (!Array.isArray(hookGroups)) {
      errors.push(`${lifecycle}: 应为数组格式`);
      continue;
    }

    // 验证每个 hook 组
    for (let i = 0; i < hookGroups.length; i++) {
      const group = hookGroups[i];

      // 检查 hooks 数组存在
      if (!group.hooks || !Array.isArray(group.hooks)) {
        errors.push(`${lifecycle}[${i}]: 缺少 hooks 数组`);
        continue;
      }

      // 验证每个 hook
      for (let j = 0; j < group.hooks.length; j++) {
        const hook = group.hooks[j];

        // 检查 type
        if (!hook.type) {
          errors.push(`${lifecycle}[${i}].hooks[${j}]: 缺少 type`);
        }

        // 检查 command
        if (!hook.command) {
          errors.push(`${lifecycle}[${i}].hooks[${j}]: 缺少 command`);
          continue;
        }

        // 验证脚本文件存在（仅限 node 命令）
        if (hook.command.includes("node")) {
          const scriptPath = extractScriptPath(hook.command);
          if (scriptPath) {
            // 替换环境变量占位符
            const resolvedPath = scriptPath.replace(
              "${CLAUDE_PLUGIN_ROOT}",
              path.join(__dirname, "../.."),
            );

            // 规范化路径
            const normalizedPath = path.normalize(resolvedPath);

            if (!fs.existsSync(normalizedPath)) {
              errors.push(
                `${lifecycle}: 脚本不存在 - ${path.basename(scriptPath)}`,
              );
            }
          }
        }

        // 检查 timeout
        if (hook.timeout !== undefined) {
          if (typeof hook.timeout !== "number" || hook.timeout <= 0) {
            warnings.push(`${lifecycle}[${i}].hooks[${j}]: timeout 应为正数`);
          }
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * 验证所有 hook 脚本
 */
function validateHookScripts() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(SCRIPTS_DIR)) {
    warnings.push(`脚本目录不存在: ${SCRIPTS_DIR}`);
    return { errors, warnings };
  }

  const files = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(SCRIPTS_DIR, file);

    let content;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      errors.push(`${file}: 无法读取 - ${err.message}`);
      continue;
    }

    // 检查文件不为空
    if (content.trim().length < 50) {
      warnings.push(`${file}: 文件内容过少`);
    }

    // 检查是否有 shebang
    if (!content.startsWith("#!/usr/bin/env node")) {
      warnings.push(`${file}: 建议添加 shebang (#!/usr/bin/env node)`);
    }
  }

  return { errors, warnings, count: files.length };
}

/**
 * 检测孤儿脚本（存在但未在 hooks.json 中注册）
 */
function detectOrphanScripts() {
  const warnings = [];

  // 已知的非 hook 脚本（工具类）
  const EXCLUDED_SCRIPTS = [];

  if (!fs.existsSync(HOOKS_JSON_PATH) || !fs.existsSync(SCRIPTS_DIR)) {
    return { warnings };
  }

  // 收集 hooks.json 中引用的所有脚本文件名
  const registeredScripts = new Set();
  try {
    const data = JSON.parse(fs.readFileSync(HOOKS_JSON_PATH, "utf-8"));
    const hooks = data.hooks || data;
    for (const [, hookGroups] of Object.entries(hooks)) {
      if (!Array.isArray(hookGroups)) continue;
      for (const group of hookGroups) {
        if (!group.hooks || !Array.isArray(group.hooks)) continue;
        for (const hook of group.hooks) {
          if (hook.command) {
            const scriptPath = extractScriptPath(hook.command);
            if (scriptPath) {
              registeredScripts.add(path.basename(scriptPath));
            }
          }
        }
      }
    }
  } catch {
    return { warnings };
  }

  // 扫描目录中的脚本
  const allScripts = fs
    .readdirSync(SCRIPTS_DIR)
    .filter((f) => f.endsWith(".js"));

  for (const script of allScripts) {
    if (EXCLUDED_SCRIPTS.includes(script)) continue;
    if (!registeredScripts.has(script)) {
      warnings.push(`孤儿脚本: ${script} 存在但未在 hooks.json 中注册`);
    }
  }

  return { warnings };
}

/**
 * 主函数
 */
function main() {
  console.log("🔍 验证 Hooks...\n");

  let hasErrors = false;
  let totalWarnings = 0;

  // 验证 hooks.json
  console.log("📄 hooks/hooks.json:");
  const jsonResult = validateHooksJson();

  for (const error of jsonResult.errors) {
    console.log(`   ❌ ${error}`);
    hasErrors = true;
  }

  for (const warning of jsonResult.warnings) {
    console.log(`   ⚠️  ${warning}`);
    totalWarnings++;
  }

  if (jsonResult.errors.length === 0 && jsonResult.warnings.length === 0) {
    console.log("   ✅ 格式正确");
  }

  console.log("");

  // 验证 hook 脚本
  console.log("📂 scripts/node/hooks/:");
  const scriptsResult = validateHookScripts();

  for (const error of scriptsResult.errors) {
    console.log(`   ❌ ${error}`);
    hasErrors = true;
  }

  for (const warning of scriptsResult.warnings) {
    console.log(`   ⚠️  ${warning}`);
    totalWarnings++;
  }

  if (
    scriptsResult.errors.length === 0 &&
    scriptsResult.warnings.length === 0
  ) {
    console.log(`   ✅ ${scriptsResult.count} 个脚本验证通过`);
  }

  console.log("");

  // 检测孤儿脚本
  console.log("🔍 孤儿脚本检测:");
  const orphanResult = detectOrphanScripts();

  for (const warning of orphanResult.warnings) {
    console.log(`   ⚠️  ${warning}`);
    totalWarnings++;
  }

  if (orphanResult.warnings.length === 0) {
    console.log("   ✅ 无孤儿脚本");
  }

  console.log("");

  // 输出汇总
  console.log("─".repeat(50));
  if (hasErrors) {
    console.log("❌ 验证失败: 存在错误");
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(`⚠️  验证通过，${totalWarnings} 个警告`);
  } else {
    console.log("✅ 验证通过: Hooks 配置正确");
  }
}

main();
