---
paths:
  - "**/*"
alwaysApply: true
---

# C++ 性能优化规范 | C++ Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供 C++ 特定性能优化规范

## 禁止操作

```cpp
// ❌ 热路径中使用虚函数（vtable 间接调用 + 阻止内联）
class Shape { virtual double Area() const = 0; };
for (auto& s : shapes) total += s->Area();  // 每次循环 vtable 查表

// ❌ 按值传递大对象（不必要的拷贝）
void ProcessData(std::vector<float> data) { /* 拷贝整个 vector */ }

// ❌ AoS 布局导致缓存行浪费
struct Particle { float x, y, z, vx, vy, vz; int type; bool active; };
std::vector<Particle> particles;  // 只访问位置时也加载 vel/flags
```

## 必须遵守

### 移动语义优化（std::move / 完美转发）

```cpp
// ✅ 函数返回局部对象，依靠 NRVO 或隐式 move 实现零拷贝
std::vector<float> GenerateSamples(size_t count) {
    std::vector<float> result(count);
    /* 填充数据 */
    return result;
}

// ✅ 完美转发保留值类别，避免不必要的拷贝
template<typename... Args>
auto MakeWidget(Args&&... args) {
    return std::make_unique<Widget>(std::forward<Args>(args)...);
}

// ✅ sink 参数按值传递 + move（接收所有权时）
void Register(std::string name, Handler handler) {
    entries_.emplace(std::move(name), std::move(handler));
}
```

### 编译期计算（constexpr / consteval）

```cpp
// ✅ constexpr 将计算移至编译期
constexpr size_t HashTableSize(size_t n) {
    size_t s = 1;
    while (s < n * 4 / 3) s <<= 1;
    return s;
}
static constexpr size_t kBuckets = HashTableSize(1024);

// ✅ consteval 强制编译期求值（C++20）
consteval uint32_t FNV1a(std::string_view str) {
    uint32_t h = 2166136261u;
    for (char c : str) { h ^= static_cast<uint32_t>(c); h *= 16777619u; }
    return h;
}

// ✅ if constexpr 零开销分支选择
template<typename T>
void Serialize(const T& val, Buffer& buf) {
    if constexpr (std::is_trivially_copyable_v<T>) buf.Write(&val, sizeof(T));
    else val.SerializeTo(buf);
}
```

### 缓存友好数据布局（SoA vs AoS）

```cpp
// ✅ SoA 布局：按字段分离存储，缓存行利用率接近 100%
struct ParticleSystem {
    std::vector<float> pos_x, pos_y, pos_z;
    std::vector<float> vel_x, vel_y, vel_z;
    void UpdatePositions(float dt) {
        for (size_t i = 0; i < pos_x.size(); ++i) {
            pos_x[i] += vel_x[i] * dt;
            pos_y[i] += vel_y[i] * dt;
            pos_z[i] += vel_z[i] * dt;
        }
    }
};
```

## 推荐做法

### SIMD 指令优化（SSE / AVX）

```cpp
// ✅ AVX intrinsics 加速向量运算，处理尾部标量
#include <immintrin.h>
void AddArrays(const float* a, const float* b, float* out, size_t n) {
    size_t i = 0;
    for (; i + 8 <= n; i += 8) {
        __m256 va = _mm256_loadu_ps(a + i);
        __m256 vb = _mm256_loadu_ps(b + i);
        _mm256_storeu_ps(out + i, _mm256_add_ps(va, vb));
    }
    for (; i < n; ++i) out[i] = a[i] + b[i];
}
alignas(32) float aligned_buf[1024];  // 对齐以获最佳 SIMD 性能
```

### 避免虚函数开销（CRTP 编译期多态）

```cpp
// ✅ CRTP 消除 vtable 开销，编译器完全内联
template<typename Derived>
class ShapeBase {
public:
    double Area() const { return static_cast<const Derived*>(this)->AreaImpl(); }
};
class Circle : public ShapeBase<Circle> {
    double r_;
public:
    explicit Circle(double r) : r_(r) {}
    double AreaImpl() const { return 3.14159265 * r_ * r_; }
};
```

### 内存分配器（Arena / Pool）

```cpp
// ✅ Arena 分配器：批量分配，统一释放，减少 malloc 开销
class ArenaAllocator {
    std::vector<std::unique_ptr<char[]>> blocks_;
    char* cur_ = nullptr; size_t remain_ = 0;
    static constexpr size_t kBlock = 64 * 1024;
public:
    void* Allocate(size_t size) {
        if (size > remain_) {
            blocks_.push_back(std::make_unique<char[]>(std::max(kBlock, size)));
            cur_ = blocks_.back().get(); remain_ = std::max(kBlock, size);
        }
        void* p = cur_; cur_ += size; remain_ -= size; return p;
    }
    void Reset() { blocks_.clear(); cur_ = nullptr; remain_ = 0; }
};
// 每帧临时分配，帧结束统一释放
auto* node = new (arena.Allocate(sizeof(SceneNode))) SceneNode(params);
```

### Profile-Guided Optimization（PGO）

```bash
# ✅ PGO 三步流程：插桩 → 收集 profile → 优化重建
g++ -O2 -fprofile-generate=./pgo -o app_instr src/*.cpp  # 插桩构建
./app_instr --benchmark workload.dat                       # 收集 profile
g++ -O2 -fprofile-use=./pgo -o app_opt src/*.cpp          # 优化构建（提升 10-30%）
```
