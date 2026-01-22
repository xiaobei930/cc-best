# Java 后端开发模式

Java 后端开发的专属模式，涵盖 Spring Boot、Quarkus 等框架。

## 项目结构

### Spring Boot 项目
```
project/
├── src/main/java/com/example/app/
│   ├── Application.java             # 入口类
│   ├── config/
│   │   └── WebConfig.java
│   ├── controller/
│   │   └── UserController.java
│   ├── service/
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── entity/
│   │   └── User.java
│   ├── dto/
│   │   ├── UserCreateDTO.java
│   │   └── UserResponseDTO.java
│   ├── exception/
│   │   ├── AppException.java
│   │   └── GlobalExceptionHandler.java
│   └── util/
│       └── LoggerUtil.java
├── src/main/resources/
│   ├── application.yml
│   └── application-dev.yml
├── src/test/java/
│   └── com/example/app/
├── pom.xml
└── README.md
```

---

## 错误处理

### 自定义异常

```java
// exception/AppException.java
public class AppException extends RuntimeException {
    private final int statusCode;
    private final String code;

    public AppException(String message, int statusCode, String code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }

    // Getters
}

// exception/NotFoundException.java
public class NotFoundException extends AppException {
    public NotFoundException(String resource) {
        super(resource + " 未找到", 404, "NOT_FOUND");
    }
}

// exception/ValidationException.java
public class ValidationException extends AppException {
    public ValidationException(String message) {
        super(message, 400, "VALIDATION_ERROR");
    }
}
```

### 全局异常处理

```java
// exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        logger.warn("业务异常: {}", ex.getMessage());

        return ResponseEntity
            .status(ex.getStatusCode())
            .body(ApiResponse.error(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("验证失败");

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        logger.error("未处理异常", ex);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "服务器内部错误"));
    }
}
```

---

## 统一响应格式

```java
// dto/ApiResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorInfo error;
    private Meta meta;

    @Data
    @AllArgsConstructor
    public static class ErrorInfo {
        private String code;
        private String message;
    }

    @Data
    @AllArgsConstructor
    public static class Meta {
        private int page;
        private int limit;
        private long total;
    }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    public static <T> ApiResponse<T> success(T data, int page, int limit, long total) {
        ApiResponse<T> response = success(data);
        response.setMeta(new Meta(page, limit, total));
        return response;
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(new ErrorInfo(code, message));
        return response;
    }
}
```

---

## Controller 模板

```java
// controller/UserController.java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponseDTO> create(@Valid @RequestBody UserCreateDTO dto) {
        UserResponseDTO user = userService.create(dto);
        return ApiResponse.success(user);
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getById(@PathVariable Long id) {
        UserResponseDTO user = userService.findById(id)
            .orElseThrow(() -> new NotFoundException("用户"));
        return ApiResponse.success(user);
    }

    @GetMapping
    public ApiResponse<List<UserResponseDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        Page<UserResponseDTO> result = userService.findAll(page, limit);
        return ApiResponse.success(
            result.getContent(),
            page,
            limit,
            result.getTotalElements()
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO dto) {
        UserResponseDTO user = userService.update(id, dto);
        return ApiResponse.success(user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

---

## Service 模板

```java
// service/impl/UserServiceImpl.java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponseDTO create(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ValidationException("邮箱已存在");
        }

        User user = User.builder()
            .email(dto.getEmail())
            .name(dto.getName())
            .password(passwordEncoder.encode(dto.getPassword()))
            .build();

        user = userRepository.save(user);
        return toResponseDTO(user);
    }

    @Override
    public Optional<UserResponseDTO> findById(Long id) {
        return userRepository.findById(id)
            .map(this::toResponseDTO);
    }

    @Override
    public Page<UserResponseDTO> findAll(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        return userRepository.findAll(pageable)
            .map(this::toResponseDTO);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserResponseDTO update(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("用户"));

        user.setName(dto.getName());
        user = userRepository.save(user);

        return toResponseDTO(user);
    }

    private UserResponseDTO toResponseDTO(User user) {
        return UserResponseDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
```

---

## 缓存配置

```java
// config/CacheConfig.java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}

// 使用缓存
@Service
public class UserServiceImpl implements UserService {

    @Override
    @Cacheable(value = "users", key = "#id")
    public Optional<UserResponseDTO> findById(Long id) {
        return userRepository.findById(id)
            .map(this::toResponseDTO);
    }

    @Override
    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
```

---

## 事务处理

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponseDTO createOrder(OrderCreateDTO dto) {
        // 创建订单
        Order order = Order.builder()
            .userId(dto.getUserId())
            .status(OrderStatus.PENDING)
            .build();
        order = orderRepository.save(order);

        // 创建订单项并更新库存
        for (OrderItemDTO itemDto : dto.getItems()) {
            // 检查并更新库存
            int updated = productRepository.decrementStock(
                itemDto.getProductId(),
                itemDto.getQuantity()
            );

            if (updated == 0) {
                throw new ValidationException("库存不足: " + itemDto.getProductId());
            }

            // 创建订单项
            OrderItem item = OrderItem.builder()
                .orderId(order.getId())
                .productId(itemDto.getProductId())
                .quantity(itemDto.getQuantity())
                .price(itemDto.getPrice())
                .build();
            orderItemRepository.save(item);
        }

        return toResponseDTO(order);
    }
}
```

---

## 测试模板

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void createUser_Success() throws Exception {
        UserCreateDTO dto = new UserCreateDTO("test@example.com", "Test", "password123");
        UserResponseDTO response = new UserResponseDTO(1L, "test@example.com", "Test", LocalDateTime.now());

        when(userService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    @Test
    void getUser_NotFound() throws Exception {
        when(userService.findById(anyLong())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/users/999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }
}
```

---

## 常用命令

```bash
# 开发运行
./mvnw spring-boot:run
./gradlew bootRun

# 构建
./mvnw clean package
./gradlew build

# 测试
./mvnw test
./gradlew test

# 代码检查
./mvnw checkstyle:check
./mvnw spotbugs:check
```

---

## application.yml 示例

```yaml
spring:
  application:
    name: my-app

  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

  data:
    redis:
      host: localhost
      port: 6379

logging:
  level:
    root: INFO
    com.example: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when_authorized
```
