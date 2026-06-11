/**
 * 跨平台工具函数库
 *
 * 支持 Windows、macOS、Linux 的通用工具函数
 * 用于 Claude Code hooks 和脚本
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, spawnSync } = require("child_process");

// ==================== 平台检测 ====================

const isWindows = process.platform === "win32";
const isMacOS = process.platform === "darwin";
const isLinux = process.platform === "linux";

// ==================== 路径工具 ====================

/**
 * 获取用户主目录
 */
function getHomeDir() {
  return os.homedir();
}

/**
 * 获取 Claude 配置目录 (~/.claude)
 */
function getClaudeDir() {
  return path.join(getHomeDir(), ".claude");
}

/**
 * 获取项目的 .claude 目录
 */
function getProjectClaudeDir(projectDir = process.cwd()) {
  return path.join(projectDir, ".claude");
}

/**
 * 获取 memory-bank 目录
 */
function getMemoryBankDir(projectDir = process.cwd()) {
  return path.join(projectDir, "memory-bank");
}

/**
 * 获取插件数据持久化目录
 * 优先使用官方 CLAUDE_PLUGIN_DATA 环境变量（v2.1.97+），
 * 向前兼容回退到 memory-bank 目录
 *
 * @param {string} projectDir - 项目目录
 * @returns {string} 插件数据目录路径
 */
function getPluginDataDir(projectDir = process.cwd()) {
  if (process.env.CLAUDE_PLUGIN_DATA) {
    return process.env.CLAUDE_PLUGIN_DATA;
  }
  return getMemoryBankDir(projectDir);
}

/**
 * 获取临时目录
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * 确保目录存在，不存在则创建
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

// ==================== 会话管理 ====================

/**
 * 获取当前 Claude Code 会话 ID
 * 会话 ID 由 Claude Code 通过 CLAUDE_SESSION_ID 环境变量提供
 *
 * @param {string} fallback - 无会话 ID 时的回退值
 * @returns {string} 完整会话 ID 或回退值
 */
function getSessionId(fallback = "default") {
  const sessionId = process.env.CLAUDE_SESSION_ID;
  if (!sessionId || sessionId.length === 0) {
    return fallback;
  }
  return sessionId;
}

/**
 * 获取会话 ID 的短版本（后 8 位）
 * 适用于文件命名、日志标记等需要简短标识的场景
 *
 * @param {string} fallback - 无会话 ID 时的回退值
 * @returns {string} 会话 ID 后 8 位或回退值
 */
function getSessionIdShort(fallback = "default") {
  const sessionId = process.env.CLAUDE_SESSION_ID;
  if (!sessionId || sessionId.length === 0) {
    return fallback;
  }
  return sessionId.slice(-8);
}

/**
 * 生成带会话标识的文件名
 * 用于创建会话特定的日志、状态文件等
 *
 * @param {string} baseName - 基础文件名 (如 "progress")
 * @param {string} ext - 文件扩展名 (如 "md")
 * @returns {string} 带会话标识的文件名 (如 "progress-a1b2c3d4.md")
 */
function getSessionFileName(baseName, ext) {
  const sessionId = getSessionIdShort();
  if (sessionId === "default") {
    return `${baseName}.${ext}`;
  }
  return `${baseName}-${sessionId}.${ext}`;
}

// ==================== 日期时间 ====================

/**
 * 获取当前日期 (YYYY-MM-DD)
 */
function getDateString() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * 获取当前时间 (HH:MM)
 */
function getTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

/**
 * 获取当前日期时间 (YYYY-MM-DD HH:MM:SS)
 */
function getDateTimeString() {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
}

// ==================== 文件操作 ====================

/**
 * 安全读取文件，失败返回 null
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * 安全读取 JSON 文件
 */
function readJsonFile(filePath) {
  const content = readFile(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 写入文件（自动创建目录）
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * 写入 JSON 文件
 */
function writeJsonFile(filePath, data) {
  writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * 追加内容到文件
 */
function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, "utf8");
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 查找匹配的文件
 * @param {string} dir - 搜索目录
 * @param {string} pattern - 文件模式 (如 "*.md", "*.json")
 * @param {object} options - { maxAge: 天数, recursive: 是否递归 }
 */
function findFiles(dir, pattern, options = {}) {
  const { maxAge = null, recursive = false } = options;
  const results = [];

  if (!fs.existsSync(dir)) return results;

  // 将 glob 模式转换为正则表达式
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  const regex = new RegExp(`^${regexPattern}$`);

  function search(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isFile() && regex.test(entry.name)) {
          const stats = fs.statSync(fullPath);
          const ageInDays =
            (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

          if (maxAge === null || ageInDays <= maxAge) {
            results.push({ path: fullPath, mtime: stats.mtimeMs, ageInDays });
          }
        } else if (entry.isDirectory() && recursive) {
          search(fullPath);
        }
      }
    } catch {
      // 忽略权限错误
    }
  }

  search(dir);

  // 按修改时间降序排序（最新的在前）
  return results.sort((a, b) => b.mtime - a.mtime);
}

// ==================== Hook I/O ====================

/**
 * 从 stdin 读取 JSON（用于 hook 输入）
 */
async function readStdinJson() {
  return new Promise((resolve, reject) => {
    let data = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    process.stdin.on("error", reject);
  });
}

/**
 * 输出日志到 stderr（用户可见）
 */
function log(message) {
  console.error(message);
}

/**
 * 输出结果到 stdout（返回给 Claude）
 */
function output(data) {
  console.log(typeof data === "object" ? JSON.stringify(data) : data);
}

// ==================== 系统命令 ====================

/**
 * 检查命令是否存在
 * 使用 spawnSync 避免命令注入风险
 */
function commandExists(cmd) {
  // 输入验证：只允许字母、数字、连字符、下划线、点
  if (!/^[a-zA-Z0-9_.-]+$/.test(cmd)) {
    return false;
  }

  try {
    const result = isWindows
      ? spawnSync("where", [cmd], { stdio: "pipe" })
      : spawnSync("which", [cmd], { stdio: "pipe" });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * 执行命令并返回结果
 *
 * ⚠️ 安全警告：此函数执行 shell 命令。
 * - 仅用于可信的、硬编码的命令
 * - 禁止直接传递用户输入
 * - 如需处理用户输入，请使用 spawnSync 配合参数数组
 *
 * @param {string} cmd - 要执行的命令（应为可信/硬编码的命令）
 * @param {object} options - execSync 选项
 */
function runCommand(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

/**
 * 检查当前目录是否是 git 仓库
 */
function isGitRepo(dir = process.cwd()) {
  return runCommand("git rev-parse --git-dir", { cwd: dir }).success;
}

/**
 * 获取 git 修改的文件列表
 */
function getGitModifiedFiles(dir = process.cwd()) {
  if (!isGitRepo(dir)) return [];

  const result = runCommand("git diff --name-only HEAD", { cwd: dir });
  if (!result.success) return [];

  return result.output.split(/\r?\n/).filter(Boolean);
}

/**
 * 获取 git 当前分支名
 */
function getGitBranch(dir = process.cwd()) {
  const result = runCommand("git branch --show-current", { cwd: dir });
  return result.success ? result.output : null;
}

// ==================== 会话别名 ====================

/**
 * 获取会话别名文件路径
 * @returns {string} ~/.claude/session-aliases.json
 */
function getSessionAliasesPath() {
  // 使用 module.exports 引用以支持测试 mock
  return path.join(module.exports.getClaudeDir(), "session-aliases.json");
}

/**
 * 加载所有会话别名
 * @returns {Array} 别名数组
 */
function loadSessionAliases() {
  return readJsonFile(module.exports.getSessionAliasesPath()) || [];
}

/**
 * 保存会话别名
 * @param {string} name - 别名（如 "feature-login-page"）
 * @param {object} data - 别名数据 { sessionPath, tags, summary }
 */
function saveSessionAlias(name, data = {}) {
  const aliases = module.exports.loadSessionAliases();
  const existing = aliases.findIndex((a) => a.name === name);

  const entry = {
    name,
    sessionPath: data.sessionPath || "memory-bank/progress.md",
    tags: data.tags || inferTags(name),
    created: data.created || getDateTimeString(),
    summary: data.summary || "",
  };

  if (existing >= 0) {
    aliases[existing] = { ...aliases[existing], ...entry };
  } else {
    aliases.push(entry);
  }

  writeJsonFile(module.exports.getSessionAliasesPath(), aliases);
  return entry;
}

/**
 * 按别名查找会话
 * @param {string} query - 别名或部分匹配
 * @returns {object|null} 匹配的别名条目
 */
function findSessionByAlias(query) {
  const aliases = module.exports.loadSessionAliases();

  // 精确匹配
  const exact = aliases.find((a) => a.name === query);
  if (exact) return exact;

  // 部分匹配
  const partial = aliases.filter(
    (a) =>
      a.name.includes(query) ||
      (a.tags && a.tags.some((t) => t.includes(query))),
  );
  return partial.length === 1 ? partial[0] : null;
}

/**
 * 从别名推断标签
 * @param {string} name - 别名
 * @returns {string[]} 推断的标签
 */
function inferTags(name) {
  const prefixes = {
    feature: "feature",
    bugfix: "bugfix",
    fix: "bugfix",
    refactor: "refactor",
    explore: "explore",
    hotfix: "hotfix",
  };

  const tags = [];
  for (const [prefix, tag] of Object.entries(prefixes)) {
    if (name.startsWith(`${prefix}-`)) {
      tags.push(tag);
      break;
    }
  }
  return tags;
}

// ==================== Hook Profile ====================

/**
 * Hook Profile 系统
 *
 * 通过环境变量 CC_BEST_HOOK_PROFILE 控制 hook 执行范围：
 * - minimal: 仅安全类 hook（validate-command, check-secrets, protect-files 等）
 * - standard: 安全 + 质量类 hook（默认）
 * - full: 全部 hook（含学习、追踪类）
 */

const HOOK_PROFILES = {
  // safety: minimal 级别即执行
  "validate-command": "safety",
  "pause-before-push": "safety",
  "check-secrets": "safety",
  "protect-files": "safety",
  "block-random-md": "safety",
  "session-check": "safety",

  // quality: standard 级别执行
  "long-running-warning": "quality",
  "format-file": "quality",
  "auto-archive": "quality",
  "suggest-compact": "quality",
  "check-console-log": "quality",
  "typescript-check": "quality",
  "user-prompt-submit": "quality",
  "stop-check": "quality",
  "pre-compact": "quality",
  "post-compact": "quality",

  // learning: full 级别执行
  "observe-patterns": "learning",
  "post-tool-failure": "learning",
  "subagent-stop": "learning",
  "subagent-start": "learning",
  "evaluate-session": "learning",
  "notification-handler": "learning",

  // v0.10.0 新增 hook（对齐 Claude Code v2.1.97）
  // safety: 权限请求记录
  "permission-request": "safety",
  // quality: 环境变化感知
  "file-changed": "quality",
  "cwd-changed": "quality",
  "config-change": "quality",
  "instructions-loaded": "quality",
  // learning: 权限拒绝追踪、任务完成追踪
  "permission-denied": "learning",
  "task-completed": "learning",

  // v0.11.0 新增 hook（对齐 Claude Code v2.1.173）
  // safety: 显示层敏感信息打码
  "message-display": "safety",
};

const PROFILE_LEVELS = { minimal: 1, standard: 2, full: 3 };
const CATEGORY_MIN_LEVEL = { safety: 1, quality: 2, learning: 3 };

/**
 * 获取当前 Hook Profile
 * @returns {'minimal'|'standard'|'full'}
 */
function getHookProfile() {
  const profile = process.env.CC_BEST_HOOK_PROFILE || "full";
  return PROFILE_LEVELS[profile] ? profile : "full";
}

/**
 * 检查 hook 是否应在当前 profile 下执行
 * @param {string} hookName - hook 名称（不含 .js）
 * @returns {boolean}
 */
function shouldRunInProfile(hookName) {
  const currentLevel = PROFILE_LEVELS[getHookProfile()] || 2;
  const hookCategory = HOOK_PROFILES[hookName] || "quality";
  const requiredLevel = CATEGORY_MIN_LEVEL[hookCategory] || 2;
  return currentLevel >= requiredLevel;
}

// ==================== 文本处理 ====================

/**
 * 在文件中搜索匹配的行
 */
function grepFile(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return [];

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const lines = content.split("\n");
  const results = [];

  lines.forEach((line, index) => {
    if (regex.test(line)) {
      results.push({ lineNumber: index + 1, content: line });
    }
  });

  return results;
}

/**
 * 统计文件中匹配模式的数量
 */
function countInFile(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return 0;

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, "g");
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

// ==================== 导出 ====================
// 错误返回约定:
//   readFile/readJsonFile → null（文件不存在或解析失败）
//   findFiles             → []（空数组，无匹配或目录不存在）
//   runCommand            → { success: false, output: "" }（命令失败）
//   getGitBranch          → null（非 git 仓库或命令失败）

module.exports = {
  // 平台信息
  isWindows,
  isMacOS,
  isLinux,

  // 路径工具
  getHomeDir,
  getClaudeDir,
  getProjectClaudeDir,
  getMemoryBankDir,
  getPluginDataDir,
  getTempDir,
  ensureDir,

  // 会话管理
  getSessionId,
  getSessionIdShort,
  getSessionFileName,

  // 日期时间
  getDateString,
  getTimeString,
  getDateTimeString,

  // 文件操作
  readFile,
  readJsonFile,
  writeFile,
  writeJsonFile,
  appendFile,
  fileExists,
  findFiles,

  // Hook I/O
  readStdinJson,
  log,
  output,

  // 系统命令
  commandExists,
  runCommand,
  isGitRepo,
  getGitModifiedFiles,
  getGitBranch,

  // 会话别名
  getSessionAliasesPath,
  loadSessionAliases,
  saveSessionAlias,
  findSessionByAlias,
  inferTags,

  // 文本处理
  grepFile,
  countInFile,

  // Hook Profile
  HOOK_PROFILES,
  getHookProfile,
  shouldRunInProfile,
};
