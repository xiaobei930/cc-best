#!/usr/bin/env node
/**
 * Convert to Local: 将插件命令格式转换为本地格式
 *
 * 适用于直接 clone 仓库到 .claude/ 目录使用的用户。
 * 将所有 `/cc-best:xxx` 格式的命令引用替换为 `/xxx` 格式。
 *
 * 用法:
 *   node scripts/node/convert-to-local.js [--dry-run]
 *
 * 参数:
 *   --dry-run  只显示会修改的文件，不实际修改
 *
 * 说明:
 *   - 插件安装使用: /cc-best:pm, /cc-best:iterate 等
 *   - 直接 clone 使用: /pm, /iterate 等
 */

const fs = require("fs");
const path = require("path");

const PLUGIN_PREFIX = "cc-best:";
const DRY_RUN = process.argv.includes("--dry-run");

// 需要处理的目录
const DIRS_TO_PROCESS = [
  "commands",
  "skills",
  "agents",
  ".claude-plugin",
  "docs",
  "rules",
];

// 需要处理的文件
const FILES_TO_PROCESS = ["CLAUDE.md", "README.md", "README.zh-CN.md"];

// 匹配 /cc-best:xxx 格式的正则
const COMMAND_PATTERN = /\/cc-best:([a-z][a-z0-9-]*)/g;

/**
 * 递归获取目录中的所有 .md 文件
 */
function getMdFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getMdFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const matches = content.match(COMMAND_PATTERN);

  if (!matches || matches.length === 0) {
    return { modified: false, count: 0 };
  }

  const newContent = content.replace(COMMAND_PATTERN, "/$1");

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${filePath}`);
    console.log(`  会替换 ${matches.length} 处命令引用:`);
    const unique = [...new Set(matches)];
    unique.forEach((m) => {
      const newCmd = m.replace(COMMAND_PATTERN, "/$1");
      console.log(`    ${m} → ${newCmd}`);
    });
    return { modified: true, count: matches.length };
  }

  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`[MODIFIED] ${filePath} (${matches.length} 处)`);
  return { modified: true, count: matches.length };
}

/**
 * 主函数
 */
function main() {
  console.log("=".repeat(60));
  console.log("CC-Best: 转换为本地命令格式");
  console.log("=".repeat(60));
  console.log();

  if (DRY_RUN) {
    console.log("⚠️  DRY-RUN 模式：只显示会修改的文件，不实际修改");
    console.log();
  }

  const rootDir = path.resolve(__dirname, "../..");
  let totalFiles = 0;
  let totalReplacements = 0;

  // 处理目录中的文件
  for (const dir of DIRS_TO_PROCESS) {
    const dirPath = path.join(rootDir, dir);
    const files = getMdFiles(dirPath);
    for (const file of files) {
      const result = processFile(file);
      if (result.modified) {
        totalFiles++;
        totalReplacements += result.count;
      }
    }
  }

  // 处理根目录的特定文件
  for (const file of FILES_TO_PROCESS) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      const result = processFile(filePath);
      if (result.modified) {
        totalFiles++;
        totalReplacements += result.count;
      }
    }
  }

  console.log();
  console.log("=".repeat(60));
  console.log(`总计: ${totalFiles} 个文件, ${totalReplacements} 处替换`);

  if (DRY_RUN) {
    console.log();
    console.log("提示: 移除 --dry-run 参数以实际执行替换");
  } else {
    console.log();
    console.log("✅ 转换完成！现在可以使用 /pm, /iterate 等格式的命令");
  }
}

main();
