# 前端性能优化模式

Core Web Vitals 优化指南，提升页面体验和搜索排名。

## Core Web Vitals 三大指标

| 指标    | 测量内容   | 良好    | 需改进        | 差      |
| ------- | ---------- | ------- | ------------- | ------- |
| **LCP** | 加载性能   | ≤ 2.5s  | 2.5s – 4s     | > 4s    |
| **INP** | 交互响应   | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** | 视觉稳定性 | ≤ 0.1   | 0.1 – 0.25    | > 0.25  |

> Google 以 **75 分位**测量 — 75% 的页面访问需达到"良好"标准。

---

## LCP: 最大内容绘制

LCP 测量最大可见内容元素的渲染时间，通常是：

- Hero 图片或视频
- 大文本块
- 背景图片
- `<svg>` 元素

### LCP 常见问题及修复

**1. 服务器响应慢 (TTFB > 800ms)**

```
修复方案:
├─ 使用 CDN
├─ 页面缓存
├─ 后端优化
└─ 边缘渲染 (Edge SSR)
```

**2. 渲染阻塞资源**

```html
<!-- ❌ 阻塞渲染 -->
<link rel="stylesheet" href="/all-styles.css" />

<!-- ✅ 关键 CSS 内联，其余延迟加载 -->
<style>
  /* 首屏关键 CSS */
</style>
<link
  rel="preload"
  href="/styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

**3. 资源加载慢**

```html
<!-- ❌ 无提示，发现晚 -->
<img src="/hero.jpg" alt="Hero" />

<!-- ✅ 预加载 + 高优先级 -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high" />
<img src="/hero.webp" alt="Hero" fetchpriority="high" />
```

**4. 客户端渲染延迟**

```javascript
// ❌ 内容在 JS 加载后才出现
useEffect(() => {
  fetch("/api/hero-text")
    .then((r) => r.json())
    .then(setHeroText);
}, []);

// ✅ 服务端渲染或静态生成
// Next.js 示例
export async function getServerSideProps() {
  const heroText = await fetchHeroText();
  return { props: { heroText } };
}
```

### LCP 优化清单

- [ ] TTFB < 800ms（使用 CDN、边缘缓存）
- [ ] LCP 图片已预加载且设置 `fetchpriority="high"`
- [ ] LCP 图片已优化（WebP/AVIF、正确尺寸）
- [ ] 关键 CSS 已内联（< 14KB）
- [ ] `<head>` 中无渲染阻塞 JavaScript
- [ ] 字体不阻塞文本渲染（`font-display: swap`）
- [ ] LCP 元素在初始 HTML 中（非 JS 渲染）

### 识别 LCP 元素

```javascript
// 查找页面的 LCP 元素
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log("LCP 元素:", lastEntry.element);
  console.log("LCP 时间:", lastEntry.startTime);
}).observe({ type: "largest-contentful-paint", buffered: true });
```

---

## INP: 交互到下一帧绘制

INP 测量整个页面访问期间所有交互（点击、轻触、按键）的响应性，报告最差交互（高流量页面取 98 分位）。

### INP 时间组成

```
总 INP = 输入延迟 + 处理时间 + 呈现延迟

┌────────────────┬────────────┬──────────────┐
│   输入延迟     │  处理时间   │   呈现延迟   │
│   < 50ms       │  < 100ms   │   < 50ms     │
└────────────────┴────────────┴──────────────┘
```

| 阶段     | 目标    | 优化方向       |
| -------- | ------- | -------------- |
| 输入延迟 | < 50ms  | 减少主线程阻塞 |
| 处理时间 | < 100ms | 优化事件处理器 |
| 呈现延迟 | < 50ms  | 最小化渲染工作 |

### INP 常见问题及修复

**1. 长任务阻塞主线程**

```javascript
// ❌ 长时间同步任务
function processLargeArray(items) {
  items.forEach((item) => expensiveOperation(item));
}

// ✅ 分块处理 + 让出主线程
async function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    chunk.forEach((item) => expensiveOperation(item));

    // 让出主线程
    await new Promise((r) => setTimeout(r, 0));
    // 或使用 scheduler.yield()（如可用）
  }
}
```

**2. 事件处理器过重**

```javascript
// ❌ 所有工作都在处理器中
button.addEventListener("click", () => {
  const result = calculateComplexThing(); // 重计算
  updateUI(result); // DOM 更新
  trackEvent("click"); // 分析
});

// ✅ 优先视觉反馈
button.addEventListener("click", () => {
  // 立即视觉反馈
  button.classList.add("loading");

  // 延迟非关键工作
  requestAnimationFrame(() => {
    const result = calculateComplexThing();
    updateUI(result);
  });

  // 空闲时执行分析
  requestIdleCallback(() => trackEvent("click"));
});
```

**3. 第三方脚本**

```javascript
// ❌ 立即加载，阻塞交互
<script src="https://heavy-widget.com/widget.js"></script>;

// ✅ 交互或可见时懒加载
const loadWidget = () => {
  import("https://heavy-widget.com/widget.js").then((widget) => widget.init());
};
button.addEventListener("click", loadWidget, { once: true });
```

**4. 过度重渲染（React/Vue）**

```javascript
// ❌ 重渲染整棵树
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Counter count={count} />
      <ExpensiveComponent /> {/* 每次 count 变化都重渲染 */}
    </div>
  );
}

// ✅ 记忆化昂贵组件
const MemoizedExpensive = React.memo(ExpensiveComponent);

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Counter count={count} />
      <MemoizedExpensive />
    </div>
  );
}
```

### INP 优化清单

- [ ] 主线程无 > 50ms 的任务
- [ ] 事件处理器快速完成（< 100ms）
- [ ] 交互后立即提供视觉反馈
- [ ] 重任务使用 `requestIdleCallback` 延迟
- [ ] 第三方脚本不阻塞交互
- [ ] 输入处理器适当防抖
- [ ] CPU 密集操作使用 Web Workers

### INP 调试

```javascript
// 识别慢交互
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 200) {
      console.warn("慢交互:", {
        type: entry.name,
        duration: entry.duration,
        processingStart: entry.processingStart,
        processingEnd: entry.processingEnd,
        target: entry.target,
      });
    }
  }
}).observe({ type: "event", buffered: true, durationThreshold: 16 });
```

---

## CLS: 累积布局偏移

CLS 测量意外的布局偏移。当可见元素在帧之间改变位置（非用户交互触发）时发生偏移。

**CLS 公式**: `影响区域比例 × 移动距离比例`

### CLS 常见原因及修复

**1. 图片无尺寸**

```html
<!-- ❌ 加载时导致布局偏移 -->
<img src="photo.jpg" alt="照片" />

<!-- ✅ 预留空间 -->
<img src="photo.jpg" alt="照片" width="800" height="600" />

<!-- ✅ 或使用 aspect-ratio -->
<img src="photo.jpg" alt="照片" style="aspect-ratio: 4/3; width: 100%;" />
```

**2. 广告、嵌入、iframe**

```html
<!-- ❌ 加载前尺寸未知 -->
<iframe src="https://ad-network.com/ad"></iframe>

<!-- ✅ 使用 min-height 预留空间 -->
<div style="min-height: 250px;">
  <iframe src="https://ad-network.com/ad" height="250"></iframe>
</div>

<!-- ✅ 或使用 aspect-ratio 容器 -->
<div style="aspect-ratio: 16/9;">
  <iframe
    src="https://youtube.com/embed/..."
    style="width: 100%; height: 100%;"
  ></iframe>
</div>
```

**3. 动态插入内容**

```javascript
// ❌ 在视口上方插入内容
notifications.prepend(newNotification);

// ✅ 在视口下方插入，或使用 transform
const insertBelow = viewport.bottom < newNotification.top;
if (insertBelow) {
  notifications.prepend(newNotification);
} else {
  // 使用动画入场，不产生偏移
  newNotification.style.transform = "translateY(-100%)";
  notifications.prepend(newNotification);
  requestAnimationFrame(() => {
    newNotification.style.transform = "";
  });
}
```

**4. 字体导致 FOUT**

```css
/* ❌ 字体切换导致文本偏移 */
@font-face {
  font-family: "Custom";
  src: url("custom.woff2") format("woff2");
}

/* ✅ 可选字体（慢时不切换） */
@font-face {
  font-family: "Custom";
  src: url("custom.woff2") format("woff2");
  font-display: optional;
}

/* ✅ 或匹配回退字体尺寸 */
@font-face {
  font-family: "Custom";
  src: url("custom.woff2") format("woff2");
  font-display: swap;
  size-adjust: 105%; /* 匹配回退字体尺寸 */
  ascent-override: 95%;
  descent-override: 20%;
}
```

**5. 触发布局的动画**

```css
/* ❌ 动画布局属性 */
.animate {
  transition:
    height 0.3s,
    width 0.3s;
}

/* ✅ 使用 transform 替代 */
.animate {
  transition: transform 0.3s;
}
.animate.expanded {
  transform: scale(1.2);
}
```

### CLS 优化清单

- [ ] 所有图片有 width/height 或 aspect-ratio
- [ ] 所有视频/嵌入有预留空间
- [ ] 广告有 min-height 容器
- [ ] 字体使用 `font-display: optional` 或匹配尺寸
- [ ] 动态内容插入在视口下方
- [ ] 动画仅使用 transform/opacity
- [ ] 不在现有内容上方插入内容

### CLS 调试

```javascript
// 追踪布局偏移
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log("布局偏移:", entry.value);
      entry.sources?.forEach((source) => {
        console.log("  偏移元素:", source.node);
        console.log("  原位置:", source.previousRect);
        console.log("  新位置:", source.currentRect);
      });
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

---

## 框架专项优化

### Next.js

```jsx
// LCP: 使用 next/image + priority
import Image from "next/image";
<Image src="/hero.jpg" priority fill alt="Hero" />;

// INP: 使用动态导入
const HeavyComponent = dynamic(() => import("./Heavy"), { ssr: false });

// CLS: Image 组件自动处理尺寸
```

### React

```jsx
// LCP: 在 head 中预加载
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high" />;

// INP: 记忆化 + useTransition
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(newValue));

// CLS: 始终指定图片尺寸
```

### Vue / Nuxt

```vue
<!-- LCP: 使用 nuxt/image + preload -->
<NuxtImg src="/hero.jpg" preload loading="eager" />

<!-- INP: 使用异步组件 -->
<component :is="() => import('./Heavy.vue')" />

<!-- CLS: 使用 aspect-ratio CSS -->
<img :style="{ aspectRatio: '16/9' }" />
```

---

## 测量工具

### 实验室测试

| 工具            | 用途                         |
| --------------- | ---------------------------- |
| Chrome DevTools | Performance 面板、Lighthouse |
| WebPageTest     | 详细瀑布图、胶片视图         |
| Lighthouse CLI  | `npx lighthouse <url>`       |

### 真实用户数据

| 来源                    | 说明                 |
| ----------------------- | -------------------- |
| CrUX (Chrome UX Report) | BigQuery 或 API 查询 |
| Search Console          | Core Web Vitals 报告 |
| web-vitals 库           | 发送到自有分析系统   |

### 集成 web-vitals

```javascript
import { onLCP, onINP, onCLS } from "web-vitals";

function sendToAnalytics({ name, value, rating }) {
  gtag("event", name, {
    event_category: "Web Vitals",
    value: Math.round(name === "CLS" ? value * 1000 : value),
    event_label: rating,
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

---

## 快速参考

| 优化类型 | 关键技术                                   |
| -------- | ------------------------------------------ |
| **LCP**  | 预加载、CDN、关键 CSS 内联、SSR            |
| **INP**  | 分块任务、requestIdleCallback、Web Workers |
| **CLS**  | 尺寸预留、aspect-ratio、transform 动画     |

---

## 参考资源

- [web.dev LCP](https://web.dev/articles/lcp)
- [web.dev INP](https://web.dev/articles/inp)
- [web.dev CLS](https://web.dev/articles/cls)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Maintenance

- Sources: web.dev, Chrome DevTools, web-vitals
- Last updated: 2025-02
- Pattern: 指标详解 + 框架专项 + 调试工具
