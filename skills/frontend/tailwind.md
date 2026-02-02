# Tailwind CSS 开发模式

Tailwind CSS 最佳实践和 v4 迁移指南。

## 项目检测

```
检测方式：
├─ package.json 包含 tailwindcss
├─ tailwind.config.js/ts 存在
└─ 或 CSS 中包含 @import 'tailwindcss'
```

---

## Tailwind CSS v4 重大变更

> ⚠️ v4 是破坏性更新，从 JavaScript 配置迁移到 CSS-first 配置。

### 核心变更对照

| v3 方式                               | v4 方式                      |
| ------------------------------------- | ---------------------------- |
| `tailwind.config.ts`                  | CSS `@theme` 块              |
| `@tailwind base/components/utilities` | `@import 'tailwindcss'`      |
| `darkMode: 'class'`                   | `@custom-variant dark`       |
| JS 中定义 keyframes                   | `@theme` 内定义 `@keyframes` |
| `theme.extend`                        | `@theme` 内直接定义          |

### 配置迁移

**v3 配置（旧）**

```typescript
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#10b981",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
};
```

**v4 配置（新）**

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* 颜色定义 */
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 160);

  /* 字体定义 */
  --font-sans: "Inter", sans-serif;

  /* 动画必须在 @theme 内定义才能 tree-shake */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  --animate-fade-in: fade-in 0.3s ease-out;
}

/* 暗色模式变体 */
@custom-variant dark (&:where(.dark, .dark *));
```

### OKLCH 颜色系统

v4 推荐使用 OKLCH 颜色，提供更好的感知均匀性：

```css
@theme {
  /* OKLCH: lightness, chroma, hue */
  --color-primary: oklch(0.6 0.2 250); /* 蓝色 */
  --color-primary-light: oklch(0.8 0.15 250);
  --color-primary-dark: oklch(0.4 0.25 250);

  /* 半透明变体使用 color-mix() */
  --color-primary-50: color-mix(
    in oklch,
    var(--color-primary) 50%,
    transparent
  );
}
```

### 自定义工具类

```css
/* v4 使用 @utility 指令 */
@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### 容器查询

```css
@theme {
  /* 容器查询 token */
  --container-3xs: 16rem;
  --container-2xs: 18rem;
  --container-xs: 20rem;
}
```

---

## React 19 集成

v4 + React 19 的 ref 处理变更：

```tsx
// ❌ v3 + React 18: 使用 forwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref} {...props} />;
});

// ✅ v4 + React 19: ref 作为 prop
interface ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

function Button({ ref, children, ...props }: ButtonProps) {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
}
```

### 与 Radix UI 集成

```tsx
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ asChild, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} {...props} />;
}
```

---

## 原生 CSS 动画

v4 支持原生 CSS 动画特性：

```css
/* 入场动画 */
.dialog {
  @starting-style {
    opacity: 0;
    transform: scale(0.95);
  }

  opacity: 1;
  transform: scale(1);
  transition:
    opacity 0.2s,
    transform 0.2s;
  transition-behavior: allow-discrete;
}

/* 离场动画需要 JS 控制 */
```

---

## 常用模式

### 响应式设计

```html
<!-- 移动优先 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 全宽 → 半宽 → 三分之一 -->
</div>

<!-- 容器查询 -->
<div class="@container">
  <div class="@md:flex @lg:grid">
    <!-- 基于容器而非视口 -->
  </div>
</div>
```

### 暗色模式

```html
<!-- 基于类切换 -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"></body>
</html>
```

```css
/* v4 暗色模式配置 */
@custom-variant dark (&:where(.dark, .dark *));
```

### 组件样式

```tsx
// 使用 clsx/tailwind-merge 合并类名
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 使用
<button className={cn(
  'px-4 py-2 rounded-lg',
  'bg-primary text-white',
  'hover:bg-primary-dark',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  className
)}>
```

---

## 性能优化

### 生产构建

```bash
# v4 自动 tree-shake 未使用的样式
# 确保 @keyframes 在 @theme 内定义

# 构建
npx tailwindcss -i ./src/app.css -o ./dist/output.css --minify
```

### 避免的模式

```html
<!-- ❌ 动态类名无法 tree-shake -->
<div :class="`text-${color}-500`">
  <!-- ✅ 使用完整类名 -->
  <div
    :class="{ 'text-red-500': color === 'red', 'text-blue-500': color === 'blue' }"
  ></div>
</div>
```

---

## 迁移清单

从 v3 迁移到 v4：

- [ ] 删除 `tailwind.config.ts`
- [ ] 创建 CSS-first 配置（`@theme` 块）
- [ ] 替换 `@tailwind` 指令为 `@import 'tailwindcss'`
- [ ] 迁移 `darkMode: 'class'` 到 `@custom-variant dark`
- [ ] 将 `@keyframes` 移入 `@theme` 块
- [ ] 更新颜色到 OKLCH（可选但推荐）
- [ ] 检查 React 19 的 ref 处理（如使用）
- [ ] 测试暗色模式功能
- [ ] 验证自定义工具类

---

## 参考资源

- [Tailwind CSS v4 文档](https://tailwindcss.com/docs)
- [v4 迁移指南](https://tailwindcss.com/docs/upgrade-guide)
- [OKLCH 颜色](https://oklch.com/)

---

## Maintenance

- Sources: Tailwind CSS 官方文档, v4 迁移指南
- Last updated: 2025-02
- Pattern: 最佳实践 + v4 迁移对照
