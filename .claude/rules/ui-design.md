---
paths:
  - "**/*.vue"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.less"
---

# UI 设计规范

本规范定义项目的 UI/UE 设计标准，确保界面美观、独特、体验一致，**避免 AI 通用审美（AI Slop）**。

---

## 核心理念：避免 AI 通用审美

> **关键原则**: 选择清晰的概念方向并精准执行。大胆的极简主义和精致的极繁主义都可以——关键是**意图性，而非强度**。

### AI 通用审美（必须避免）

```
┌─────────────────────────────────────────────────────────────┐
│                   ❌ AI 默认设计 = 平庸设计                   │
├─────────────────────────────────────────────────────────────┤
│  • Inter/Roboto 字体 + 紫色渐变 + 白色背景                   │
│  • 三个图标的网格布局（icon + 标题 + 描述）                   │
│  • 胆怯的、均匀分布的色彩搭配                                │
│  • 可预测的组件模式和布局                                    │
│  • 缺乏语境的通用设计                                       │
└─────────────────────────────────────────────────────────────┘
```

### 为什么 AI 会这样
AI 被训练成"平均值"——Tailwind 默认的 `indigo-500`、流行字体 Inter、常见的三列网格布局充斥着训练数据。AI 会默认生成最"安全"的设计，但安全 = 平庸。

---

## 设计原则

| 原则 | 说明 |
|------|------|
| **意图性** | 每个设计选择都有明确理由，避免默认值 |
| **独特性** | 设计要有记忆点，让用户记住 |
| **一致性** | 相同功能使用相同设计模式 |
| **可访问性** | 考虑不同用户群体的使用需求 |

---

## 字体系统

### 字体选择原则

| ❌ 避免（AI 默认）| ✅ 推荐替代 |
|------------------|------------|
| Inter, Roboto | JetBrains Mono, Fira Code（代码风格）|
| Open Sans, Lato | Playfair Display, Crimson Pro（编辑风格）|
| 系统默认字体 | Space Grotesk, Clash Display, Satoshi（现代风格）|
| Arial, Helvetica | IBM Plex Sans, Cabinet Grotesk（专业风格）|

### 推荐字体组合

| 场景 | 标题字体 | 正文字体 |
|------|----------|----------|
| **科技/开发** | JetBrains Mono | IBM Plex Sans |
| **编辑/内容** | Playfair Display | Source Serif Pro |
| **现代/创意** | Clash Display | Space Grotesk |
| **专业/商务** | Cabinet Grotesk | IBM Plex Sans |
| **活泼/年轻** | Satoshi | DM Sans |

### 字号层级（3x+ 跳跃）

| 用途 | 字号 | 行高 | 字重 |
|------|------|------|------|
| 超大标题 H1 | 48px-64px | 1.1 | 700-900 |
| 大标题 H2 | 32px-40px | 1.2 | 600-800 |
| 中标题 H3 | 20px-24px | 1.3 | 600 |
| 正文 | 16px | 1.5 | 400 |
| 辅助文字 | 12px-14px | 1.4 | 400 |

### 字体使用规则
- ✅ 使用极端字重对比（100/200 vs 800/900），而非 400 vs 600
- ✅ 使用 3x+ 的字号跳跃（48px vs 16px），而非 1.5x
- ✅ 选择一种特色字体，坚定使用
- ❌ 不要使用 Inter, Roboto, Open Sans, Lato
- ❌ 同一页面不超过 2 种字体

### 字体加载示例
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&display=swap" rel="stylesheet">

<!-- 或使用 Fontsource -->
<!-- npm install @fontsource/space-grotesk -->
```

---

## 颜色系统

### 颜色选择原则

| ❌ 避免（AI 默认）| ✅ 推荐替代 |
|------------------|------------|
| 紫色渐变 `#6366f1` (indigo-500) | 深绿 `#059669`、石油蓝 `#0d9488` |
| 白色背景 `#ffffff` | 暖灰 `#fafaf9`、深色 `#18181b` |
| 均匀分布的 5+ 种颜色 | 主导色 + 1-2 种锐利点缀色 |
| Linear 风格紫蓝渐变 | 自然渐变、单色深浅变化 |

### 主题色方案示例

#### 方案 A：深色主题（推荐）
```css
/* 背景 */
--bg-primary: #0a0a0b;      /* 近黑色 */
--bg-secondary: #18181b;    /* 深灰 */
--bg-tertiary: #27272a;     /* 中灰 */

/* 文字 */
--text-primary: #fafafa;    /* 高亮白 */
--text-secondary: #a1a1aa;  /* 灰色 */
--text-tertiary: #71717a;   /* 暗灰 */

/* 点缀色 */
--accent: #22d3ee;          /* 青色点缀 */
--accent-hover: #67e8f9;
```

#### 方案 B：暖色主题
```css
/* 背景 */
--bg-primary: #fafaf9;      /* 暖白 */
--bg-secondary: #f5f5f4;    /* 暖灰 */
--bg-tertiary: #e7e5e4;

/* 文字 */
--text-primary: #1c1917;    /* 暖黑 */
--text-secondary: #57534e;
--text-tertiary: #a8a29e;

/* 点缀色 */
--accent: #ea580c;          /* 橙色点缀 */
--accent-hover: #f97316;
```

#### 方案 C：冷色专业
```css
/* 背景 */
--bg-primary: #f8fafc;      /* 冷白 */
--bg-secondary: #f1f5f9;
--bg-tertiary: #e2e8f0;

/* 文字 */
--text-primary: #0f172a;    /* 深蓝黑 */
--text-secondary: #475569;
--text-tertiary: #94a3b8;

/* 点缀色 - 避免紫色 */
--accent: #0d9488;          /* 青绿 */
--accent-hover: #14b8a6;
```

### 语义色
```css
/* 成功 */
--success-color: #22c55e;
--success-bg: #f0fdf4;

/* 警告 */
--warning-color: #f59e0b;
--warning-bg: #fffbeb;

/* 错误 */
--error-color: #ef4444;
--error-bg: #fef2f2;

/* 信息 - 避免使用紫色 */
--info-color: #0ea5e9;
--info-bg: #f0f9ff;
```

### 颜色使用规则
- ✅ 主导色占 60-70%，点缀色占 10-30%
- ✅ 使用锐利的点缀色创造视觉焦点
- ❌ 不要使用紫色渐变（indigo-500 系列）
- ❌ 不要使用超过 3 种主题色
- ❌ 不要均匀分布颜色

---

## 间距系统

### 基础间距（4px 倍数）
```css
--spacing-xs: 4px;    /* 紧凑间距 */
--spacing-sm: 8px;    /* 小间距 */
--spacing-md: 16px;   /* 中间距（默认） */
--spacing-lg: 24px;   /* 大间距 */
--spacing-xl: 32px;   /* 超大间距 */
--spacing-xxl: 48px;  /* 区块间距 */
--spacing-xxxl: 96px; /* 大留白 */
```

### 间距策略
- ✅ 使用**大量留白**或**控制密度**，而非中庸
- ✅ 组内紧凑（8px），组间松散（24px+）
- ❌ 不要到处使用 16px 的均匀间距

---

## 布局规范

### 布局原则

| ❌ 避免（AI 默认）| ✅ 推荐替代 |
|------------------|------------|
| 三列图标网格 | 不对称布局 |
| 中规中矩的对齐 | 斜线流动、网格突破 |
| 均匀间距 | 大量留白或控制密度 |
| 可预测的排列 | 重叠、层叠、出血布局 |

### 创意布局技巧
```css
/* 不对称布局 */
.hero {
  display: grid;
  grid-template-columns: 2fr 1fr;  /* 非对称比例 */
  gap: 48px;
}

/* 重叠元素 */
.card-overlay {
  position: relative;
  transform: translateY(-40px);
  margin-bottom: -40px;
}

/* 出血布局 */
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

/* 斜线分割 */
.diagonal-section {
  clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
}
```

### 响应式断点
```css
/* 移动端 */
@media (max-width: 640px) { }

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }

/* 大屏 */
@media (min-width: 1280px) { }
```

---

## 背景与纹理

### 背景原则

| ❌ 避免 | ✅ 推荐 |
|--------|--------|
| 纯白色背景 | 渐变网格、微妙纹理 |
| 简单线性渐变 | 径向渐变、网格渐变 |
| 空白无内容 | 几何图案、颗粒叠加 |

### 背景效果示例

```css
/* 渐变网格背景 */
.gradient-mesh {
  background:
    radial-gradient(at 40% 20%, hsla(200, 100%, 74%, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.2) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(355, 85%, 63%, 0.1) 0px, transparent 50%);
  background-color: #0a0a0b;
}

/* 噪点纹理 */
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  opacity: 0.03;
  pointer-events: none;
}

/* 网格背景 */
.grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* 光晕效果 */
.glow {
  box-shadow:
    0 0 60px rgba(34, 211, 238, 0.3),
    0 0 100px rgba(34, 211, 238, 0.1);
}
```

---

## 动画与交互

### 动画原则
- ✅ 专注高影响时刻：精心设计的页面加载 > 分散的微交互
- ✅ 使用交错动画（stagger）创造节奏
- ✅ hover 和 scroll 触发的惊喜效果
- ❌ 不要到处加动画，要有节制

### 动画示例

```css
/* 交错淡入 */
.stagger-fade > * {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.6s ease-out forwards;
}
.stagger-fade > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-fade > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-fade > *:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬浮效果 */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 边框动画 */
.border-glow {
  position: relative;
}
.border-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #22d3ee, #a855f7, #22d3ee);
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.border-glow:hover::before {
  opacity: 1;
}
```

---

## 圆角系统

```css
--radius-sm: 4px;     /* 小圆角（按钮、标签） */
--radius-md: 8px;     /* 中圆角（卡片、输入框） */
--radius-lg: 16px;    /* 大圆角（模态框） */
--radius-xl: 24px;    /* 超大圆角（特殊容器） */
--radius-full: 9999px; /* 全圆角（头像、胶囊） */
```

---

## 阴影系统

```css
/* 轻微阴影 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* 小阴影 - 卡片 */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* 中阴影 - 下拉菜单 */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* 大阴影 - 模态框 */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* 戏剧性阴影 */
--shadow-dramatic: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 发光阴影 */
--shadow-glow: 0 0 40px rgba(34, 211, 238, 0.4);
```

---

## 组件规范

### 按钮
| 类型 | 用途 | 样式 |
|------|------|------|
| Primary | 主要操作（每页最多 1 个） | 实心填充 + 悬浮动画 |
| Secondary | 次要操作 | 边框 + 背景变化 |
| Ghost | 辅助操作 | 透明 + 悬浮背景 |
| Danger | 危险操作 | 红色系 |

```css
/* 按钮尺寸 */
--btn-height-sm: 32px;
--btn-height-md: 40px;
--btn-height-lg: 48px;

/* 按钮动画 */
.btn {
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.btn:active {
  transform: translateY(0);
}
```

### 卡片
```css
.card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent);
}
```

---

## 检查清单

### 反模式检查（必须全部通过）
- [ ] **未使用** Inter, Roboto, Open Sans, Lato 字体
- [ ] **未使用** 紫色渐变（indigo-500 系列）
- [ ] **未使用** 纯白色 `#ffffff` 作为主背景
- [ ] **未使用** 三列图标网格布局
- [ ] 颜色**不是**均匀分布

### 独特性检查
- [ ] 有明确的美学方向
- [ ] 有设计记忆点
- [ ] 布局有不对称/重叠/网格突破元素
- [ ] 字重对比 ≥ 300（如 400 vs 700）
- [ ] 字号跳跃 ≥ 2x（如 16px vs 32px）

### 细节检查
- [ ] 背景有纹理/渐变/图案
- [ ] 有交错动画或悬浮效果
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 响应式适配

---

## 参考资源

- [Anthropic Frontend Design Skill](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design)
- [Prompting for Frontend Aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)
- [AI Purple Problem](https://dev.to/jaainil/ai-purple-problem-make-your-ui-unmistakable-3ono)
