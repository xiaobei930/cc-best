---
paths:
  - "**/*"
alwaysApply: true
---

# Java 测试规范 | Java Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供 Java 特定测试规范

## 禁止操作

```java
// ❌ 简单单元测试使用 @SpringBootTest（启动整个容器，极慢）
@SpringBootTest
class StringUtilsTest { @Test void testTrim() { /*...*/ } }
// ✅ 纯单元测试不需要 Spring 容器
class StringUtilsTest { @Test void testTrim() { /*...*/ } }

// ❌ verify 一切，测试变成实现的镜像
verify(repository).findById(1L); verify(mapper).toDto(any());
// ✅ 只 verify 有副作用的关键交互
verify(emailService).sendWelcomeEmail(eq("user@example.com"));

// ❌ 无意义命名: @Test void test1() { }
// ✅ 场景+预期: @Test void shouldReturnUser_whenIdExists() { }
```

---

## 必须遵守

### JUnit 5 注解：@Nested + @ParameterizedTest

```java
@Nested @DisplayName("用户注册")
class UserRegistrationTest {
    @Test @DisplayName("邮箱正确时应注册成功")
    void shouldRegister_whenEmailValid() { /* AAA 模式 */ }

    @ParameterizedTest
    @ValueSource(strings = {"", "invalid", "no@domain", "@example.com"})
    void shouldReject_whenEmailInvalid(String email) {
        assertThatThrownBy(() -> userService.register(email, "pass"))
            .isInstanceOf(InvalidEmailException.class);
    }
}
```

### 断言库：AssertJ 优先

```java
// ❌ assertEquals(3, result.size()); assertTrue(result.contains("admin"));
// ✅ AssertJ 流式断言（可读性强，错误信息清晰）
assertThat(result).hasSize(3).contains("admin").doesNotContain("guest")
    .extracting(User::getName).containsExactlyInAnyOrder("Alice", "Bob", "Charlie");
```

### Mockito：@ExtendWith + ArgumentCaptor

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepo;
    @Mock private PaymentGateway gateway;
    @InjectMocks private OrderService service;

    @Test void shouldCapturePayment_whenOrderPlaced() {
        var captor = ArgumentCaptor.forClass(PaymentRequest.class);
        when(orderRepo.save(any())).thenReturn(new Order(1L));
        service.placeOrder(new OrderRequest("SKU-001", 2, BigDecimal.valueOf(99.99)));
        verify(gateway).charge(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("199.98");
    }
}
```

---

## 推荐做法

### Spring Boot 分层测试切片

```java
@WebMvcTest(UserController.class)  // 仅加载 Web 层
class UserControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService;
    @Test void shouldReturn200() throws Exception {
        when(userService.findById(1L)).thenReturn(Optional.of(testUser()));
        mockMvc.perform(get("/api/users/1")).andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("张三"));
    }
}

@DataJpaTest  // 仅加载 JPA 层 + 嵌入式数据库
class UserRepositoryTest {
    @Autowired private UserRepository repo;
    @Test void shouldFindByEmail() {
        repo.save(new User("test@example.com", "测试用户"));
        assertThat(repo.findByEmail("test@example.com")).isPresent();
    }
}
```

### Testcontainers 集成测试隔离

```java
@SpringBootTest @Testcontainers
class OrderIntegrationTest {
    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.data.redis.host", redis::getHost);
        r.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
    }
    @Test void shouldPersistOrderAndUpdateCache() { /* 真实基础设施 */ }
}
```
