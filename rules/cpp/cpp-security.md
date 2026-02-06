---
paths:
  - "**/*"
alwaysApply: true
---

# C++ 安全编码规范 | C++ Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供 C++ 特定安全规范

## 禁止操作

```cpp
// ❌ 使用裸 new/delete 管理资源（异常时内存泄漏）
Widget* w = new Widget();
process(w);  // 如果抛出异常，内存泄漏
delete w;

// ❌ 使用 C 风格数组和指针运算（缓冲区溢出风险）
void process(int* data, int size) {
    for (int i = 0; i <= size; i++) data[i] *= 2;  // off-by-one
}

// ❌ 使用 sprintf/strcpy 等不安全 C 字符串函数
char buf[64];
sprintf(buf, "Hello %s", user_input);  // 缓冲区溢出
```

## 必须遵守

### RAII 资源管理

```cpp
// ✅ 所有资源通过 RAII 包装，作用域结束自动释放
class FileHandle {
public:
    explicit FileHandle(const std::string& path)
        : handle_(fopen(path.c_str(), "r")) {
        if (!handle_) throw std::runtime_error("无法打开文件");
    }
    ~FileHandle() { if (handle_) fclose(handle_); }
    FileHandle(const FileHandle&) = delete;
    FileHandle(FileHandle&& o) noexcept : handle_(std::exchange(o.handle_, nullptr)) {}
    FILE* get() const { return handle_; }
private:
    FILE* handle_;
};

// ✅ std::scoped_lock 管理互斥锁（自动加锁/释放）
{ std::scoped_lock lock(mutex_a, mutex_b); shared_data.push_back(value); }
```

### 智能指针使用规范（unique_ptr 优先）

```cpp
// ✅ 独占所有权用 unique_ptr（零开销），共享所有权才用 shared_ptr
auto processor = std::make_unique<AudioProcessor>(sample_rate);
auto cache = std::make_shared<SessionCache>();  // 确实需要多方持有时

// ✅ weak_ptr 打破循环引用
class Observer {
    std::weak_ptr<Subject> subject_;
public:
    void Notify() { if (auto s = subject_.lock()) s->Update(); }
};

// ❌ 避免从裸指针构造 shared_ptr，避免 shared_ptr<T>(new T)
std::shared_ptr<Widget> w(new Widget());  // 两次内存分配，应使用 make_shared
```

### 缓冲区溢出防护（std::array / std::span）

```cpp
// ✅ std::array 替代 C 数组，at() 带边界检查
std::array<uint8_t, 256> buffer{};
buffer.at(index) = value;

// ✅ std::span 传递数组视图（C++20），类型安全无拷贝
void ProcessSamples(std::span<const float> samples) {
    for (float s : samples) output_.Push(s * gain_);
}

// ✅ std::string_view 替代 const char*
void LogMessage(std::string_view msg) { fmt::print("[LOG] {}\n", msg); }
```

### 整数溢出检测

```cpp
// ✅ 手动检查溢出或使用安全运算
template<typename T>
std::optional<T> SafeAdd(T a, T b) {
    if (b > 0 && a > std::numeric_limits<T>::max() - b) return std::nullopt;
    if (b < 0 && a < std::numeric_limits<T>::min() - b) return std::nullopt;
    return a + b;
}
```

## 推荐做法

### 静态分析工具（clang-tidy / cppcheck）

```yaml
# ✅ .clang-tidy 启用安全相关检查
Checks: "bugprone-*,cppcoreguidelines-*,modernize-*,-modernize-use-trailing-return-type"
WarningsAsErrors: "bugprone-use-after-move,cppcoreguidelines-owning-memory"
```

```bash
clang-tidy src/*.cpp -- -std=c++20 -I include/
cppcheck --enable=all --error-exitcode=1 src/
```

### 安全编译选项

```cmake
# ✅ 启用安全编译选项和链接保护
target_compile_options(${PROJECT_NAME} PRIVATE
    -Wall -Wextra -Wpedantic -Werror=return-type
    -Wconversion -Wsign-conversion          # 隐式转换警告
    -fstack-protector-strong                 # 栈溢出保护
    -D_FORTIFY_SOURCE=2)                     # glibc 安全检查
target_link_options(${PROJECT_NAME} PRIVATE
    -Wl,-z,relro,-z,now -pie)               # RELRO + ASLR
```

### 内存安全编码模式

```cpp
// ✅ 工厂函数返回 unique_ptr，封装构造细节
static std::unique_ptr<Connection> Create(const Config& cfg) {
    auto conn = std::unique_ptr<Connection>(new Connection(cfg));
    conn->Initialize();  // 失败时自动释放
    return conn;
}

// ✅ std::variant 替代 union（类型安全）
using ParseResult = std::variant<int, double, std::string, ParseError>;
std::visit([](auto&& val) { Process(val); }, Parse(input));
```
