#!/usr/bin/env node
/**
 * Model Strategy: Agent 模型策略切换
 *
 * 修改 agents/*.md 文件中的 model: 字段，支持三档策略：
 * - quality:  所有 Agent 使用 Opus（最高质量）
 * - balanced: 设计类 Opus + 执行类 Sonnet（性价比最优）
 * - economy:  仅核心用 Sonnet，其余 Haiku（最省 Token）
 *
 * 用法:
 *   node scripts/node/model-strategy.js quality
 *   node scripts/node/model-strategy.js balanced
 *   node scripts/node/model-strategy.js economy
 *   node scripts/node/model-strategy.js --show
 *   node scripts/node/model-strategy.js --help
 *
 * Exit codes:
 * - 0: 成功
 * - 1: 参数错误
 */

const fs = require("fs");
const path = require("path");

// 插件根目录（scripts/node/ → 上 2 层）
const PLUGIN_ROOT = path.resolve(__dirname, "..", "..");
const AGENTS_DIR = path.join(PLUGIN_ROOT, "agents");

// 策略映射表
const STRATEGIES = {
  quality: {
    architect: "opus",
    "code-reviewer": "opus",
    "security-reviewer": "opus",
    planner: "opus",
    "code-simplifier": "opus",
    "tdd-guide": "opus",
    "requirement-validator": "opus",
    "build-error-resolver": "opus",
  },
  balanced: {
    architect: "opus",
    "code-reviewer": "opus",
    "security-reviewer": "opus",
    planner: "sonnet",
    "code-simplifier": "sonnet",
    "tdd-guide": "sonnet",
    "requirement-validator": "sonnet",
    "build-error-resolver": "sonnet",
  },
  economy: {
    architect: "sonnet",
    "code-reviewer": "sonnet",
    "security-reviewer": "sonnet",
    planner: "sonnet",
    "code-simplifier": "haiku",
    "tdd-guide": "sonnet",
    "requirement-validator": "haiku",
    "build-error-resolver": "haiku",
  },
};

/**
 * 获取所有 agent .md 文件
 */
function getAgentFiles() {
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      name: f.replace(".md", ""),
      path: path.join(AGENTS_DIR, f),
    }));
}

/**
 * 读取 agent 文件的当前 model 值
 */
function readAgentModel(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^model:\s*(\w+)$/m);
  return match ? match[1] : null;
}

/**
 * 修改 agent 文件的 model 值
 */
function writeAgentModel(filePath, newModel) {
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(/^model:\s*\w+$/m, `model: ${newModel}`);
  fs.writeFileSync(filePath, updated, "utf8");
}

/**
 * 推断当前策略名称
 */
function inferStrategy(currentModels) {
  for (const [name, mapping] of Object.entries(STRATEGIES)) {
    const matches = Object.entries(mapping).every(
      ([agent, model]) => currentModels[agent] === model,
    );
    if (matches) return name;
  }
  return "custom";
}

/**
 * 显示当前策略
 */
function showCurrentStrategy() {
  const agents = getAgentFiles();
  const currentModels = {};

  console.log("当前 Agent 模型配置:\n");
  console.log("| Agent                 | Model  |");
  console.log("| --------------------- | ------ |");

  for (const agent of agents) {
    const model = readAgentModel(agent.path);
    currentModels[agent.name] = model;
    console.log(`| ${agent.name.padEnd(21)} | ${(model || "?").padEnd(6)} |`);
  }

  const strategy = inferStrategy(currentModels);
  console.log(`\n当前策略: ${strategy}`);
}

/**
 * 应用策略
 */
function applyStrategy(strategyName) {
  const mapping = STRATEGIES[strategyName];
  if (!mapping) {
    console.error(`未知策略: ${strategyName}`);
    console.error(`可用策略: ${Object.keys(STRATEGIES).join(", ")}`);
    process.exit(1);
  }

  const agents = getAgentFiles();
  let changed = 0;

  for (const agent of agents) {
    const targetModel = mapping[agent.name];
    if (!targetModel) continue;

    const currentModel = readAgentModel(agent.path);
    if (currentModel !== targetModel) {
      writeAgentModel(agent.path, targetModel);
      console.log(`  ${agent.name}: ${currentModel} → ${targetModel}`);
      changed++;
    } else {
      console.log(`  ${agent.name}: ${currentModel}（未变更）`);
    }
  }

  console.log(`\n已切换到 ${strategyName} 策略（${changed} 个文件变更）`);
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`用法: node model-strategy.js <strategy|--show|--help>

策略:
  quality   所有 Agent 使用 Opus（最高质量，Token 消耗最大）
  balanced  设计类 Opus + 执行类 Sonnet（推荐，性价比最优）
  economy   仅核心用 Sonnet，其余 Haiku（最省 Token）

选项:
  --show    显示当前 Agent 模型配置
  --help    显示此帮助信息`);
}

// 主逻辑
const arg = process.argv[2];

if (!arg || arg === "--help") {
  showHelp();
  process.exit(0);
}

if (arg === "--show") {
  showCurrentStrategy();
  process.exit(0);
}

if (STRATEGIES[arg]) {
  applyStrategy(arg);
  process.exit(0);
}

console.error(`未知参数: ${arg}`);
showHelp();
process.exit(1);
