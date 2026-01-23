/**
 * 包管理器检测与配置
 *
 * 自动检测项目使用的包管理器，支持 npm、pnpm、yarn、bun
 * 提供统一的命令接口
 */

const fs = require('fs');
const path = require('path');
const { commandExists, getClaudeDir, readFile, writeFile, readJsonFile, writeJsonFile } = require('./utils');

// ==================== 包管理器定义 ====================

const PACKAGE_MANAGERS = {
  npm: {
    name: 'npm',
    lockFile: 'package-lock.json',
    install: 'npm install',
    add: 'npm install',
    addDev: 'npm install -D',
    remove: 'npm uninstall',
    run: 'npm run',
    exec: 'npx',
    test: 'npm test',
    build: 'npm run build',
    dev: 'npm run dev',
    start: 'npm start'
  },
  pnpm: {
    name: 'pnpm',
    lockFile: 'pnpm-lock.yaml',
    install: 'pnpm install',
    add: 'pnpm add',
    addDev: 'pnpm add -D',
    remove: 'pnpm remove',
    run: 'pnpm',
    exec: 'pnpm dlx',
    test: 'pnpm test',
    build: 'pnpm build',
    dev: 'pnpm dev',
    start: 'pnpm start'
  },
  yarn: {
    name: 'yarn',
    lockFile: 'yarn.lock',
    install: 'yarn',
    add: 'yarn add',
    addDev: 'yarn add -D',
    remove: 'yarn remove',
    run: 'yarn',
    exec: 'yarn dlx',
    test: 'yarn test',
    build: 'yarn build',
    dev: 'yarn dev',
    start: 'yarn start'
  },
  bun: {
    name: 'bun',
    lockFile: 'bun.lockb',
    install: 'bun install',
    add: 'bun add',
    addDev: 'bun add -D',
    remove: 'bun remove',
    run: 'bun run',
    exec: 'bunx',
    test: 'bun test',
    build: 'bun run build',
    dev: 'bun run dev',
    start: 'bun start'
  }
};

// 检测优先级顺序（性能越好的越靠前）
const DETECTION_PRIORITY = ['pnpm', 'bun', 'yarn', 'npm'];

// ==================== 配置管理 ====================

/**
 * 获取全局配置文件路径
 */
function getGlobalConfigPath() {
  return path.join(getClaudeDir(), 'package-manager.json');
}

/**
 * 获取项目配置文件路径
 */
function getProjectConfigPath(projectDir = process.cwd()) {
  return path.join(projectDir, '.claude', 'package-manager.json');
}

/**
 * 加载全局配置
 */
function loadGlobalConfig() {
  return readJsonFile(getGlobalConfigPath());
}

/**
 * 保存全局配置
 */
function saveGlobalConfig(config) {
  writeJsonFile(getGlobalConfigPath(), config);
}

/**
 * 加载项目配置
 */
function loadProjectConfig(projectDir = process.cwd()) {
  return readJsonFile(getProjectConfigPath(projectDir));
}

/**
 * 保存项目配置
 */
function saveProjectConfig(config, projectDir = process.cwd()) {
  writeJsonFile(getProjectConfigPath(projectDir), config);
}

// ==================== 检测逻辑 ====================

/**
 * 从 lock 文件检测包管理器
 */
function detectFromLockFile(projectDir = process.cwd()) {
  for (const pmName of DETECTION_PRIORITY) {
    const pm = PACKAGE_MANAGERS[pmName];
    const lockFilePath = path.join(projectDir, pm.lockFile);

    if (fs.existsSync(lockFilePath)) {
      return pmName;
    }
  }
  return null;
}

/**
 * 从 package.json 的 packageManager 字段检测
 */
function detectFromPackageJson(projectDir = process.cwd()) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const content = readFile(packageJsonPath);

  if (content) {
    try {
      const pkg = JSON.parse(content);
      if (pkg.packageManager) {
        // 格式: "pnpm@8.6.0" 或 "pnpm"
        const pmName = pkg.packageManager.split('@')[0];
        if (PACKAGE_MANAGERS[pmName]) {
          return pmName;
        }
      }
    } catch {
      // package.json 格式错误
    }
  }
  return null;
}

/**
 * 获取系统已安装的包管理器
 */
function getAvailableManagers() {
  const available = [];

  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    if (commandExists(pmName)) {
      available.push(pmName);
    }
  }

  return available;
}

/**
 * 检测当前项目应使用的包管理器
 *
 * 检测优先级:
 * 1. 环境变量 CLAUDE_PACKAGE_MANAGER
 * 2. 项目配置 .claude/package-manager.json
 * 3. package.json 的 packageManager 字段
 * 4. lock 文件检测
 * 5. 全局配置 ~/.claude/package-manager.json
 * 6. 第一个可用的包管理器（按优先级）
 *
 * @param {object} options - { projectDir }
 * @returns {object} - { name, config, source }
 */
function detect(options = {}) {
  const { projectDir = process.cwd() } = options;

  // 1. 环境变量
  const envPm = process.env.CLAUDE_PACKAGE_MANAGER;
  if (envPm && PACKAGE_MANAGERS[envPm]) {
    return {
      name: envPm,
      config: PACKAGE_MANAGERS[envPm],
      source: 'environment'
    };
  }

  // 2. 项目配置
  const projectConfig = loadProjectConfig(projectDir);
  if (projectConfig?.packageManager && PACKAGE_MANAGERS[projectConfig.packageManager]) {
    return {
      name: projectConfig.packageManager,
      config: PACKAGE_MANAGERS[projectConfig.packageManager],
      source: 'project-config'
    };
  }

  // 3. package.json
  const fromPackageJson = detectFromPackageJson(projectDir);
  if (fromPackageJson) {
    return {
      name: fromPackageJson,
      config: PACKAGE_MANAGERS[fromPackageJson],
      source: 'package.json'
    };
  }

  // 4. lock 文件
  const fromLockFile = detectFromLockFile(projectDir);
  if (fromLockFile) {
    return {
      name: fromLockFile,
      config: PACKAGE_MANAGERS[fromLockFile],
      source: 'lock-file'
    };
  }

  // 5. 全局配置
  const globalConfig = loadGlobalConfig();
  if (globalConfig?.packageManager && PACKAGE_MANAGERS[globalConfig.packageManager]) {
    return {
      name: globalConfig.packageManager,
      config: PACKAGE_MANAGERS[globalConfig.packageManager],
      source: 'global-config'
    };
  }

  // 6. 回退：使用第一个可用的包管理器
  const available = getAvailableManagers();
  for (const pmName of DETECTION_PRIORITY) {
    if (available.includes(pmName)) {
      return {
        name: pmName,
        config: PACKAGE_MANAGERS[pmName],
        source: 'fallback'
      };
    }
  }

  // 默认 npm（Node.js 自带）
  return {
    name: 'npm',
    config: PACKAGE_MANAGERS.npm,
    source: 'default'
  };
}

// ==================== 配置设置 ====================

/**
 * 设置全局首选包管理器
 */
function setGlobal(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`未知的包管理器: ${pmName}`);
  }

  const config = loadGlobalConfig() || {};
  config.packageManager = pmName;
  config.updatedAt = new Date().toISOString();
  saveGlobalConfig(config);

  return config;
}

/**
 * 设置项目首选包管理器
 */
function setProject(pmName, projectDir = process.cwd()) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`未知的包管理器: ${pmName}`);
  }

  const config = {
    packageManager: pmName,
    updatedAt: new Date().toISOString()
  };
  saveProjectConfig(config, projectDir);

  return config;
}

// ==================== 命令生成 ====================

/**
 * 获取运行脚本的命令
 * @param {string} script - 脚本名 (如 "dev", "build", "test")
 */
function getRunCommand(script, options = {}) {
  const pm = detect(options);

  // 预定义脚本使用专用命令
  if (pm.config[script]) {
    return pm.config[script];
  }

  // 其他脚本使用 run 命令
  return `${pm.config.run} ${script}`;
}

/**
 * 获取执行包二进制的命令
 * @param {string} binary - 二进制名 (如 "prettier", "eslint")
 * @param {string} args - 参数
 */
function getExecCommand(binary, args = '', options = {}) {
  const pm = detect(options);
  return `${pm.config.exec} ${binary}${args ? ' ' + args : ''}`;
}

/**
 * 获取安装依赖的命令
 * @param {string} pkg - 包名（可选）
 * @param {boolean} isDev - 是否开发依赖
 */
function getInstallCommand(pkg = '', isDev = false, options = {}) {
  const pm = detect(options);

  if (!pkg) {
    return pm.config.install;
  }

  return isDev ? `${pm.config.addDev} ${pkg}` : `${pm.config.add} ${pkg}`;
}

// ==================== 诊断信息 ====================

/**
 * 获取检测诊断信息
 */
function getDiagnostics(projectDir = process.cwd()) {
  const pm = detect({ projectDir });
  const available = getAvailableManagers();

  return {
    detected: pm.name,
    source: pm.source,
    available,
    lockFiles: DETECTION_PRIORITY.map(name => ({
      name,
      lockFile: PACKAGE_MANAGERS[name].lockFile,
      exists: fs.existsSync(path.join(projectDir, PACKAGE_MANAGERS[name].lockFile))
    }))
  };
}

// ==================== 导出 ====================

module.exports = {
  // 常量
  PACKAGE_MANAGERS,
  DETECTION_PRIORITY,

  // 检测
  detect,
  detectFromLockFile,
  detectFromPackageJson,
  getAvailableManagers,

  // 配置
  setGlobal,
  setProject,
  loadGlobalConfig,
  loadProjectConfig,

  // 命令生成
  getRunCommand,
  getExecCommand,
  getInstallCommand,

  // 诊断
  getDiagnostics
};
