# SwiftUI 性能审计

## 概述

端到端审计 SwiftUI 视图性能，从检测和基线建立到根因分析和具体修复步骤。

## 工作流程决策树

1. **有代码** → 从"代码优先审查"开始
2. **仅有症状描述** → 请求最小代码/上下文，然后进行代码审查
3. **代码审查不足** → 引导用户进行 Instruments 分析

## 1. 代码优先审查

### 收集信息

- 目标视图/功能代码
- 数据流：state、environment、observable models
- 症状和重现步骤

### 关注点

| 问题 | 症状 |
|------|------|
| 视图失效风暴 | 界面卡顿、CPU 飙高 |
| 不稳定的 identity | 列表滚动卡顿 |
| body 中的重计算 | 渲染延迟 |
| 布局抖动 | 界面闪烁 |
| 大图片未压缩 | 内存飙高 |
| 过度动画 | 动画不流畅 |

## 2. 常见代码异味（及修复）

### body 中创建昂贵对象

```swift
// ❌ 问题：每次渲染都创建 Formatter
var body: some View {
    let formatter = NumberFormatter()  // 昂贵
    let measureFormatter = MeasurementFormatter()  // 昂贵
    Text(measureFormatter.string(from: .init(value: meters, unit: .meters)))
}

// ✅ 修复：缓存 Formatter
final class DistanceFormatter {
    static let shared = DistanceFormatter()
    let number = NumberFormatter()
    let measure = MeasurementFormatter()
}

var body: some View {
    Text(DistanceFormatter.shared.measure.string(from: .init(value: meters, unit: .meters)))
}
```

### 计算属性做重活

```swift
// ❌ 问题：每次 body 求值都运行
var filtered: [Item] {
    items.filter { $0.isEnabled }
}

// ✅ 修复：预计算或在变化时缓存
@State private var filtered: [Item] = []

func updateFiltered() {
    filtered = items.filter { $0.isEnabled }
}
```

### ForEach 中排序/过滤

```swift
// ❌ 问题：每次渲染都排序
List {
    ForEach(items.sorted(by: sortRule)) { item in
        Row(item)
    }
}

// ✅ 修复：预排序
let sortedItems = items.sorted(by: sortRule)

List {
    ForEach(sortedItems) { item in
        Row(item)
    }
}
```

### 不稳定的 identity

```swift
// ❌ 问题：使用 \.self 作为 id
ForEach(items, id: \.self) { item in
    Row(item)
}

// ❌ 问题：每次渲染生成新 UUID
ForEach(items, id: \.randomID) { item in  // randomID = UUID()
    Row(item)
}

// ✅ 修复：使用稳定的 ID
struct Item: Identifiable {
    let id: UUID  // 创建时固定
    var name: String
}

ForEach(items) { item in
    Row(item)
}
```

### 主线程图片解码

```swift
// ❌ 问题：主线程解码
Image(uiImage: UIImage(data: data)!)

// ✅ 修复：后台解码 + 缓存
@State private var decodedImage: UIImage?

.task {
    decodedImage = await decodeImageInBackground(data)
}

if let image = decodedImage {
    Image(uiImage: image)
}
```

### Observable 依赖过宽

```swift
// ❌ 问题：任何 items 变化都触发更新
@Observable class Model {
    var items: [Item] = []
}

var body: some View {
    Row(isFavorite: model.items.contains(item))
}

// ✅ 修复：细粒度视图模型
@Observable class ItemViewModel {
    let item: Item
    var isFavorite: Bool
}

var body: some View {
    Row(viewModel: itemViewModel)
}
```

## 3. 性能分析指导

### 使用 Instruments

```bash
# 1. 使用 Release 构建
# 2. 打开 Instruments
# 3. 选择 SwiftUI 模板
# 4. 重现问题场景
# 5. 分析 SwiftUI 时间线 + Time Profiler
```

### 需要的数据

- Trace 导出或截图
- SwiftUI lanes + Time Profiler 调用树
- 设备/OS/构建配置

## 4. 修复策略

| 问题 | 修复方案 |
|------|----------|
| 状态范围过宽 | 将 `@State`/`@Observable` 移到叶子视图 |
| identity 不稳定 | 使用稳定的 `Identifiable` ID |
| body 中的重计算 | 预计算、缓存、使用 `@State` |
| 昂贵子树 | 使用 `equatable()` 或值包装器 |
| 大图片 | 渲染前降采样 |
| 布局复杂 | 简化布局或使用固定尺寸 |

## 5. 验证

让用户重新运行相同的捕获并与基线指标比较：
- CPU 使用率
- 掉帧数
- 内存峰值

## 工具命令

```bash
# 使用 xctrace 记录
xctrace record --template 'SwiftUI' --launch MyApp.app --output trace.trace

# 导出时间线
xctrace export --input trace.trace --output timeline.xml

# 分析符号
xctrace symbolicate --input trace.trace
```

## 参考资料

- [Demystify SwiftUI performance (WWDC23)](https://developer.apple.com/videos/play/wwdc2023/10160/)
- [Understanding and improving SwiftUI performance](https://developer.apple.com/documentation/swiftui/performance)
- [Optimizing SwiftUI performance with Instruments](https://developer.apple.com/documentation/xcode/improving-your-app-s-performance)
