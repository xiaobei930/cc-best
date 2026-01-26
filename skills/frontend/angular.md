# Angular 模式

本文档提供 Angular 17+ 的最佳实践，包含 Signals 和 Standalone Components。

## 项目结构

```
src/
├── app/
│   ├── core/                    # 核心模块（单例服务）
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                  # 共享模块（可复用组件）
│   │   ├── components/
│   │   │   ├── button/
│   │   │   └── input/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/                # 功能模块
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── users.routes.ts
│   │   └── dashboard/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── main.ts
```

---

## Standalone Components

### 基础组件

```typescript
// button.component.ts
import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'btn btn-' + variant()"
      [disabled]="disabled()"
      (click)="onClick.emit()"
    >
      <ng-content />
    </button>
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border-radius: 4px; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
  `]
})
export class ButtonComponent {
  // Signal inputs (Angular 17+)
  variant = input<'primary' | 'secondary'>('primary')
  disabled = input(false)

  // Output
  onClick = output<void>()
}
```

### 使用 Signal Inputs/Outputs

```typescript
// user-card.component.ts
import { Component, input, output, computed } from '@angular/core'
import { CommonModule } from '@angular/common'

interface User {
  id: string
  name: string
  email: string
  role: string
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
      <span class="badge">{{ roleLabel() }}</span>
      <button (click)="onEdit.emit(user())">编辑</button>
    </div>
  `
})
export class UserCardComponent {
  // Required input
  user = input.required<User>()

  // Computed signal
  roleLabel = computed(() => {
    const roleMap: Record<string, string> = {
      admin: '管理员',
      user: '用户',
      guest: '访客'
    }
    return roleMap[this.user().role] || this.user().role
  })

  // Output with payload
  onEdit = output<User>()
}
```

---

## Signals 状态管理

### 组件状态

```typescript
// counter.component.ts
import { Component, signal, computed, effect } from '@angular/core'

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Doubled: {{ doubled() }}</p>
      <button (click)="increment()">+</button>
      <button (click)="decrement()">-</button>
    </div>
  `
})
export class CounterComponent {
  // Writable signal
  count = signal(0)

  // Computed signal (只读，自动派生)
  doubled = computed(() => this.count() * 2)

  constructor() {
    // Effect (副作用，自动追踪依赖)
    effect(() => {
      console.log(`Count changed to ${this.count()}`)
    })
  }

  increment() {
    this.count.update(c => c + 1)
  }

  decrement() {
    this.count.set(this.count() - 1)
  }
}
```

### 服务状态

```typescript
// user.service.ts
import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'

interface User {
  id: string
  name: string
  email: string
}

@Injectable({ providedIn: 'root' })
export class UserService {
  // 私有可写 signal
  private _user = signal<User | null>(null)
  private _loading = signal(false)
  private _error = signal<string | null>(null)

  // 公开只读 signal
  user = this._user.asReadonly()
  loading = this._loading.asReadonly()
  error = this._error.asReadonly()

  // Computed
  isLoggedIn = computed(() => this._user() !== null)
  displayName = computed(() => this._user()?.name ?? 'Guest')

  constructor(private http: HttpClient) {}

  async login(email: string, password: string) {
    this._loading.set(true)
    this._error.set(null)

    try {
      const user = await this.http
        .post<User>('/api/auth/login', { email, password })
        .toPromise()
      this._user.set(user!)
    } catch (err: any) {
      this._error.set(err.message)
    } finally {
      this._loading.set(false)
    }
  }

  logout() {
    this._user.set(null)
  }
}
```

```typescript
// 使用服务
@Component({
  template: `
    @if (userService.loading()) {
      <app-spinner />
    } @else if (userService.isLoggedIn()) {
      <p>欢迎, {{ userService.displayName() }}</p>
      <button (click)="userService.logout()">退出</button>
    } @else {
      <app-login-form />
    }
  `
})
export class HeaderComponent {
  constructor(public userService: UserService) {}
}
```

---

## 新控制流语法 (Angular 17+)

### @if / @else

```html
<!-- 新语法 -->
@if (user()) {
  <p>欢迎, {{ user()!.name }}</p>
} @else if (loading()) {
  <app-spinner />
} @else {
  <p>请登录</p>
}

<!-- 旧语法（仍可用） -->
<ng-container *ngIf="user(); else loading">
  <p>欢迎, {{ user()?.name }}</p>
</ng-container>
```

### @for

```html
<!-- 新语法（必须有 track） -->
@for (item of items(); track item.id) {
  <div class="item">{{ item.name }}</div>
} @empty {
  <p>暂无数据</p>
}

<!-- 旧语法 -->
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>
```

### @switch

```html
@switch (status()) {
  @case ('loading') {
    <app-spinner />
  }
  @case ('error') {
    <app-error [message]="error()" />
  }
  @case ('success') {
    <app-data [data]="data()" />
  }
  @default {
    <p>未知状态</p>
  }
}
```

### @defer (延迟加载)

```html
<!-- 延迟加载组件 -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="skeleton">加载中...</div>
} @loading (minimum 500ms) {
  <app-spinner />
} @error {
  <p>加载失败</p>
}

<!-- 条件延迟 -->
@defer (when showChart()) {
  <app-chart />
}

<!-- 交互后加载 -->
@defer (on interaction) {
  <app-comments />
} @placeholder {
  <button>显示评论</button>
}
```

---

## 路由

### 路由配置

```typescript
// app.routes.ts
import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes')
      .then(m => m.USERS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
]
```

### 功能路由

```typescript
// features/users/users.routes.ts
import { Routes } from '@angular/router'

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/user-list/user-list.component')
      .then(m => m.UserListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
  }
]
```

### 路由参数

```typescript
// user-detail.component.ts
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  template: `
    @if (user()) {
      <h1>{{ user()!.name }}</h1>
    }
  `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private userService = inject(UserService)

  // 将 Observable 转换为 Signal
  private params = toSignal(this.route.params)

  user = signal<User | null>(null)

  async ngOnInit() {
    const id = this.params()?.['id']
    if (id) {
      const user = await this.userService.getUser(id)
      this.user.set(user)
    }
  }
}
```

---

## HTTP 和数据获取

### HTTP 服务

```typescript
// api.service.ts
import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient)
  private baseUrl = '/api'

  // GET 请求
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    let httpParams = new HttpParams()
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key])
        }
      })
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams })
    )

    if (!response.success) {
      throw new Error(response.error || '请求失败')
    }

    return response.data
  }

  // POST 请求
  async post<T>(path: string, body: any): Promise<T> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body)
    )

    if (!response.success) {
      throw new Error(response.error || '请求失败')
    }

    return response.data
  }

  // 分页请求
  async getPaginated<T>(
    path: string,
    page: number,
    pageSize: number,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(path, { page, pageSize, ...filters })
  }
}
```

### HTTP 拦截器

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = authService.token()

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return next(req)
}

// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { authInterceptor } from './core/interceptors/auth.interceptor'

export const appConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
}
```

---

## 表单

### Reactive Forms

```typescript
// login-form.component.ts
import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="email">邮箱</label>
        <input id="email" formControlName="email" type="email" />
        @if (form.controls.email.touched && form.controls.email.errors) {
          <span class="error">请输入有效的邮箱</span>
        }
      </div>

      <div class="field">
        <label for="password">密码</label>
        <input id="password" formControlName="password" type="password" />
        @if (form.controls.password.touched && form.controls.password.errors) {
          <span class="error">密码至少 6 个字符</span>
        }
      </div>

      <button type="submit" [disabled]="form.invalid || submitting()">
        {{ submitting() ? '登录中...' : '登录' }}
      </button>
    </form>
  `
})
export class LoginFormComponent {
  private fb = inject(FormBuilder)
  private authService = inject(AuthService)

  submitting = signal(false)

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  async onSubmit() {
    if (this.form.invalid) return

    this.submitting.set(true)
    try {
      await this.authService.login(
        this.form.value.email!,
        this.form.value.password!
      )
    } finally {
      this.submitting.set(false)
    }
  }
}
```

---

## 测试

### 组件测试

```typescript
// button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ButtonComponent } from './button.component'

describe('ButtonComponent', () => {
  let component: ButtonComponent
  let fixture: ComponentFixture<ButtonComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(ButtonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('应该创建', () => {
    expect(component).toBeTruthy()
  })

  it('应该应用正确的变体类', () => {
    fixture.componentRef.setInput('variant', 'secondary')
    fixture.detectChanges()

    const button = fixture.nativeElement.querySelector('button')
    expect(button.classList).toContain('btn-secondary')
  })

  it('点击时应该触发事件', () => {
    const spy = jest.spyOn(component.onClick, 'emit')

    const button = fixture.nativeElement.querySelector('button')
    button.click()

    expect(spy).toHaveBeenCalled()
  })
})
```

---

## 最佳实践

1. **使用 Standalone Components** - 不再需要 NgModule
2. **优先使用 Signals** - 替代 RxJS 管理组件状态
3. **使用新控制流语法** - @if, @for, @switch, @defer
4. **inject() 替代构造函数注入** - 更简洁
5. **懒加载路由和组件** - loadComponent, loadChildren
6. **使用 @defer 延迟加载** - 优化首屏性能
7. **Signal Inputs/Outputs** - 替代 @Input/@Output
8. **toSignal() 桥接 RxJS** - 将 Observable 转为 Signal
9. **OnPush 变更检测** - 配合 Signals 使用
10. **严格类型检查** - 启用 strict 模式
