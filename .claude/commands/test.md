---
allowed-tools: Read, Glob, Grep, Bash
---

# /test - 运行测试

运行项目测试套件。

## 自动检测

根据项目类型自动选择测试命令：

| 项目类型 | 检测文件 | 测试命令 |
|----------|----------|----------|
| Python | `pytest.ini`, `pyproject.toml` | `pytest` |
| Node.js | `package.json` | `npm test` |
| Java Maven | `pom.xml` | `mvn test` |
| Java Gradle | `build.gradle` | `gradle test` |
| .NET | `*.csproj`, `*.sln` | `dotnet test` |
| Go | `go.mod` | `go test ./...` |
| Rust | `Cargo.toml` | `cargo test` |

## 常用选项

### Python (pytest)
```bash
pytest                      # 运行所有测试
pytest tests/unit/          # 运行指定目录
pytest -v                   # 详细输出
pytest --lf                 # 只运行上次失败的
pytest -k "test_user"       # 按名称过滤
pytest --cov=src            # 覆盖率报告
```

### Node.js
```bash
npm test                    # 运行所有测试
npm test -- --watch         # 监听模式
npm test -- --coverage      # 覆盖率
npm test -- --grep "user"   # 按名称过滤
```

### Java
```bash
mvn test                              # Maven
mvn test -Dtest=UserServiceTest       # 指定类
gradle test                           # Gradle
gradle test --tests "UserServiceTest" # 指定类
```

### .NET
```bash
dotnet test                                    # 运行所有测试
dotnet test --filter "FullyQualifiedName~User" # 过滤
dotnet test --collect:"XPlat Code Coverage"    # 覆盖率
```

## 执行流程

```
1. 检测项目类型
   └─ 查找配置文件

2. 运行测试
   └─ 执行对应的测试命令

3. 报告结果
   └─ 显示通过/失败数量
   └─ 显示失败详情
```

## 失败处理

如果测试失败：
1. 分析失败原因
2. 如果是代码问题，调用 `/dev` 修复
3. 如果是测试问题，更新测试用例
4. 重新运行测试验证
