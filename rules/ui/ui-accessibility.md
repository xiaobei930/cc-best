---
paths:
  - "**/*"
alwaysApply: true
---

# UI 可访问性规范 | UI Accessibility Rules

> 本文件扩展 [ui-design.md](./ui-design.md)，提供 WCAG 2.1 AA 可访问性规范

## 禁止操作

### 使用非语义化标签构建页面结构

```html
<!-- ❌ 全部使用 div，屏幕阅读器无法理解页面结构 -->
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="navigate('/')">首页</div>
  </div>
</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- ✅ 使用语义化 HTML，屏幕阅读器可自动生成页面大纲 -->
<header>
  <nav aria-label="主导航">
    <a href="/">首页</a>
  </nav>
</header>
<main>...</main>
<footer>...</footer>
```

### 仅依赖颜色传递信息

```html
<!-- ❌ 仅用红色/绿色区分状态，色盲用户无法辨别 -->
<span style="color: red;">失败</span>
<span style="color: green;">成功</span>

<!-- ✅ 颜色 + 图标 + 文字三重信息传递 -->
<span class="status-error" role="status">
  <svg aria-hidden="true"><!-- 叉号图标 --></svg>
  操作失败
</span>
<span class="status-success" role="status">
  <svg aria-hidden="true"><!-- 勾号图标 --></svg>
  操作成功
</span>
```

### 移除焦点指示器

```css
/* ❌ 全局去除焦点轮廓，键盘用户无法定位当前元素 */
*:focus {
  outline: none;
}

/* ✅ 自定义焦点样式，兼顾美观和可用性 */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* 鼠标用户不显示焦点环 */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 必须遵守

### ARIA 角色和属性规范

交互组件必须提供完整的 ARIA 信息：

```html
<!-- 模态对话框 -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">确认删除</h2>
  <p id="dialog-desc">此操作不可撤销，确定要删除该记录吗？</p>
  <button>取消</button>
  <button>确认删除</button>
</div>

<!-- 自定义下拉菜单 -->
<button aria-haspopup="listbox" aria-expanded="false" aria-label="选择城市">
  请选择
</button>
<ul role="listbox" aria-label="城市列表">
  <li role="option" aria-selected="true">北京</li>
  <li role="option" aria-selected="false">上海</li>
</ul>
```

### 键盘导航完整支持

所有交互功能必须支持键盘操作：

```javascript
// Tab 顺序管理 - 确保逻辑顺序与视觉顺序一致
// tabindex="0"  — 加入 Tab 顺序（自定义交互元素）
// tabindex="-1" — 可编程聚焦但不在 Tab 顺序中（模态内容）
// 禁止使用 tabindex > 0

// 焦点陷阱 - 模态框内循环焦点
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  first.focus();
}
```

### 色彩对比度要求

```css
/* WCAG 2.1 AA 最低标准 */
/* 普通文本 (< 18pt)：对比度 >= 4.5:1 */
/* 大文本 (>= 18pt 或 14pt 粗体)：对比度 >= 3:1 */

/* ❌ 对比度不足 (浅灰文字在白色背景上约 2.5:1) */
.low-contrast {
  color: #aaaaaa;
  background: #ffffff;
}

/* ✅ 满足 4.5:1 对比度要求 */
.accessible-text {
  color: #595959; /* 在白色背景上对比度约 7:1 */
  background: #ffffff;
}

/* ✅ 暗色主题同样需要满足对比度 */
.dark-theme-text {
  color: #d4d4d4; /* 在深色背景上对比度约 9.5:1 */
  background: #1a1a1a;
}
```

### 表单可访问性

```html
<!-- ❌ 无标签的表单输入 -->
<input type="email" placeholder="请输入邮箱" />

<!-- ✅ 完整的可访问表单 -->
<form aria-label="用户注册">
  <fieldset>
    <legend>基本信息</legend>

    <div class="form-group">
      <label for="email">邮箱地址 <span aria-hidden="true">*</span></label>
      <input
        id="email"
        type="email"
        required
        aria-required="true"
        aria-describedby="email-hint email-error"
        aria-invalid="false"
      />
      <p id="email-hint" class="hint">用于接收验证邮件</p>
      <p id="email-error" class="error" role="alert" hidden>
        请输入有效的邮箱地址
      </p>
    </div>

    <div class="form-group">
      <label for="password">密码 <span aria-hidden="true">*</span></label>
      <input
        id="password"
        type="password"
        required
        aria-required="true"
        minlength="8"
        aria-describedby="password-req"
      />
      <p id="password-req" class="hint">至少 8 个字符，包含字母和数字</p>
    </div>
  </fieldset>

  <button type="submit">注册</button>
</form>
```

---

## 推荐做法

### 屏幕阅读器兼容策略

| 技术             | 用途                   | 示例               |
| ---------------- | ---------------------- | ------------------ |
| `aria-live`      | 动态内容更新通知       | 消息提示、加载状态 |
| `aria-hidden`    | 隐藏装饰性元素         | 图标、分隔符       |
| `sr-only` CSS 类 | 仅屏幕阅读器可见的文本 | 补充说明、操作提示 |
| `role="status"`  | 非紧急状态更新         | 搜索结果数量       |
| `role="alert"`   | 紧急通知               | 表单验证错误       |

```css
/* 视觉隐藏但屏幕阅读器可读 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 响应式设计可访问性

```css
/* 确保触摸目标足够大（最小 44x44px） */
button,
a,
[role="button"] {
  min-width: 44px;
  min-height: 44px;
}

/* 尊重用户系统偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --bg-primary: #ffffff;
    --accent: #0000ee;
  }
}

/* 确保缩放到 200% 时内容不被截断 */
body {
  overflow-x: hidden;
}
.container {
  max-width: 100%;
  overflow-wrap: break-word;
}
```

### 可访问性测试检查清单

- [ ] 所有页面可通过键盘完整操作（Tab/Enter/Escape/方向键）
- [ ] 焦点顺序与视觉顺序一致，焦点指示器清晰可见
- [ ] 所有图片有 `alt` 属性（装饰性图片使用 `alt=""`）
- [ ] 所有表单控件关联 `<label>`，错误提示使用 `role="alert"`
- [ ] 文本对比度 >= 4.5:1，大文本 >= 3:1
- [ ] 使用 axe-core 或 Lighthouse 自动化扫描无 A/AA 级别违规
- [ ] 使用 NVDA 或 VoiceOver 手动测试关键用户流程
- [ ] 页面缩放至 200% 时内容完整可用
