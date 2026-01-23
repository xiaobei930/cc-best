/**
 * 跨平台工具函数库
 *
 * 支持 Windows、macOS、Linux 的通用工具函数
 * 用于 Claude Code hooks 和脚本
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ==================== 平台检测 ====================

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

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
  return path.join(getHomeDir(), '.claude');
}

/**
 * 获取项目的 .claude 目录
 */
function getProjectClaudeDir(projectDir = process.cwd()) {
  return path.join(projectDir, '.claude');
}

/**
 * 获取 memory-bank 目录
 */
function getMemoryBankDir(projectDir = process.cwd()) {
  return path.join(projectDir, 'memory-bank');
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

// ==================== 日期时间 ====================

/**
 * 获取当前日期 (YYYY-MM-DD)
 */
function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
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
  return now.toISOString().replace('T', ' ').slice(0, 19);
}

// ==================== 文件操作 ====================

/**
 * 安全读取文件，失败返回 null
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
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
  fs.writeFileSync(filePath, content, 'utf8');
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
  fs.appendFileSync(filePath, content, 'utf8');
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
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);

  function search(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isFile() && regex.test(entry.name)) {
          const stats = fs.statSync(fullPath);
          const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

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
    let data = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    process.stdin.on('error', reject);
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
  console.log(typeof data === 'object' ? JSON.stringify(data) : data);
}

// ==================== 系统命令 ====================

/**
 * 检查命令是否存在
 */
function commandExists(cmd) {
  try {
    execSync(isWindows ? `where ${cmd}` : `which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 执行命令并返回结果
 */
function runCommand(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
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
  return runCommand('git rev-parse --git-dir', { cwd: dir }).success;
}

/**
 * 获取 git 修改的文件列表
 */
function getGitModifiedFiles(dir = process.cwd()) {
  if (!isGitRepo(dir)) return [];

  const result = runCommand('git diff --name-only HEAD', { cwd: dir });
  if (!result.success) return [];

  return result.output.split('\n').filter(Boolean);
}

/**
 * 获取 git 当前分支名
 */
function getGitBranch(dir = process.cwd()) {
  const result = runCommand('git branch --show-current', { cwd: dir });
  return result.success ? result.output : null;
}

// ==================== 文本处理 ====================

/**
 * 在文件中搜索匹配的行
 */
function grepFile(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return [];

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  const lines = content.split('\n');
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

  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

// ==================== 导出 ====================

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
  getTempDir,
  ensureDir,

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

  // 文本处理
  grepFile,
  countInFile
};
