---
paths:
  - "**/*"
alwaysApply: true
---

# C++ 测试规范 | C++ Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供 C++ 特定测试规范

## 禁止操作

```cpp
// ❌ 测试中使用 sleep 等待异步结果
TEST(NetworkTest, FetchData) {
    auto future = client.FetchAsync("/api/data");
    std::this_thread::sleep_for(std::chrono::seconds(3));
    EXPECT_TRUE(future.get().ok());
}

// ❌ 测试之间共享可变全局状态
static std::vector<int> g_shared_data;
TEST(DataTest, AddItem) { g_shared_data.push_back(1); }
TEST(DataTest, CheckSize) { EXPECT_EQ(g_shared_data.size(), 1); }  // 依赖执行顺序
```

## 必须遵守

### Google Test 框架（TEST / TEST_F / TEST_P）

```cpp
// ✅ 使用 TEST_F 共享 fixture，SetUp/TearDown 管理资源
class DatabaseTest : public ::testing::Test {
protected:
    void SetUp() override {
        db_ = std::make_unique<Database>(":memory:");
        db_->Execute("CREATE TABLE users (id INT, name TEXT)");
    }
    std::unique_ptr<Database> db_;
};

TEST_F(DatabaseTest, InsertAndQueryReturnsCorrectRow) {
    db_->Execute("INSERT INTO users VALUES (1, 'Alice')");
    auto row = db_->QueryOne("SELECT name FROM users WHERE id = 1");
    EXPECT_EQ(row.GetString("name"), "Alice");
}

// ✅ TEST_P 参数化测试：EXPECT_* 失败后继续，ASSERT_* 失败后停止
class PrimeTest : public ::testing::TestWithParam<std::pair<int, bool>> {};
TEST_P(PrimeTest, CheckPrimality) {
    auto [value, expected] = GetParam();
    EXPECT_EQ(IsPrime(value), expected);
}
INSTANTIATE_TEST_SUITE_P(Values, PrimeTest, ::testing::Values(
    std::make_pair(2, true), std::make_pair(4, false),
    std::make_pair(17, true), std::make_pair(100, false)));
```

### Google Mock（MOCK_METHOD / EXPECT_CALL）

```cpp
// ✅ 使用 MOCK_METHOD 定义 Mock，EXPECT_CALL 验证交互
class MockHttpClient : public HttpClient {
public:
    MOCK_METHOD(Response, Get, (const std::string& url), (override));
    MOCK_METHOD(Response, Post, (const std::string& url, const Json& body), (override));
};

TEST_F(ServiceTest, FetchUserCallsCorrectEndpoint) {
    MockHttpClient mock_client;
    UserService service(&mock_client);
    EXPECT_CALL(mock_client, Get("/api/users/42"))
        .WillOnce(::testing::Return(Response{200, R"({"name":"Alice"})"}));
    auto user = service.FetchUser(42);
    EXPECT_EQ(user.name, "Alice");
}
```

## 推荐做法

### Sanitizer 集成（ASan / TSan / UBSan）

```cmake
# ✅ CMakeLists.txt 中定义 Sanitizer 选项
option(ENABLE_ASAN "启用 AddressSanitizer" OFF)
option(ENABLE_TSAN "启用 ThreadSanitizer" OFF)
if(ENABLE_ASAN)
    add_compile_options(-fsanitize=address -fno-omit-frame-pointer)
    add_link_options(-fsanitize=address)
endif()
```

```bash
# CI 中分别运行各 Sanitizer 构建
cmake -B build-asan -DENABLE_ASAN=ON && cmake --build build-asan && ctest --test-dir build-asan
cmake -B build-tsan -DENABLE_TSAN=ON && cmake --build build-tsan && ctest --test-dir build-tsan
```

### Fuzzing 测试（libFuzzer）

```cpp
// ✅ 为解析器编写 fuzz target，覆盖异常输入
extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
    try {
        JsonParser parser;
        parser.Parse({reinterpret_cast<const char*>(data), size});
    } catch (const ParseError&) { /* 解析失败可接受 */ }
    return 0;
}
```

### 代码覆盖率（gcov / lcov）

```bash
# ✅ 生成覆盖率报告并过滤第三方代码
cmake -B build-cov -DCMAKE_CXX_FLAGS="--coverage" && cmake --build build-cov
ctest --test-dir build-cov
lcov --capture --directory build-cov --output-file coverage.info
lcov --remove coverage.info '/usr/*' '*/third_party/*' -o filtered.info
genhtml filtered.info --output-directory coverage_report
```

### CTest 集成与标签过滤

```cmake
# ✅ 注册测试到 CTest，支持按标签运行
enable_testing()
add_executable(unit_tests tests/parser_test.cpp tests/codec_test.cpp)
target_link_libraries(unit_tests PRIVATE GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(unit_tests PROPERTIES LABELS "unit")
```

```bash
ctest --test-dir build -L unit        # 仅单元测试
ctest --test-dir build -L integration # 仅集成测试
ctest --test-dir build --parallel 8   # 并行执行
```
