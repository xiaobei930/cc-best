# Swift 并发专家指南

## 概述

在 Swift 6.2+ 代码库中审查和修复 Swift 并发问题，通过应用 actor 隔离、Sendable 安全和现代并发模式，以最小的行为变更实现数据竞争安全。

## 工作流程

### 1. 问题分类

- 捕获准确的编译器诊断和问题符号
- 识别当前的 actor 上下文（`@MainActor`、`actor`、`nonisolated`）
- 确认代码是 UI 绑定还是需要后台运行

### 2. 应用最小安全修复

优先选择保持现有行为同时满足数据竞争安全的编辑。

**常见修复：**

| 场景                    | 修复方案                                                                   |
| ----------------------- | -------------------------------------------------------------------------- |
| UI 绑定类型             | 使用 `@MainActor` 标注类型或相关成员                                       |
| 主 actor 类型的协议遵循 | 使协议遵循隔离（如 `extension Foo: @MainActor SomeProtocol`）              |
| 全局/静态状态           | 用 `@MainActor` 保护或移入 actor                                           |
| 后台工作                | 移到 `nonisolated` 类型的 `@concurrent` 异步函数或使用 actor 保护可变状态  |
| Sendable 错误           | 优先使用不可变/值类型；只在正确时添加 Sendable；避免 `@unchecked Sendable` |

## 代码示例

### UI 绑定类型

```swift
// ❌ 问题：跨 actor 访问
class ViewModel: ObservableObject {
    @Published var items: [Item] = []

    func loadItems() async {
        items = await fetchItems() // 警告：跨 actor 访问
    }
}

// ✅ 修复：标注 @MainActor
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [Item] = []

    func loadItems() async {
        items = await fetchItems()
    }
}
```

### 协议遵循

```swift
// ❌ 问题：非隔离协议实现
@MainActor
class MyDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
        // 警告：非隔离实例方法不能满足主 actor 隔离协议要求
    }
}

// ✅ 修复：隔离协议遵循
@MainActor
class MyDelegate: NSObject {
    // 其他代码
}

extension MyDelegate: @MainActor URLSessionDelegate {
    func urlSession(_ session: URLSession, didBecomeInvalidWithError error: Error?) {
        // 正确隔离
    }
}
```

### 后台工作

```swift
// ❌ 问题：在主 actor 上执行耗时操作
@MainActor
class ImageProcessor {
    func process(_ image: UIImage) -> UIImage {
        // 耗时图像处理...
        return processedImage
    }
}

// ✅ 修复：移到后台
@MainActor
class ImageProcessor {
    func process(_ image: UIImage) async -> UIImage {
        await Task.detached(priority: .userInitiated) {
            // 后台处理
            return self.processImage(image)
        }.value
    }

    nonisolated private func processImage(_ image: UIImage) -> UIImage {
        // 耗时图像处理...
        return processedImage
    }
}
```

### Sendable 遵循

```swift
// ❌ 问题：不安全的 Sendable
class Config: @unchecked Sendable {
    var apiKey: String = ""  // 可变状态，不安全
}

// ✅ 修复：使用值类型或不可变
struct Config: Sendable {
    let apiKey: String
}

// 或使用 actor
actor ConfigStore {
    var apiKey: String = ""

    func setApiKey(_ key: String) {
        apiKey = key
    }
}
```

## 最佳实践

### DO ✅

- 优先使用 `@MainActor` 标注 UI 相关类型
- 使用 `actor` 保护共享可变状态
- 使用 `Task.detached` 执行后台工作
- 优先使用值类型实现 `Sendable`

### DON'T ❌

- 避免 `@unchecked Sendable`（除非能证明线程安全）
- 不要在 `nonisolated` 函数中访问 actor 隔离状态
- 不要在主线程执行耗时操作
- 不要过度使用 `MainActor.assumeIsolated`

## 常见编译器错误

| 错误                                             | 原因                   | 修复                         |
| ------------------------------------------------ | ---------------------- | ---------------------------- |
| `cannot access from different actor`             | 跨 actor 边界访问      | 添加 `await` 或重新设计隔离  |
| `sending value risks data race`                  | 非 Sendable 类型跨边界 | 使类型 Sendable 或使用 actor |
| `main actor-isolated cannot satisfy nonisolated` | 协议遵循冲突           | 使用隔离协议扩展             |

## 工具和调试

```bash
# 启用严格并发检查
# 在 Build Settings 中设置:
# SWIFT_STRICT_CONCURRENCY = complete

# 使用 Thread Sanitizer 检测数据竞争
# Edit Scheme → Run → Diagnostics → Thread Sanitizer ✓

# 使用 xctrace 分析并发问题
xctrace record --template 'Thread States' --launch MyApp.app
```
