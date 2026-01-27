# Go 后端开发模式

Go 后端开发的专属模式，涵盖 Gin、Echo、Fiber 等框架。

## 项目结构

### 标准 Go 项目布局

```
project/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口
├── internal/
│   ├── config/
│   │   └── config.go            # 配置管理
│   ├── handler/
│   │   └── user_handler.go      # HTTP 处理器
│   ├── service/
│   │   └── user_service.go      # 业务逻辑
│   ├── repository/
│   │   └── user_repository.go   # 数据访问
│   ├── model/
│   │   └── user.go              # 数据模型
│   └── middleware/
│       └── auth.go              # 中间件
├── pkg/
│   └── logger/
│       └── logger.go            # 公共包
├── api/
│   └── openapi.yaml             # API 文档
├── go.mod
├── go.sum
└── README.md
```

---

## 错误处理

### 自定义错误类型

```go
// internal/apperror/error.go
package apperror

import "fmt"

type AppError struct {
    Code       string `json:"code"`
    Message    string `json:"message"`
    StatusCode int    `json:"-"`
    Err        error  `json:"-"`
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %v", e.Message, e.Err)
    }
    return e.Message
}

func (e *AppError) Unwrap() error {
    return e.Err
}

func NewNotFound(resource string) *AppError {
    return &AppError{
        Code:       "NOT_FOUND",
        Message:    fmt.Sprintf("%s 未找到", resource),
        StatusCode: 404,
    }
}

func NewValidation(message string) *AppError {
    return &AppError{
        Code:       "VALIDATION_ERROR",
        Message:    message,
        StatusCode: 400,
    }
}

func NewUnauthorized(message string) *AppError {
    if message == "" {
        message = "未授权"
    }
    return &AppError{
        Code:       "UNAUTHORIZED",
        Message:    message,
        StatusCode: 401,
    }
}

func NewInternal(err error) *AppError {
    return &AppError{
        Code:       "INTERNAL_ERROR",
        Message:    "服务器内部错误",
        StatusCode: 500,
        Err:        err,
    }
}
```

### 全局错误处理中间件 (Gin)

```go
// internal/middleware/error.go
package middleware

import (
    "errors"
    "net/http"

    "github.com/gin-gonic/gin"
    "myapp/internal/apperror"
    "myapp/pkg/logger"
)

func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()

        if len(c.Errors) == 0 {
            return
        }

        err := c.Errors.Last().Err
        log := logger.FromContext(c.Request.Context())

        var appErr *apperror.AppError
        if errors.As(err, &appErr) {
            log.Warn("业务错误",
                "code", appErr.Code,
                "message", appErr.Message,
            )
            c.JSON(appErr.StatusCode, gin.H{
                "success": false,
                "error": gin.H{
                    "code":    appErr.Code,
                    "message": appErr.Message,
                },
            })
            return
        }

        log.Error("未处理错误", "error", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "error": gin.H{
                "code":    "INTERNAL_ERROR",
                "message": "服务器内部错误",
            },
        })
    }
}
```

---

## 统一响应格式

```go
// internal/response/response.go
package response

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *ErrorInfo  `json:"error,omitempty"`
    Meta    *Meta       `json:"meta,omitempty"`
}

type ErrorInfo struct {
    Code    string `json:"code"`
    Message string `json:"message"`
}

type Meta struct {
    Page  int   `json:"page"`
    Limit int   `json:"limit"`
    Total int64 `json:"total"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{
        Success: true,
        Data:    data,
    })
}

func Created(c *gin.Context, data interface{}) {
    c.JSON(http.StatusCreated, Response{
        Success: true,
        Data:    data,
    })
}

func SuccessWithMeta(c *gin.Context, data interface{}, page, limit int, total int64) {
    c.JSON(http.StatusOK, Response{
        Success: true,
        Data:    data,
        Meta: &Meta{
            Page:  page,
            Limit: limit,
            Total: total,
        },
    })
}

func NoContent(c *gin.Context) {
    c.Status(http.StatusNoContent)
}
```

---

## Handler 模板 (Gin)

```go
// internal/handler/user_handler.go
package handler

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "myapp/internal/apperror"
    "myapp/internal/model"
    "myapp/internal/response"
    "myapp/internal/service"
)

type UserHandler struct {
    userService *service.UserService
}

func NewUserHandler(us *service.UserService) *UserHandler {
    return &UserHandler{userService: us}
}

func (h *UserHandler) RegisterRoutes(r *gin.RouterGroup) {
    users := r.Group("/users")
    {
        users.POST("", h.Create)
        users.GET("/:id", h.GetByID)
        users.GET("", h.List)
        users.PUT("/:id", h.Update)
        users.DELETE("/:id", h.Delete)
    }
}

type CreateUserRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Password string `json:"password" binding:"required,min=8"`
}

func (h *UserHandler) Create(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        _ = c.Error(apperror.NewValidation(err.Error()))
        return
    }

    user, err := h.userService.Create(c.Request.Context(), &model.CreateUserInput{
        Email:    req.Email,
        Name:     req.Name,
        Password: req.Password,
    })
    if err != nil {
        _ = c.Error(err)
        return
    }

    response.Created(c, user)
}

func (h *UserHandler) GetByID(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        _ = c.Error(apperror.NewValidation("无效的 ID"))
        return
    }

    user, err := h.userService.GetByID(c.Request.Context(), id)
    if err != nil {
        _ = c.Error(err)
        return
    }

    response.Success(c, user)
}

func (h *UserHandler) List(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

    users, total, err := h.userService.List(c.Request.Context(), page, limit)
    if err != nil {
        _ = c.Error(err)
        return
    }

    response.SuccessWithMeta(c, users, page, limit, total)
}

func (h *UserHandler) Update(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        _ = c.Error(apperror.NewValidation("无效的 ID"))
        return
    }

    var req model.UpdateUserInput
    if err := c.ShouldBindJSON(&req); err != nil {
        _ = c.Error(apperror.NewValidation(err.Error()))
        return
    }

    user, err := h.userService.Update(c.Request.Context(), id, &req)
    if err != nil {
        _ = c.Error(err)
        return
    }

    response.Success(c, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        _ = c.Error(apperror.NewValidation("无效的 ID"))
        return
    }

    if err := h.userService.Delete(c.Request.Context(), id); err != nil {
        _ = c.Error(err)
        return
    }

    response.NoContent(c)
}
```

---

## Service 模板

```go
// internal/service/user_service.go
package service

import (
    "context"

    "myapp/internal/apperror"
    "myapp/internal/model"
    "myapp/internal/repository"
    "golang.org/x/crypto/bcrypt"
)

type UserService struct {
    userRepo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
    return &UserService{userRepo: repo}
}

func (s *UserService) Create(ctx context.Context, input *model.CreateUserInput) (*model.User, error) {
    // 检查邮箱是否已存在
    exists, err := s.userRepo.ExistsByEmail(ctx, input.Email)
    if err != nil {
        return nil, apperror.NewInternal(err)
    }
    if exists {
        return nil, apperror.NewValidation("邮箱已存在")
    }

    // 哈希密码
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, apperror.NewInternal(err)
    }

    user := &model.User{
        Email:    input.Email,
        Name:     input.Name,
        Password: string(hashedPassword),
    }

    if err := s.userRepo.Create(ctx, user); err != nil {
        return nil, apperror.NewInternal(err)
    }

    return user, nil
}

func (s *UserService) GetByID(ctx context.Context, id int64) (*model.User, error) {
    user, err := s.userRepo.FindByID(ctx, id)
    if err != nil {
        return nil, apperror.NewInternal(err)
    }
    if user == nil {
        return nil, apperror.NewNotFound("用户")
    }
    return user, nil
}

func (s *UserService) List(ctx context.Context, page, limit int) ([]*model.User, int64, error) {
    offset := (page - 1) * limit
    return s.userRepo.FindAll(ctx, offset, limit)
}

func (s *UserService) Update(ctx context.Context, id int64, input *model.UpdateUserInput) (*model.User, error) {
    user, err := s.userRepo.FindByID(ctx, id)
    if err != nil {
        return nil, apperror.NewInternal(err)
    }
    if user == nil {
        return nil, apperror.NewNotFound("用户")
    }

    user.Name = input.Name
    if err := s.userRepo.Update(ctx, user); err != nil {
        return nil, apperror.NewInternal(err)
    }

    return user, nil
}

func (s *UserService) Delete(ctx context.Context, id int64) error {
    return s.userRepo.Delete(ctx, id)
}
```

---

## 配置管理

```go
// internal/config/config.go
package config

import (
    "fmt"
    "os"
    "strconv"
)

type Config struct {
    Env  string
    Port int
    Host string

    // 数据库
    DatabaseURL string

    // Redis
    RedisURL string

    // JWT
    JWTSecret    string
    JWTExpiresIn string

    // 日志
    LogLevel string
}

func Load() (*Config, error) {
    cfg := &Config{
        Env:          getEnv("ENV", "development"),
        Port:         getEnvInt("PORT", 8080),
        Host:         getEnv("HOST", "0.0.0.0"),
        DatabaseURL:  mustGetEnv("DATABASE_URL"),
        RedisURL:     getEnv("REDIS_URL", ""),
        JWTSecret:    mustGetEnv("JWT_SECRET"),
        JWTExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
        LogLevel:     getEnv("LOG_LEVEL", "info"),
    }

    if len(cfg.JWTSecret) < 32 {
        return nil, fmt.Errorf("JWT_SECRET 必须至少 32 字符")
    }

    return cfg, nil
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
    if value := os.Getenv(key); value != "" {
        if i, err := strconv.Atoi(value); err == nil {
            return i
        }
    }
    return defaultValue
}

func mustGetEnv(key string) string {
    value := os.Getenv(key)
    if value == "" {
        panic(fmt.Sprintf("必需的环境变量 %s 未设置", key))
    }
    return value
}
```

---

## 日志配置

```go
// pkg/logger/logger.go
package logger

import (
    "context"
    "log/slog"
    "os"
)

type ctxKey struct{}

func New(level string) *slog.Logger {
    var logLevel slog.Level
    switch level {
    case "debug":
        logLevel = slog.LevelDebug
    case "warn":
        logLevel = slog.LevelWarn
    case "error":
        logLevel = slog.LevelError
    default:
        logLevel = slog.LevelInfo
    }

    opts := &slog.HandlerOptions{
        Level: logLevel,
    }

    handler := slog.NewJSONHandler(os.Stdout, opts)
    return slog.New(handler)
}

func WithContext(ctx context.Context, logger *slog.Logger) context.Context {
    return context.WithValue(ctx, ctxKey{}, logger)
}

func FromContext(ctx context.Context) *slog.Logger {
    if logger, ok := ctx.Value(ctxKey{}).(*slog.Logger); ok {
        return logger
    }
    return slog.Default()
}
```

---

## 优雅关闭

```go
// cmd/server/main.go
package main

import (
    "context"
    "errors"
    "fmt"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "myapp/internal/config"
    "myapp/pkg/logger"
)

func main() {
    cfg, err := config.Load()
    if err != nil {
        panic(err)
    }

    log := logger.New(cfg.LogLevel)

    if cfg.Env == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    router := gin.New()
    // 设置路由...

    srv := &http.Server{
        Addr:    fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
        Handler: router,
    }

    // 启动服务器
    go func() {
        log.Info("服务器启动", "addr", srv.Addr)
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Error("服务器错误", "error", err)
            os.Exit(1)
        }
    }()

    // 优雅关闭
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Info("正在关闭服务器...")

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Error("服务器强制关闭", "error", err)
    }

    log.Info("服务器已退出")
}
```

---

## 测试模板

```go
package handler_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "myapp/internal/handler"
    "myapp/internal/model"
)

type MockUserService struct {
    mock.Mock
}

func (m *MockUserService) Create(ctx context.Context, input *model.CreateUserInput) (*model.User, error) {
    args := m.Called(ctx, input)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*model.User), args.Error(1)
}

func TestCreateUser(t *testing.T) {
    gin.SetMode(gin.TestMode)

    mockService := new(MockUserService)
    mockService.On("Create", mock.Anything, mock.Anything).Return(&model.User{
        ID:    1,
        Email: "test@example.com",
        Name:  "Test",
    }, nil)

    h := handler.NewUserHandler(mockService)

    router := gin.New()
    api := router.Group("/api/v1")
    h.RegisterRoutes(api)

    body := `{"email":"test@example.com","name":"Test","password":"password123"}`
    req := httptest.NewRequest(http.MethodPost, "/api/v1/users", bytes.NewBufferString(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)

    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.True(t, response["success"].(bool))
}
```

---

## 常用命令

```bash
# 开发运行
go run cmd/server/main.go
air  # 热重载

# 构建
go build -o bin/server cmd/server/main.go
CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/server cmd/server/main.go

# 测试
go test ./...
go test -v -cover ./...
go test -race ./...

# 代码检查
go vet ./...
golangci-lint run
staticcheck ./...

# 依赖管理
go mod tidy
go mod download
```

---

## Go 惯用模式

### 核心原则

#### 1. 简洁优于技巧

```go
// ✅ 好：清晰直接
func GetUser(id string) (*User, error) {
    user, err := db.FindUser(id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }
    return user, nil
}

// ❌ 差：过于复杂
func GetUser(id string) (*User, error) {
    return func() (*User, error) {
        if u, e := db.FindUser(id); e == nil { return u, nil }
        else { return nil, e }
    }()
}
```

#### 2. 零值可用

设计类型使其零值可直接使用，无需显式初始化。

```go
// ✅ 好：零值可用
type Counter struct {
    mu    sync.Mutex
    count int  // 零值是 0，可直接使用
}

var buf bytes.Buffer  // 零值可直接 WriteString

// ❌ 差：需要初始化
type BadCounter struct {
    counts map[string]int  // nil map 会 panic
}
```

#### 3. 接受接口，返回结构体

```go
// ✅ 好：接受接口，返回具体类型
func ProcessData(r io.Reader) (*Result, error) {
    data, err := io.ReadAll(r)
    if err != nil {
        return nil, err
    }
    return &Result{Data: data}, nil
}
```

---

### 错误处理惯用法

#### 错误包装

```go
// ✅ 总是添加上下文
if err != nil {
    return nil, fmt.Errorf("load config %s: %w", path, err)
}

// ✅ 使用 errors.Is/As 检查
if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrNotFound
}

var validationErr *ValidationError
if errors.As(err, &validationErr) {
    log.Printf("字段 %s 验证失败", validationErr.Field)
}
```

#### 不要忽略错误

```go
// ❌ 差：忽略错误
result, _ := doSomething()

// ✅ 好：处理或明确说明
result, err := doSomething()
if err != nil {
    return err
}
```

---

### 并发模式

#### Worker Pool

```go
func WorkerPool(jobs <-chan Job, results chan<- Result, numWorkers int) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }
    wg.Wait()
    close(results)
}
```

#### errgroup 协调 goroutine

```go
import "golang.org/x/sync/errgroup"

func FetchAll(ctx context.Context, urls []string) ([][]byte, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([][]byte, len(urls))

    for i, url := range urls {
        i, url := i, url  // 捕获循环变量
        g.Go(func() error {
            data, err := fetch(ctx, url)
            if err != nil {
                return err
            }
            results[i] = data
            return nil
        })
    }

    if err := g.Wait(); err != nil {
        return nil, err
    }
    return results, nil
}
```

#### 避免 Goroutine 泄漏

```go
// ❌ 差：context 取消时 goroutine 泄漏
func leakyFetch(url string) <-chan []byte {
    ch := make(chan []byte)
    go func() {
        data, _ := fetch(url)
        ch <- data  // 无接收者时永远阻塞
    }()
    return ch
}

// ✅ 好：正确处理取消
func safeFetch(ctx context.Context, url string) <-chan []byte {
    ch := make(chan []byte, 1)  // 带缓冲
    go func() {
        data, err := fetch(url)
        if err != nil {
            return
        }
        select {
        case ch <- data:
        case <-ctx.Done():
        }
    }()
    return ch
}
```

#### Mutex 正确用法

```go
// ✅ 好：defer 确保解锁
mu.Lock()
defer mu.Unlock()
doSomething()

// ❌ 差：可能忘记解锁
mu.Lock()
doSomething()
mu.Unlock()  // panic 时不会执行
```

---

### 性能优化

#### 预分配 Slice

```go
// ❌ 差：多次扩容
var results []Result
for _, item := range items {
    results = append(results, process(item))
}

// ✅ 好：一次分配
results := make([]Result, 0, len(items))
for _, item := range items {
    results = append(results, process(item))
}
```

#### 字符串拼接

```go
// ❌ 差：多次分配
var result string
for _, s := range parts {
    result += s
}

// ✅ 好：strings.Builder
var sb strings.Builder
for _, s := range parts {
    sb.WriteString(s)
}
return sb.String()

// ✅ 最佳：标准库
return strings.Join(parts, "")
```

#### sync.Pool 复用对象

```go
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func ProcessRequest(data []byte) []byte {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufferPool.Put(buf)
    }()
    buf.Write(data)
    return buf.Bytes()
}
```

---

### 惯用法速查表

| 惯用法               | 说明                             |
| -------------------- | -------------------------------- |
| 接受接口，返回结构体 | 函数参数用接口，返回值用具体类型 |
| 错误即值             | 错误是普通值，不是异常           |
| 通过通信共享内存     | 用 channel 协调 goroutine        |
| 零值可用             | 类型设计应让零值有意义           |
| 少量复制优于少量依赖 | 避免不必要的外部依赖             |
| 清晰优于技巧         | 可读性优先                       |
| 早返回               | 先处理错误，保持主路径清晰       |

---

### 反模式避免

```go
// ❌ 长函数中的裸返回
func process() (result int, err error) {
    // ... 50 行 ...
    return  // 返回什么？
}

// ❌ 用 panic 做流程控制
func GetUser(id string) *User {
    user, err := db.Find(id)
    if err != nil {
        panic(err)  // 不要这样做
    }
    return user
}

// ❌ context 放在结构体里
type Request struct {
    ctx context.Context  // context 应该是第一个参数
    ID  string
}

// ✅ context 作为第一个参数
func Process(ctx context.Context, id string) error {
    // ...
}

// ❌ 循环中 defer
for _, path := range paths {
    f, _ := os.Open(path)
    defer f.Close()  // 资源累积到函数结束
}

// ✅ 闭包隔离
for _, path := range paths {
    func() {
        f, _ := os.Open(path)
        defer f.Close()
        process(f)
    }()
}
```
