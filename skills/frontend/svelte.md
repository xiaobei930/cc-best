# Svelte/SvelteKit 模式

本文档提供 Svelte 5 和 SvelteKit 的最佳实践。

## 项目结构

```
src/
├── lib/
│   ├── components/          # 可复用组件
│   │   ├── ui/              # 基础 UI 组件
│   │   │   ├── Button.svelte
│   │   │   └── Input.svelte
│   │   └── feature/         # 功能组件
│   │       └── UserCard.svelte
│   ├── stores/              # 状态管理
│   │   └── user.svelte.ts
│   ├── utils/               # 工具函数
│   └── types/               # 类型定义
├── routes/                  # 路由（SvelteKit）
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── api/
│       └── users/
│           └── +server.ts
└── app.html
```

---

## Svelte 5 Runes

### 响应式状态 ($state)

```svelte
<script lang="ts">
  // 基础状态
  let count = $state(0)
  let user = $state({ name: '', email: '' })

  // 派生状态
  let doubled = $derived(count * 2)
  let isValid = $derived(user.email.includes('@'))

  // 副作用
  $effect(() => {
    console.log(`Count changed to ${count}`)
    // 清理函数
    return () => {
      console.log('Cleanup')
    }
  })

  function increment() {
    count++
  }
</script>

<button onclick={increment}>
  Count: {count} (doubled: {doubled})
</button>
```

### Props ($props)

```svelte
<!-- Button.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary'
    disabled?: boolean
    onclick?: () => void
    children: import('svelte').Snippet
  }

  let {
    variant = 'primary',
    disabled = false,
    onclick,
    children
  }: Props = $props()
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  {onclick}
>
  {@render children()}
</button>

<!-- 使用 -->
<Button variant="primary" onclick={handleClick}>
  点击我
</Button>
```

### 双向绑定 ($bindable)

```svelte
<!-- Input.svelte -->
<script lang="ts">
  interface Props {
    value: string
    placeholder?: string
  }

  let { value = $bindable(), placeholder = '' }: Props = $props()
</script>

<input bind:value {placeholder} />

<!-- 使用 -->
<script lang="ts">
  let name = $state('')
</script>

<Input bind:value={name} placeholder="输入名称" />
```

---

## 组件模式

### Snippet（插槽替代）

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    header?: Snippet
    children: Snippet
    footer?: Snippet
  }

  let { title, header, children, footer }: Props = $props()
</script>

<div class="card">
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {:else}
    <div class="card-header">
      <h3>{title}</h3>
    </div>
  {/if}

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<!-- 使用 -->
<Card title="用户信息">
  {#snippet header()}
    <h2>自定义标题</h2>
  {/snippet}

  <p>卡片内容</p>

  {#snippet footer()}
    <Button>操作</Button>
  {/snippet}
</Card>
```

### 条件渲染

```svelte
<script lang="ts">
  let status = $state<'loading' | 'success' | 'error'>('loading')
  let data = $state<Data | null>(null)
</script>

{#if status === 'loading'}
  <Spinner />
{:else if status === 'error'}
  <ErrorMessage />
{:else if data}
  <DataDisplay {data} />
{/if}
```

### 列表渲染

```svelte
<script lang="ts">
  interface Item {
    id: string
    name: string
  }

  let items = $state<Item[]>([])
</script>

<ul>
  {#each items as item (item.id)}
    <li>{item.name}</li>
  {:else}
    <li>暂无数据</li>
  {/each}
</ul>
```

---

## 状态管理

### 共享状态（.svelte.ts）

```typescript
// lib/stores/user.svelte.ts
interface User {
  id: string
  name: string
  email: string
}

class UserStore {
  user = $state<User | null>(null)
  isLoading = $state(false)

  isLoggedIn = $derived(this.user !== null)

  async login(email: string, password: string) {
    this.isLoading = true
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      this.user = await response.json()
    } finally {
      this.isLoading = false
    }
  }

  logout() {
    this.user = null
  }
}

export const userStore = new UserStore()
```

```svelte
<!-- 使用 -->
<script lang="ts">
  import { userStore } from '$lib/stores/user.svelte'
</script>

{#if userStore.isLoggedIn}
  <p>欢迎, {userStore.user?.name}</p>
  <button onclick={() => userStore.logout()}>退出</button>
{:else}
  <LoginForm />
{/if}
```

### Context API

```svelte
<!-- 提供 Context -->
<script lang="ts">
  import { setContext } from 'svelte'

  interface ThemeContext {
    theme: 'light' | 'dark'
    toggle: () => void
  }

  let theme = $state<'light' | 'dark'>('light')

  setContext<ThemeContext>('theme', {
    get theme() { return theme },
    toggle() { theme = theme === 'light' ? 'dark' : 'light' }
  })
</script>

<!-- 使用 Context -->
<script lang="ts">
  import { getContext } from 'svelte'

  const { theme, toggle } = getContext<ThemeContext>('theme')
</script>

<button onclick={toggle}>
  当前主题: {theme}
</button>
```

---

## SvelteKit 路由

### 页面和布局

```svelte
<!-- routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types'
  import { page } from '$app/stores'

  let { data, children }: { data: LayoutData, children: Snippet } = $props()
</script>

<nav>
  <a href="/" class:active={$page.url.pathname === '/'}>首页</a>
  <a href="/about" class:active={$page.url.pathname === '/about'}>关于</a>
</nav>

<main>
  {@render children()}
</main>

<!-- routes/+layout.ts -->
<script lang="ts" context="module">
  import type { LayoutLoad } from './$types'

  export const load: LayoutLoad = async ({ fetch }) => {
    const user = await fetch('/api/user').then(r => r.json())
    return { user }
  }
</script>
```

### 服务端数据加载

```typescript
// routes/users/+page.server.ts
import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ fetch, params }) => {
  const response = await fetch('/api/users')

  if (!response.ok) {
    throw error(response.status, '获取用户失败')
  }

  const users = await response.json()
  return { users }
}
```

```svelte
<!-- routes/users/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<h1>用户列表</h1>
<ul>
  {#each data.users as user (user.id)}
    <li>{user.name}</li>
  {/each}
</ul>
```

### API 路由

```typescript
// routes/api/users/+server.ts
import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1
  const limit = Number(url.searchParams.get('limit')) || 10

  const users = await db.users.findMany({
    skip: (page - 1) * limit,
    take: limit
  })

  return json({ data: users, page, limit })
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json()

  // 验证
  if (!body.email || !body.name) {
    throw error(400, '缺少必填字段')
  }

  const user = await db.users.create({ data: body })
  return json(user, { status: 201 })
}
```

### 表单操作

```typescript
// routes/login/+page.server.ts
import type { Actions } from './$types'
import { fail, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = data.get('email') as string
    const password = data.get('password') as string

    // 验证
    if (!email || !password) {
      return fail(400, { email, missing: true })
    }

    // 登录逻辑
    const user = await authenticate(email, password)
    if (!user) {
      return fail(401, { email, incorrect: true })
    }

    // 设置 Cookie
    cookies.set('session', user.sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    throw redirect(303, '/dashboard')
  }
}
```

```svelte
<!-- routes/login/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types'
  import { enhance } from '$app/forms'

  let { form }: { form: ActionData } = $props()
</script>

<form method="POST" use:enhance>
  <input
    name="email"
    type="email"
    value={form?.email ?? ''}
    placeholder="邮箱"
  />

  <input
    name="password"
    type="password"
    placeholder="密码"
  />

  {#if form?.missing}
    <p class="error">请填写所有字段</p>
  {/if}

  {#if form?.incorrect}
    <p class="error">邮箱或密码错误</p>
  {/if}

  <button type="submit">登录</button>
</form>
```

---

## 动画和过渡

```svelte
<script lang="ts">
  import { fade, slide, fly } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  let visible = $state(false)
</script>

<button onclick={() => visible = !visible}>
  切换
</button>

{#if visible}
  <!-- 淡入淡出 -->
  <div transition:fade={{ duration: 300 }}>
    淡入淡出
  </div>

  <!-- 滑动 -->
  <div transition:slide={{ duration: 300, easing: quintOut }}>
    滑动
  </div>

  <!-- 飞入 -->
  <div in:fly={{ y: 200, duration: 500 }} out:fade>
    飞入
  </div>
{/if}
```

---

## 测试

### 组件测试

```typescript
// Button.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button.svelte'

describe('Button', () => {
  it('渲染正确的文本', () => {
    render(Button, { props: { children: '点击我' } })
    expect(screen.getByText('点击我')).toBeInTheDocument()
  })

  it('点击时调用 onclick', async () => {
    const onclick = vi.fn()
    render(Button, { props: { onclick, children: '点击' } })

    await fireEvent.click(screen.getByRole('button'))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('disabled 时不可点击', () => {
    render(Button, { props: { disabled: true, children: '禁用' } })
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

---

## 最佳实践

1. **使用 Svelte 5 Runes** - $state, $derived, $effect
2. **TypeScript 优先** - 使用 .svelte.ts 和类型注解
3. **组件单一职责** - 每个组件只做一件事
4. **利用 Snippet** - 替代传统插槽，更灵活
5. **服务端优先** - 优先使用 +page.server.ts
6. **表单使用 Actions** - 渐进增强，无 JS 也能工作
7. **状态管理简单化** - 优先使用 .svelte.ts 而非第三方库
8. **利用 Context** - 跨组件共享状态
9. **动画适度** - 使用内置过渡，尊重 prefers-reduced-motion
10. **测试组件行为** - 测试用户交互，而非实现细节
