---
paths:
  - "**/*"
alwaysApply: true
---

# 前端性能优化规范 | Frontend Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供前端特定性能优化规范

## 禁止操作

### 在渲染路径中执行高开销计算

```tsx
// ❌ 每次渲染都重新过滤和排序，触发不必要的重渲染
function ProductList({ products, keyword }: Props) {
  const filtered = products
    .filter((p) => p.name.includes(keyword))
    .sort((a, b) => a.price - b.price);
  return filtered.map((p) => <ProductCard key={p.id} product={p} />);
}

// ✅ 使用 useMemo 缓存计算结果
function ProductList({ products, keyword }: Props) {
  const filtered = useMemo(
    () =>
      products
        .filter((p) => p.name.includes(keyword))
        .sort((a, b) => a.price - b.price),
    [products, keyword],
  );
  return filtered.map((p) => <ProductCard key={p.id} product={p} />);
}
```

### 首屏加载全量 Bundle

```typescript
// ❌ 静态导入所有路由页面，首屏加载巨大 Bundle
import HomePage from "@/pages/Home";
import DashboardPage from "@/pages/Dashboard";
import SettingsPage from "@/pages/Settings";

// ✅ 路由级 Code Splitting，按需加载
const HomePage = lazy(() => import("@/pages/Home"));
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
```

### 长列表全量渲染 DOM

```tsx
// ❌ 10000 条数据全部渲染，页面卡顿
function MessageList({ messages }: { messages: Message[] }) {
  return messages.map((msg) => <MessageItem key={msg.id} message={msg} />);
}

// ✅ 使用虚拟列表，仅渲染可视区域
import { useVirtualizer } from "@tanstack/react-virtual";

function MessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return (
    <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <MessageItem
            key={row.key}
            message={messages[row.index]}
            style={{ transform: `translateY(${row.start}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 必须遵守

### Bundle 优化 — Tree Shaking 与 Code Splitting

确保构建工具正确配置以消除死代码：

```typescript
// ❌ 导入整个库
import _ from "lodash";
const result = _.debounce(fn, 300);

// ✅ 按需导入，支持 Tree Shaking
import debounce from "lodash/debounce";
const result = debounce(fn, 300);
```

```typescript
// vite.config.ts — 手动分包，优化缓存命中率
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-popover"],
        },
      },
    },
  },
});
```

### Web Vitals 指标要求

| 指标 | 含义                      | 目标    |
| ---- | ------------------------- | ------- |
| LCP  | Largest Contentful Paint  | < 2.5s  |
| FID  | First Input Delay         | < 100ms |
| CLS  | Cumulative Layout Shift   | < 0.1   |
| INP  | Interaction to Next Paint | < 200ms |

```typescript
// 接入 Web Vitals 监控
import { onCLS, onFID, onLCP, onINP } from "web-vitals";

onLCP(console.log);
onFID(console.log);
onCLS(console.log);
onINP(console.log);
```

### 图片优化

```html
<!-- ❌ 未指定尺寸，导致 CLS；未使用现代格式 -->
<img src="photo.png" />

<!-- ✅ 指定尺寸防止布局偏移，使用响应式图片 -->
<img
  src="photo.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  width="800"
  height="600"
  loading="lazy"
  alt="产品图片"
/>
```

### 重渲染优化

```tsx
// ❌ 父组件每次渲染都创建新对象，子组件无效重渲染
function Parent() {
  const config = { theme: "dark", lang: "zh" };
  return <Child config={config} />;
}

// ✅ React.memo + useMemo 避免不必要的重渲染
const Child = React.memo(function Child({ config }: Props) {
  return <div>{config.theme}</div>;
});

function Parent() {
  const config = useMemo(() => ({ theme: "dark", lang: "zh" }), []);
  return <Child config={config} />;
}
```

---

## 推荐做法

### SSR / SSG 场景选择

| 渲染策略 | 适用场景                 | 代表框架        |
| -------- | ------------------------ | --------------- |
| CSR      | 后台管理、纯交互型应用   | Vite + React    |
| SSR      | SEO 敏感、首屏性能要求高 | Next.js / Nuxt  |
| SSG      | 博客、文档、营销页面     | Astro / Next.js |
| ISR      | 电商商品页（定期更新）   | Next.js         |

### 懒加载策略

```typescript
// 路由级懒加载 — React
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));

// 组件级懒加载 — 重型组件按需加载
const MarkdownEditor = lazy(() => import("@/components/MarkdownEditor"));

// 交互触发懒加载 — 用户操作后才加载
const [showChart, setShowChart] = useState(false);
const Chart = lazy(() => import("@/components/Chart"));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      {showChart && <Chart />}
      <button onClick={() => setShowChart(true)}>查看图表</button>
    </Suspense>
  );
}
```

### 性能分析工具

```bash
# 构建产物分析
npx vite-bundle-visualizer      # Vite 项目
npx webpack-bundle-analyzer     # Webpack 项目

# Lighthouse CI 集成
npx lhci autorun --preset=desktop
```

### 关键资源预加载

```html
<!-- 预加载关键字体，避免 FOUT -->
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

<!-- 预连接第三方域名，减少 DNS 和 TLS 耗时 -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />
```
