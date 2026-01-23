#!/usr/bin/env node
/**
 * 包管理器配置工具
 *
 * 用法：
 *   node setup-package-manager.js --detect      # 检测当前配置
 *   node setup-package-manager.js --list        # 列出可用选项
 *   node setup-package-manager.js --global pnpm # 设置全局首选
 *   node setup-package-manager.js --project bun # 设置项目首选
 */

const {
  detect,
  setGlobal,
  setProject,
  getAvailableManagers,
  getDiagnostics,
  PACKAGE_MANAGERS,
  DETECTION_PRIORITY,
} = require("./lib/package-manager");

function printUsage() {
  console.log(`
包管理器配置工具

用法：
  node setup-package-manager.js [选项]

选项：
  --detect         检测当前包管理器配置
  --list           列出可用的包管理器
  --global <name>  设置全局首选包管理器
  --project <name> 设置当前项目首选包管理器
  --help           显示帮助

支持的包管理器：npm, pnpm, yarn, bun

示例：
  node setup-package-manager.js --detect
  node setup-package-manager.js --global pnpm
  node setup-package-manager.js --project bun
`);
}

function printDetect() {
  const diagnostics = getDiagnostics();

  console.log("\n=== 包管理器检测 ===\n");
  console.log(`当前使用: ${diagnostics.detected}`);
  console.log(`检测来源: ${diagnostics.source}`);

  console.log("\n锁文件状态:");
  for (const lock of diagnostics.lockFiles) {
    const status = lock.exists ? "✓ 存在" : "  不存在";
    console.log(`  ${status} ${lock.lockFile} (${lock.name})`);
  }

  console.log("\n已安装的包管理器:");
  for (const pm of diagnostics.available) {
    const isCurrent = pm === diagnostics.detected ? " ← 当前" : "";
    console.log(`  ✓ ${pm}${isCurrent}`);
  }

  console.log("\n检测优先级:", DETECTION_PRIORITY.join(" > "));
}

function printList() {
  const available = getAvailableManagers();
  const current = detect();

  console.log("\n=== 可用的包管理器 ===\n");

  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    const pm = PACKAGE_MANAGERS[pmName];
    const isAvailable = available.includes(pmName);
    const isCurrent = pmName === current.name;

    const availableIcon = isAvailable ? "✓" : "✗";
    const currentMark = isCurrent ? " ← 当前" : "";

    console.log(`${availableIcon} ${pmName}${currentMark}`);
    if (isAvailable) {
      console.log(`    安装: ${pm.install}`);
      console.log(`    运行: ${pm.run} <script>`);
      console.log(`    执行: ${pm.exec} <package>`);
    }
    console.log();
  }
}

function setGlobalPm(pmName) {
  try {
    const config = setGlobal(pmName);
    console.log(`\n✓ 全局包管理器已设置为: ${pmName}`);
    console.log(`  配置保存在: ~/.claude/package-manager.json`);
  } catch (err) {
    console.error(`\n✗ 错误: ${err.message}`);
    console.log(
      `\n支持的包管理器: ${Object.keys(PACKAGE_MANAGERS).join(", ")}`,
    );
    process.exit(1);
  }
}

function setProjectPm(pmName) {
  try {
    const config = setProject(pmName);
    console.log(`\n✓ 项目包管理器已设置为: ${pmName}`);
    console.log(`  配置保存在: .claude/package-manager.json`);
  } catch (err) {
    console.error(`\n✗ 错误: ${err.message}`);
    console.log(
      `\n支持的包管理器: ${Object.keys(PACKAGE_MANAGERS).join(", ")}`,
    );
    process.exit(1);
  }
}

// 解析命令行参数
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

if (args.includes("--detect")) {
  printDetect();
} else if (args.includes("--list")) {
  printList();
} else if (args.includes("--global")) {
  const idx = args.indexOf("--global");
  const pmName = args[idx + 1];
  if (!pmName) {
    console.error("错误: --global 需要指定包管理器名称");
    process.exit(1);
  }
  setGlobalPm(pmName);
} else if (args.includes("--project")) {
  const idx = args.indexOf("--project");
  const pmName = args[idx + 1];
  if (!pmName) {
    console.error("错误: --project 需要指定包管理器名称");
    process.exit(1);
  }
  setProjectPm(pmName);
} else {
  console.error("未知的选项:", args[0]);
  printUsage();
  process.exit(1);
}
