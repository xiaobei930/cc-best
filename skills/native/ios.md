# iOS/macOS 原生开发

## 概述

本文档涵盖 iOS/macOS 原生应用开发的核心知识：

- Swift 6.x 并发模式
- SwiftUI 性能优化
- UIKit 最佳实践
- Xcode 项目配置

## 相关文件

- [swift-concurrency.md](swift-concurrency.md) - Swift 并发专家指南
- [swiftui-performance.md](swiftui-performance.md) - SwiftUI 性能审计

## 快速参考

### Swift 版本要求

- **Swift 6.2+**: 完整并发安全
- **iOS 17+**: 最新 SwiftUI 特性
- **Xcode 16+**: 推荐开发环境

### 常用命令

```bash
# 构建项目
xcodebuild -scheme MyApp -sdk iphoneos build

# 运行测试
xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15'

# 性能分析
xctrace record --template 'Time Profiler' --launch MyApp.app

# SwiftLint 检查
swiftlint lint --strict
```

### 项目结构推荐

```
MyApp/
├── App/
│   ├── MyApp.swift           # App 入口
│   └── ContentView.swift     # 主视图
├── Features/
│   ├── Auth/                 # 功能模块
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   └── Models/
│   └── Home/
├── Core/
│   ├── Network/              # 网络层
│   ├── Storage/              # 存储层
│   └── Extensions/           # 扩展
├── Resources/
│   ├── Assets.xcassets
│   └── Localizable.strings
└── Tests/
```

## SwiftUI 开发

### 视图组合

```swift
// 推荐：小而专一的视图
struct UserProfileView: View {
    let user: User

    var body: some View {
        VStack {
            AvatarView(url: user.avatarURL)
            UserInfoSection(user: user)
            ActionButtons(userId: user.id)
        }
    }
}
```

### 状态管理

```swift
// @Observable (iOS 17+)
@Observable
class UserViewModel {
    var user: User?
    var isLoading = false

    func loadUser() async {
        isLoading = true
        defer { isLoading = false }
        user = try? await api.fetchUser()
    }
}

// 在视图中使用
struct UserView: View {
    @State private var viewModel = UserViewModel()

    var body: some View {
        // ...
    }
}
```

## UIKit 集成

### SwiftUI 中使用 UIKit

```swift
struct UIKitMapView: UIViewRepresentable {
    @Binding var region: MKCoordinateRegion

    func makeUIView(context: Context) -> MKMapView {
        MKMapView()
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {
        uiView.setRegion(region, animated: true)
    }
}
```

### UIKit 中使用 SwiftUI

```swift
class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let swiftUIView = ContentView()
        let hostingController = UIHostingController(rootView: swiftUIView)

        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)
    }
}
```

## 网络层

### 基础请求

```swift
actor APIClient {
    private let session: URLSession
    private let decoder = JSONDecoder()

    init(session: URLSession = .shared) {
        self.session = session
    }

    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let (data, response) = try await session.data(for: endpoint.request)

        guard let httpResponse = response as? HTTPURLResponse,
              200..<300 ~= httpResponse.statusCode else {
            throw APIError.invalidResponse
        }

        return try decoder.decode(T.self, from: data)
    }
}
```

## 最佳实践

### DO ✅

- 使用 `@MainActor` 标注 UI 相关代码
- 使用 `actor` 保护共享状态
- 优先使用值类型（struct）
- 使用 `async/await` 处理异步操作
- 遵循 MVVM 架构

### DON'T ❌

- 在主线程执行耗时操作
- 使用强制解包（!）除非确定安全
- 忽略内存循环引用
- 过度使用单例模式
