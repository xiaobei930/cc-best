---
allowed-tools: Read, Glob, Grep, Bash
---

# /build - 构建项目

构建项目并检查错误。

## 自动检测

根据项目类型自动选择构建命令：

| 项目类型 | 检测文件 | 构建命令 |
|----------|----------|----------|
| Python | `pyproject.toml` | `pip install -e .` |
| Node.js | `package.json` | `npm run build` |
| TypeScript | `tsconfig.json` | `tsc` 或 `npm run build` |
| Java Maven | `pom.xml` | `mvn package` |
| Java Gradle | `build.gradle` | `gradle build` |
| .NET | `*.csproj`, `*.sln` | `dotnet build` |
| Go | `go.mod` | `go build ./...` |
| Rust | `Cargo.toml` | `cargo build` |
| C++ | `CMakeLists.txt` | `cmake --build build` |
| C++ | `Makefile` | `make` |

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
3. 调用 `/dev` 修复代码
4. 重新构建验证
