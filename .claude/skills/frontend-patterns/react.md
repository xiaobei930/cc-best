# React 前端开发模式

React 18 + TypeScript 项目开发的专属模式，涵盖 Hooks、状态管理、Next.js 等。

## 项目结构

### 标准 React 项目
```
src/
├── components/          # 通用组件
│   ├── ui/              # 基础 UI 组件
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── layout/          # 布局组件
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── feature/         # 功能组件
│       └── UserCard.tsx
├── pages/               # 页面组件（或 app/ for Next.js）
│   └── Home.tsx
├── hooks/               # 自定义 Hooks
│   └── useAuth.ts
├── stores/              # 状态管理
│   └── userStore.ts
├── types/               # 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   └── format.ts
├── api/                 # API 请求
│   └── user.ts
├── App.tsx
└── main.tsx
```

### Next.js App Router 项目
```
app/
├── layout.tsx           # 根布局
├── page.tsx             # 首页
├── (auth)/              # 路由组
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── users/
│   ├── page.tsx         # /users
│   └── [id]/
│       └── page.tsx     # /users/:id
└── api/                 # API 路由
    └── users/
        └── route.ts
```

---

## 组件模式

### 展示组件 vs 容器组件

```tsx
// ✅ 展示组件：纯 UI，通过 props 接收数据
interface UserListProps {
  users: User[]
  loading?: boolean
  onSelect?: (user: User) => void
}

function UserList({ users, loading, onSelect }: UserListProps) {
  if (loading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <ul className="user-list">
      {users.map(user => (
        <li
          key={user.id}
          className="user-item"
          onClick={() => onSelect?.(user)}
        >
          {user.name}
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// ✅ 容器组件：管理数据和逻辑
function UserListContainer() {
  const { users, loading, selectUser } = useUserStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <UserList
      users={users}
      loading={loading}
      onSelect={selectUser}
    />
  )
}
```

### 组合模式（Compound Components）

```tsx
// Tabs 组合组件
interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === id

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')

  if (context.activeTab !== id) return null

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  )
}

// 使用
<Tabs defaultTab="home">
  <TabList>
    <Tab id="home">首页</Tab>
    <Tab id="profile">个人中心</Tab>
  </TabList>
  <TabPanel id="home">首页内容</TabPanel>
  <TabPanel id="profile">个人中心内容</TabPanel>
</Tabs>
```

### Render Props 模式

```tsx
interface MousePosition {
  x: number
  y: number
}

interface MouseTrackerProps {
  children: (position: MousePosition) => ReactNode
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return <>{children(position)}</>
}

// 使用
<MouseTracker>
  {({ x, y }) => (
    <div>鼠标位置: {x}, {y}</div>
  )}
</MouseTracker>
```

---

## 自定义 Hooks 模式

### 基础 Hook 模板

```typescript
import { useState, useEffect, useCallback } from 'react'

interface UseWindowSizeReturn {
  width: number
  height: number
}

export function useWindowSize(): UseWindowSizeReturn {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

### 数据获取 Hook

```typescript
import { useState, useEffect, useCallback } from 'react'

interface UseFetchReturn<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, loading, refetch: fetchData }
}
```

### 防抖 Hook

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

### 本地存储 Hook

```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
```

### 表单 Hook

```typescript
import { useState, useCallback, ChangeEvent, FormEvent } from 'react'

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (onSubmit: (values: T) => void) => (e: FormEvent) => void
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  setFieldError: (field: keyof T, error: string) => void
  reset: () => void
}

export function useForm<T extends Record<string, any>>(
  initialValues: T
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e: FormEvent) => {
      e.preventDefault()
      onSubmit(values)
    },
    [values]
  )

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset
  }
}
```

---

## 状态管理模式

### Zustand Store

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface UserState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          if (!response.ok) {
            throw new Error('登录失败')
          }

          const { user, token } = await response.json()
          set({ user, token, loading: false })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : '登录失败',
            loading: false
          })
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      setUser: (user) => {
        set({ user })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
)
```

### React Query (TanStack Query)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API 函数
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

async function createUser(data: CreateUserDTO): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

// 查询 Hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000 // 5 分钟
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id
  })
}

// 变更 Hook
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// 使用
function UserList() {
  const { data: users, isLoading, error } = useUsers()
  const createUser = useCreateUser()

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return (
    <div>
      <button onClick={() => createUser.mutate({ name: 'New User' })}>
        创建用户
      </button>
      <ul>
        {users?.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  )
}
```

---

## 性能优化模式

### React.memo

```tsx
interface UserCardProps {
  user: User
  onSelect: (user: User) => void
}

// ✅ 使用 memo 避免不必要的重渲染
const UserCard = memo(function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="user-card" onClick={() => onSelect(user)}>
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  )
})

// 自定义比较函数
const UserCard = memo(
  function UserCard({ user, onSelect }: UserCardProps) {
    // ...
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id
  }
)
```

### useMemo 和 useCallback

```tsx
function UserList({ users, filter }: { users: User[]; filter: string }) {
  // ✅ 缓存计算结果
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [users, filter])

  // ✅ 缓存回调函数
  const handleSelect = useCallback((user: User) => {
    console.log('Selected:', user)
  }, [])

  return (
    <ul>
      {filteredUsers.map(user => (
        <UserCard key={user.id} user={user} onSelect={handleSelect} />
      ))}
    </ul>
  )
}
```

### 懒加载

```tsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const HeavyChart = lazy(() => import('./components/HeavyChart'))

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>加载图表中...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

### 虚拟列表

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function VirtualList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  })

  return (
    <div
      ref={parentRef}
      style={{ height: '400px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 无障碍模式 (a11y)

### 焦点管理

```tsx
import { useRef, useEffect } from 'react'

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // 保存当前焦点
      previousFocusRef.current = document.activeElement as HTMLElement
      // 聚焦到模态框
      modalRef.current?.focus()
    } else {
      // 恢复焦点
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <h2 id="modal-title">对话框标题</h2>
      {children}
      <button onClick={onClose}>关闭</button>
    </div>
  )
}
```

### 键盘导航

```tsx
function Menu({ items }: { items: MenuItem[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        items[focusedIndex].onClick?.()
        break
    }
  }

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={focusedIndex === index ? 0 : -1}
          aria-selected={focusedIndex === index}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

---

## 错误边界

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // 可以发送到错误监控服务
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用
<ErrorBoundary fallback={<div>页面出错了</div>}>
  <MyComponent />
</ErrorBoundary>
```

---

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
tsc --noEmit

# 测试
npm test

# 测试覆盖率
npm run test:coverage

# 格式化
npm run format

# Lint 检查
npm run lint

# Next.js 构建
next build

# Next.js 导出静态站点
next export
```

---

## 常见问题检查清单

### 组件设计
- [ ] Props 是否有完整的 TypeScript 类型？
- [ ] 是否遵循展示/容器组件分离？
- [ ] 是否正确使用 children 和组合模式？
- [ ] 事件处理函数是否正确传递？

### Hooks
- [ ] 依赖数组是否完整？
- [ ] 是否避免在条件语句中调用 Hook？
- [ ] useCallback/useMemo 是否有必要？
- [ ] 清理函数是否正确实现？

### 性能
- [ ] 大列表是否使用虚拟滚动？
- [ ] 重型组件是否懒加载？
- [ ] 是否正确使用 React.memo？
- [ ] 是否避免不必要的状态更新？

### 无障碍
- [ ] 交互元素是否可键盘访问？
- [ ] 是否有适当的 ARIA 标签？
- [ ] 焦点管理是否正确？
- [ ] 颜色对比度是否符合 WCAG？

---

## Maintenance

- Sources: React 官方文档, TanStack Query, Zustand, WCAG 2.1
- Last updated: 2025-01-22
- Known limits: 仅适用于 React 18+ 函数组件
