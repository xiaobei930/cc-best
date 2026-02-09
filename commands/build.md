---
description: 构建项目并检查错误（修复错误见 /cc-best:fix）
allowed-tools: Read, Glob, Grep, Bash, Task
---

# /build - 构建项目

构建项目并检查错误。

## 自动检测

根据项目类型自动选择构建命令：

| 项目类型    | 检测文件            | 构建命令                 |
| ----------- | ------------------- | ------------------------ |
| Python      | `pyproject.toml`    | `pip install -e .`       |
| Node.js     | `package.json`      | `npm run build`          |
| TypeScript  | `tsconfig.json`     | `tsc` 或 `npm run build` |
| Java Maven  | `pom.xml`           | `mvn package`            |
| Java Gradle | `build.gradle`      | `gradle build`           |
| .NET        | `*.csproj`, `*.sln` | `dotnet build`           |
| Go          | `go.mod`            | `go build ./...`         |
| Rust        | `Cargo.toml`        | `cargo build`            |
| C++         | `CMakeLists.txt`    | `cmake --build build`    |
| C++         | `Makefile`          | `make`                   |

## 执行流程

```
1. 检测项目类型
   └─ 查找配置文件

2. 执行构建
   └─ 运行对应的构建命令

3. 检查结果
   └─ 编译错误
   └─ 类型错误
   └─ 警告信息

4. 报告问题
   └─ 列出所有错误
   └─ 提供修复建议
```

## 常用命令

### Python

```bash
pip install -e .            # 开发模式安装
python -m py_compile *.py   # 语法检查
mypy src/                   # 类型检查
```

### TypeScript/Node.js

```bash
npm run build               # 构建
tsc --noEmit                # 类型检查
npm run lint                # 代码检查
```

### Java

```bash
mvn compile                 # 编译
mvn package                 # 打包
mvn package -DskipTests     # 跳过测试打包
```

### .NET

```bash
dotnet build                # 构建
dotnet build --configuration Release  # Release 构建
```

### C++

```bash
mkdir -p build && cd build
cmake ..
cmake --build .
```

## 错误处理

如果构建失败：

1. 分析错误信息
2. 定位问题文件和行号
3. 调用 `/cc-best:fix` 修复构建错误
4. 重新构建验证

## Agent 集成

### build-error-resolver - 构建错误分析

**何时使用**:

- 错误数量较多（>5 个）
- 错误根因不明确
- 涉及跨文件的依赖问题

**调用方式**:

```
使用 Task 工具调用 build-error-resolver agent:
- subagent_type: "cc-best:build-error-resolver"
- prompt: "分析构建错误并提供最小化修复方案"
```

**工作流**:

```
/cc-best:build 执行构建
    ↓
  构建失败？
    ├─ 否 → 完成
    └─ 是 → 错误复杂？
              ├─ 否 → /cc-best:fix 快速修复
              └─ 是 → build-error-resolver agent
                        ↓
                     返回修复方案
                        ↓
              /cc-best:fix 执行修复
```
