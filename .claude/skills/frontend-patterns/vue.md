# Vue 3 前端开发模式

Vue 3 + TypeScript 项目开发的专属模式，涵盖 Composition API、Pinia、Vue Router 等。

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── ui/              # 基础 UI 组件（Button, Input...）
│   ├── layout/          # 布局组件（Header, Sidebar...）
│   └── feature/         # 功能组件（UserCard, OrderList...）
├── views/               # 页面组件
│   └── Home.vue
├── stores/              # Pinia 状态
│   └── user.ts
├── composables/         # 组合式函数
│   └── useAuth.ts
├── types/               # 类型定义
│   └── index.ts
├── router/              # 路由配置
│   └── index.ts
├── utils/               # 工具函数
│   └── format.ts
├── api/                 # API 请求
│   └── user.ts
├── App.vue
└── main.ts
```

---

## 组件模式

### 智能组件 vs 展示组件

```vue
<!-- ✅ 展示组件：纯 UI，易于测试 -->
<script setup lang="ts">
import type { User } from '@/types'

defineProps<{
  users: User[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', user: User): void
}>()
</script>

<template>
  <div class="user-list">
    <div v-if="loading" class="loading">加载中...</div>
    <div
      v-else
      v-for="user in users"
      :key="user.id"
      class="user-item"
      @click="emit('select', user)"
    >
      {{ user.name }}
    </div>
  </div>
</template>
```

```vue
<!-- ✅ 智能组件：管理数据和逻辑 -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import UserList from '@/components/UserList.vue'

const store = useUserStore()
const { users, loading } = storeToRefs(store)

onMounted(() => {
  store.fetchUsers()
})

function handleSelect(user) {
  store.selectUser(user)
}
</script>

<template>
  <UserList :users="users" :loading="loading" @select="handleSelect" />
</template>
```

### 组合模式（Compound Components）

```vue
<!-- Tabs 组合组件 -->
<script setup lang="ts">
import { provide, ref } from 'vue'

const activeTab = ref('')

provide('tabs', {
  activeTab,
  setActive: (id: string) => { activeTab.value = id }
})
</script>

<template>
  <div class="tabs">
    <slot />
  </div>
</template>
```

```vue
<!-- TabItem 子组件 -->
<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{ id: string; label: string }>()
const { activeTab, setActive } = inject('tabs')!

const isActive = computed(() => activeTab.value === props.id)
</script>

<template>
  <button
    :class="['tab-item', { active: isActive }]"
    @click="setActive(id)"
  >
    {{ label }}
  </button>
</template>
```

---

## Composables 模式

### 基础 Composable 模板

```typescript
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseWindowSizeReturn {
  width: Ref<number>
  height: Ref<number>
}

export function useWindowSize(): UseWindowSizeReturn {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

### 数据获取 Composable

```typescript
import { ref, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  refetch: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    refetch: fetchData
  }
}
```

### 防抖 Composable

```typescript
import { ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(
  value: Ref<T>,
  delay: number = 300
): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: NodeJS.Timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
```

### 表单验证 Composable

```typescript
import { ref, computed, type Ref } from 'vue'

interface ValidationRule {
  validate: (value: string) => boolean
  message: string
}

interface UseFormFieldReturn {
  value: Ref<string>
  error: Ref<string>
  isValid: Ref<boolean>
  validate: () => boolean
  reset: () => void
}

export function useFormField(
  initialValue: string = '',
  rules: ValidationRule[] = []
): UseFormFieldReturn {
  const value = ref(initialValue)
  const error = ref('')
  const touched = ref(false)

  const isValid = computed(() => {
    if (!touched.value) return true
    return rules.every(rule => rule.validate(value.value))
  })

  function validate(): boolean {
    touched.value = true
    for (const rule of rules) {
      if (!rule.validate(value.value)) {
        error.value = rule.message
        return false
      }
    }
    error.value = ''
    return true
  }

  function reset() {
    value.value = initialValue
    error.value = ''
    touched.value = false
  }

  return { value, error, isValid, validate, reset }
}
```

---

## 状态管理模式

### Pinia Store 模板（Setup Store 风格）

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? '')

  // Actions
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await userApi.login({ email, password })
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登录失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // 初始化
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isLoggedIn,
    userName,
    // Actions
    login,
    logout,
    init
  }
})
```

---

## 性能优化模式

### 列表虚拟化

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const props = defineProps<{ items: any[] }>()

const { list, containerProps, wrapperProps } = useVirtualList(
  () => props.items,
  { itemHeight: 50 }
)
</script>

<template>
  <div v-bind="containerProps" class="virtual-list">
    <div v-bind="wrapperProps">
      <div
        v-for="{ data, index } in list"
        :key="index"
        class="list-item"
      >
        {{ data.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  height: 400px;
  overflow: auto;
}
</style>
```

### 组件懒加载

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  }
]
```

```vue
<!-- 条件懒加载组件 -->
<script setup lang="ts">
import { defineAsyncComponent, ref, h } from 'vue'

const showChart = ref(false)

const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/HeavyChart.vue'),
  loadingComponent: () => h('div', '加载中...'),
  delay: 200,
  timeout: 10000
})
</script>

<template>
  <button @click="showChart = true">显示图表</button>
  <HeavyChart v-if="showChart" />
</template>
```

### 计算属性缓存

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const items = ref<Item[]>([])
const filter = ref('')
const sortBy = ref('name')

// ✅ 好：缓存计算结果
const filteredAndSortedItems = computed(() => {
  return items.value
    .filter(item => item.name.includes(filter.value))
    .sort((a, b) => a[sortBy.value].localeCompare(b[sortBy.value]))
})
</script>
```

### 避免不必要的响应式

```typescript
import { shallowRef, triggerRef, markRaw } from 'vue'

// ✅ 大数据集使用 shallowRef
const bigData = shallowRef<BigObject[]>([])

function updateData(newData: BigObject[]) {
  bigData.value = newData
  triggerRef(bigData)
}

// ✅ 静态数据使用 markRaw
const staticConfig = markRaw({
  options: [...],
  settings: {...}
})
```

---

## 动画模式

### 基础过渡动画

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换</button>

  <Transition name="fade">
    <div v-if="show" class="content">
      内容区域
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 列表动画

```vue
<script setup lang="ts">
import { ref } from 'vue'

const items = ref([1, 2, 3, 4, 5])

function addItem() {
  items.value.push(items.value.length + 1)
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}
</script>

<template>
  <button @click="addItem">添加</button>

  <TransitionGroup name="list" tag="ul">
    <li
      v-for="(item, index) in items"
      :key="item"
      @click="removeItem(index)"
    >
      {{ item }}
    </li>
  </TransitionGroup>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
```

### 路由过渡动画

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <Transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 无障碍模式 (a11y)

### 键盘导航支持

```vue
<script setup lang="ts">
import { ref } from 'vue'

const items = ['首页', '产品', '关于', '联系']
const focusedIndex = ref(0)

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, items.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectItem(focusedIndex.value)
      break
  }
}

function selectItem(index: number) {
  console.log('Selected:', items[index])
}
</script>

<template>
  <ul
    role="listbox"
    tabindex="0"
    @keydown="handleKeydown"
    aria-label="导航菜单"
  >
    <li
      v-for="(item, index) in items"
      :key="item"
      role="option"
      :aria-selected="focusedIndex === index"
      :class="{ focused: focusedIndex === index }"
      @click="selectItem(index)"
    >
      {{ item }}
    </li>
  </ul>
</template>

<style scoped>
.focused {
  background-color: #e0e0e0;
  outline: 2px solid #007bff;
}
</style>
```

### 焦点管理

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const dialogRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()

async function openDialog() {
  isOpen.value = true
  await nextTick()
  dialogRef.value?.focus()
}

function closeDialog() {
  isOpen.value = false
  triggerRef.value?.focus()
}
</script>

<template>
  <button ref="triggerRef" @click="openDialog">
    打开对话框
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
      class="dialog"
      @keydown.esc="closeDialog"
    >
      <h2 id="dialog-title">对话框标题</h2>
      <p>对话框内容</p>
      <button @click="closeDialog">关闭</button>
    </div>
  </Teleport>
</template>
```

---

## 组件基础模板

### 完整组件模板 (Composition API)

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { User } from '@/types'

// Props
const props = withDefaults(defineProps<{
  userId: string
  disabled?: boolean
  variant?: 'default' | 'compact'
}>(), {
  disabled: false,
  variant: 'default'
})

// Emits
const emit = defineEmits<{
  (e: 'update', value: User): void
  (e: 'delete'): void
}>()

// 响应式状态
const loading = ref(false)
const user = ref<User | null>(null)
const error = ref<string | null>(null)

// 计算属性
const displayName = computed(() =>
  user.value?.name ?? '未知用户'
)

const classes = computed(() => ({
  'user-card': true,
  'user-card--disabled': props.disabled,
  [`user-card--${props.variant}`]: true
}))

// 方法
async function fetchUser() {
  if (!props.userId) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/users/${props.userId}`)
    if (!response.ok) throw new Error('获取用户失败')
    user.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

function handleDelete() {
  if (confirm('确定要删除吗？')) {
    emit('delete')
  }
}

// 生命周期
onMounted(() => {
  fetchUser()
})

// 监听器
watch(() => props.userId, fetchUser)

// 暴露给父组件
defineExpose({
  refresh: fetchUser
})
</script>

<template>
  <div :class="classes">
    <!-- 加载状态 -->
    <div v-if="loading" class="user-card__loading">
      加载中...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="user-card__error" role="alert">
      {{ error }}
      <button @click="fetchUser">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <span class="user-card__name">{{ displayName }}</span>
      <button
        v-if="!disabled"
        class="user-card__delete"
        aria-label="删除用户"
        @click="handleDelete"
      >
        删除
      </button>
    </template>
  </div>
</template>

<style scoped>
.user-card {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.user-card--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.user-card--compact {
  padding: 0.5rem;
}

.user-card__loading,
.user-card__error {
  color: #666;
}

.user-card__error {
  color: #d32f2f;
}

.user-card__name {
  font-weight: 500;
}

.user-card__delete {
  margin-left: auto;
  color: #d32f2f;
}
</style>
```

---

## Vue Router 配置

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  }
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '应用名称'

  // 权限检查
  if (to.meta.requiresAuth) {
    const isAuthenticated = !!localStorage.getItem('token')
    if (!isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }

  next()
})
```

---

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
vue-tsc --noEmit

# 测试
npm test

# 测试覆盖率
npm run test:coverage

# 格式化
npm run format

# Lint 检查
npm run lint

# 预览构建结果
npm run preview
```

---

## 常见问题检查清单

### 组件设计
- [ ] Props 是否有完整的类型定义？
- [ ] 是否正确使用 withDefaults 设置默认值？
- [ ] Emits 是否有类型定义？
- [ ] 是否遵循智能/展示组件分离？

### 性能
- [ ] 大列表是否使用虚拟滚动？
- [ ] 重型组件是否懒加载？
- [ ] 是否避免在模板中使用复杂表达式？
- [ ] 静态数据是否使用 markRaw？

### 无障碍
- [ ] 交互元素是否可键盘访问？
- [ ] 是否有适当的 ARIA 标签？
- [ ] 焦点管理是否正确？
- [ ] 颜色对比度是否符合 WCAG？

### 状态管理
- [ ] 是否使用 storeToRefs 保持响应性？
- [ ] 异步操作是否有加载/错误状态？
- [ ] 敏感数据是否正确处理？

---

## Maintenance

- Sources: Vue 3 官方文档, Pinia 文档, VueUse, WCAG 2.1
- Last updated: 2025-01-22
- Known limits: 仅适用于 Vue 3 + Composition API
