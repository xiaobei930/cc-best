---
paths:
  - "**/*"
alwaysApply: true
---

# Java 安全规范 | Java Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供 Java 特定安全规范

## 禁止操作

```java
// ❌ 字符串拼接 SQL（致命注入漏洞）
stmt.executeQuery("SELECT * FROM users WHERE name = '" + username + "'");
// ✅ PreparedStatement 参数化
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
ps.setString(1, username);
// ✅ JPA 命名参数
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// ❌ MD5/SHA 存储密码
String hashed = DigestUtils.md5Hex(password);
// ✅ BCrypt（cost factor >= 10）
@Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(12); }

// ❌ 日志记录敏感信息
log.info("登录: 用户={}, 密码={}, 卡号={}", user, password, card);
// ✅ 脱敏处理
log.info("登录: 用户={}, 卡号={}****{}", user, card.substring(0,4), card.substring(12));
```

---

## 必须遵守

### Spring Security 配置

```java
@Configuration @EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(c -> c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            .headers(h -> h.contentSecurityPolicy(p -> p.policyDirectives("default-src 'self'"))
                .frameOptions(f -> f.deny()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .build();
    }
}
```

### 输入验证：@Valid + Bean Validation

```java
@PostMapping("/users")
public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
    return ResponseEntity.ok(userService.create(req));
}

public record CreateUserRequest(
    @NotBlank @Size(min = 2, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "只允许字母、数字、下划线")
    String username,
    @NotBlank @Email(message = "邮箱格式无效") String email,
    @NotBlank @Size(min = 8, max = 128) String password
) {}

// Service 层嵌套校验
@Service @Validated
public class UserService {
    public void updateProfile(@Valid UserProfile profile) { }
}
```

### JWT 安全处理

```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String secret;  // >= 256 bit，从配置中心读取

    public String generateToken(UserDetails user) {
        return Jwts.builder().subject(user.getUsername()).issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600_000))
            .signWith(Keys.hmacShaKeyFor(secret.getBytes(UTF_8))).compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(UTF_8)))
                .build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 验证失败: {}", e.getMessage());
            return false;
        }
    }
}
```

---

## 推荐做法

### XSS 防护

```java
// HtmlUtils 转义用户输入
String safe = HtmlUtils.htmlEscape(userInput);

// 全局安全响应头
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-XSS-Protection", "1; mode=block");
```

### 统一异常处理（防止堆栈泄露）

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handle(Exception ex) {
        log.error("服务异常", ex);  // 服务端记录完整堆栈
        // ❌ 返回 ex.getMessage() 给客户端
        // ✅ 返回通用错误信息
        return ResponseEntity.status(500)
            .body(new ErrorResponse("INTERNAL_ERROR", "服务器内部错误"));
    }
}
```

### 依赖安全扫描

```xml
<!-- OWASP Dependency-Check：CVSS >= 7 时构建失败 -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <configuration><failBuildOnCVSS>7</failBuildOnCVSS></configuration>
</plugin>
```
