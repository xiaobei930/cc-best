#!/usr/bin/env node
/**
 * CC-Best 专属状态行脚本
 *
 * 功能: 显示 cc-best 管线阶段、活跃任务、Git 分支、上下文百分比
 * 输入: JSON 从 stdin（Claude Code 标准协议）
 * 输出: ANSI 彩色状态行字符串
 * 兼容: Windows / macOS / Linux（使用 Node.js 无需 bash/jq）
 *
 * 示例输出: koala:~/project main* PM>[LEAD]>Dev>QA 73% TSK-003
 */

const path = require("path");
const os = require("os");
const { readFile, getGitBranch, runCommand } = require("./lib/utils");

// ==================== ANSI 颜色定义 ====================

const C = {
  blue: "\x1b[38;2;30;102;245m", // 目录路径
  green: "\x1b[38;2;64;160;43m", // Git 分支
  yellow: "\x1b[38;2;223;142;29m", // 未提交标记、时间
  magenta: "\x1b[38;2;136;57;239m", // 上下文百分比、当前阶段
  cyan: "\x1b[38;2;23;146;153m", // 用户名、任务
  gray: "\x1b[38;2;76;79;105m", // 模型名
  dim: "\x1b[38;2;100;100;110m", // 管线非活跃阶段
  reset: "\x1b[0m",
};

// ==================== 管线阶段定义 ====================

const PIPELINE_STAGES = ["PM", "Lead", "Dev", "QA"];

// 阶段关键词映射（用于从 progress.md 中匹配当前阶段）
const STAGE_KEYWORDS = {
  PM: ["pm", "需求", "requirement", "产品", "product"],
  Lead: ["lead", "设计", "design", "架构", "architecture", "方案"],
  Dev: ["dev", "开发", "develop", "编码", "coding", "实现", "implement"],
  QA: ["qa", "测试", "test", "验证", "verify", "质量", "quality"],
};

// ==================== 核心解析函数 ====================

/**
 * 从 progress.md 解析当前阶段和活跃任务
 */
function parseProgress(projectDir) {
  const progressPath = path.join(projectDir, "memory-bank", "progress.md");
  const content = readFile(progressPath);

  if (!content) {
    return { phase: null, task: null };
  }

  // 解析阶段（匹配 **阶段**: xxx 或 **Phase**: xxx）
  let phase = null;
  const phaseMatch = content.match(/\*\*(?:阶段|Phase)\*\*:\s*(.+?)(?:\n|$)/);
  if (phaseMatch) {
    const phaseText = phaseMatch[1].trim().toLowerCase();
    // 尝试匹配到管线阶段
    for (const [stage, keywords] of Object.entries(STAGE_KEYWORDS)) {
      if (keywords.some((kw) => phaseText.includes(kw))) {
        phase = stage;
        break;
      }
    }
  }

  // 解析活跃任务（匹配第一个 - [ ] **TSK-XXX**: xxx）
  let task = null;
  const taskMatch = content.match(/- \[ \] \*\*(TSK-\d+)\*\*:\s*(.+?)(?:\n|$)/);
  if (taskMatch) {
    task = taskMatch[1];
  }

  return { phase, task };
}

/**
 * 渲染管线阶段可视化
 * 当前阶段高亮，其余灰色
 */
function renderPipeline(activeStage) {
  if (!activeStage) return "";

  return PIPELINE_STAGES.map((stage) => {
    if (stage === activeStage) {
      return `${C.magenta}[${stage}]${C.reset}`;
    }
    return `${C.dim}${stage}${C.reset}`;
  }).join(`${C.dim}>${C.reset}`);
}

/**
 * 缩短路径（将 home 目录替换为 ~）
 */
function shortenPath(fullPath) {
  const home = os.homedir();
  if (fullPath.startsWith(home)) {
    return "~" + fullPath.slice(home.length).replace(/\\/g, "/");
  }
  return fullPath.replace(/\\/g, "/");
}

// ==================== 主函数 ====================

async function main() {
  // 从 stdin 读取 JSON 输入
  let input = {};
  try {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (raw) {
      input = JSON.parse(raw);
    }
  } catch {
    // stdin 解析失败时使用空对象
  }

  // 提取输入字段
  const cwd = (input.workspace && input.workspace.current_dir) || process.cwd();
  const model = (input.model && input.model.display_name) || "";
  const remaining =
    input.context_window && input.context_window.remaining_percentage;

  // 获取用户名
  const user = os.userInfo().username;

  // 获取 Git 分支和状态
  const branch = getGitBranch(cwd) || "";
  let dirty = "";
  if (branch) {
    const statusResult = runCommand("git status --porcelain", { cwd });
    if (statusResult.success && statusResult.output.length > 0) {
      dirty = "*";
    }
  }

  // 获取当前时间
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);

  // 解析 cc-best 管线状态
  const { phase, task } = parseProgress(cwd);

  // 构建状态行
  const parts = [];

  // 用户:路径
  parts.push(
    `${C.cyan}${user}${C.reset}:${C.blue}${shortenPath(cwd)}${C.reset}`,
  );

  // Git 分支
  if (branch) {
    parts.push(`${C.green}${branch}${C.yellow}${dirty}${C.reset}`);
  }

  // 管线阶段
  const pipeline = renderPipeline(phase);
  if (pipeline) {
    parts.push(pipeline);
  }

  // 上下文百分比
  if (remaining != null) {
    parts.push(`${C.magenta}${remaining}%${C.reset}`);
  }

  // 模型
  if (model) {
    parts.push(`${C.gray}${model}${C.reset}`);
  }

  // 时间
  parts.push(`${C.yellow}${time}${C.reset}`);

  // 活跃任务
  if (task) {
    parts.push(`${C.cyan}${task}${C.reset}`);
  }

  process.stdout.write(parts.join(" ") + "\n");
}

main().catch(() => {
  // 静默失败，不影响 Claude Code 正常运行
  process.exit(0);
});
