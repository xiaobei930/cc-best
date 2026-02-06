---
paths:
  - "**/*"
alwaysApply: true
---

# 嵌入式测试规范 | Embedded Testing Rules

> 本文件扩展 [common/testing.md](../common/testing.md)，提供嵌入式特定测试规范

## 禁止操作

### 在真实硬件上运行未经模拟器验证的测试

```c
// ❌ 直接在目标板上调试未验证的逻辑
void test_motor_control(void) {
    motor_set_speed(MAX_RPM);  // 未经模拟器验证，可能烧毁电机
    TEST_ASSERT_EQUAL(MAX_RPM, motor_get_speed());
}

// ✅ 先通过 HAL Mock 验证逻辑，再上板测试
void test_motor_control(void) {
    hal_motor_mock_init();
    motor_set_speed(MAX_RPM);
    TEST_ASSERT_EQUAL(MAX_RPM, hal_motor_mock_get_last_speed());
}
```

### 测试中直接操作寄存器

```c
// ❌ 测试代码直接访问硬件寄存器，无法在主机端运行
void test_adc_read(void) {
    ADC1->CR |= ADC_CR_ADSTART;
    while (!(ADC1->ISR & ADC_ISR_EOC));
    TEST_ASSERT_EQUAL_UINT16(0x0FFF, ADC1->DR);
}

// ✅ 通过 HAL 抽象层测试，可 Mock 替换
void test_adc_read(void) {
    hal_adc_mock_set_value(ADC_CHANNEL_0, 2048);
    uint16_t value = hal_adc_read(ADC_CHANNEL_0);
    TEST_ASSERT_EQUAL_UINT16(2048, value);
}
```

### 忽略 FreeRTOS 任务同步测试

```c
// ❌ 未验证多任务竞争条件
void test_shared_buffer(void) {
    buffer_write(data, len);
    TEST_ASSERT_EQUAL_MEMORY(data, buffer_read(), len);
}

// ✅ 使用信号量验证任务间同步
void test_shared_buffer_with_mutex(void) {
    xSemaphoreGive(s_test_sync);  // 触发写任务
    vTaskDelay(pdMS_TO_TICKS(50));
    TEST_ASSERT_EQUAL(pdTRUE, xSemaphoreTake(s_write_done, pdMS_TO_TICKS(100)));
    TEST_ASSERT_EQUAL_MEMORY(expected, buffer_read(), len);
}
```

---

## 必须遵守

### Unity 测试框架标准结构

使用 Ceedling 管理构建，Unity 编写断言：

```c
#include "unity.h"
#include "mock_hal_gpio.h"  // CMock 自动生成的 Mock

void setUp(void) {
    // 每个测试前初始化
}

void tearDown(void) {
    // 每个测试后清理
}

void test_led_on_should_set_gpio_high(void) {
    // Arrange - CMock 期望设置
    hal_gpio_write_Expect(GPIO_PIN_LED, GPIO_LEVEL_HIGH);

    // Act
    led_turn_on();

    // Assert - CMock 自动验证期望是否满足
}

void test_sensor_read_should_retry_on_failure(void) {
    // Arrange - 第一次失败，第二次成功
    hal_i2c_read_ExpectAndReturn(SENSOR_ADDR, NULL, 2, ESP_ERR_TIMEOUT);
    hal_i2c_read_IgnoreArg_data();
    hal_i2c_read_ExpectAndReturn(SENSOR_ADDR, NULL, 2, ESP_OK);
    hal_i2c_read_IgnoreArg_data();
    hal_i2c_read_ReturnMemThruPtr_data(expected_data, 2);

    // Act
    esp_err_t err = sensor_read(&result);

    // Assert
    TEST_ASSERT_EQUAL(ESP_OK, err);
    TEST_ASSERT_EQUAL_INT16(expected_value, result);
}
```

### 覆盖率测量 (gcov)

嵌入式项目在主机端编译时启用覆盖率：

```yaml
# project.yml (Ceedling 配置)
:gcov:
  :reports:
    - HtmlDetailed
  :gcovr:
    :report_root: "../../"
    :html_medium_threshold: 75
    :html_high_threshold: 90
```

```bash
# 执行测试并生成覆盖率报告
ceedling gcov:all utils:gcov
```

### 边界条件必须覆盖

```c
// 内存耗尽场景
void test_alloc_fails_gracefully(void) {
    hal_malloc_mock_set_fail(true);  // 模拟 malloc 返回 NULL
    esp_err_t err = module_init();
    TEST_ASSERT_EQUAL(ESP_ERR_NO_MEM, err);
}

// 看门狗超时场景
void test_watchdog_reset_on_task_hang(void) {
    wdt_mock_enable(WDT_TIMEOUT_MS);
    simulate_task_hang(WDT_TIMEOUT_MS + 100);
    TEST_ASSERT_TRUE(wdt_mock_was_triggered());
}
```

---

## 推荐做法

### HIL 与模拟器测试分层

| 测试层级   | 工具            | 覆盖目标             | 执行频率   |
| ---------- | --------------- | -------------------- | ---------- |
| 单元测试   | Unity + CMock   | 业务逻辑、算法       | 每次提交   |
| 集成测试   | Ceedling        | 模块间交互           | 每次提交   |
| 模拟器测试 | QEMU / Renode   | 外设驱动、启动流程   | CI/CD 管道 |
| HIL 测试   | 真实硬件 + 夹具 | 电气特性、时序、功耗 | 版本发布前 |

### QEMU 模拟器自动化测试

```bash
# 使用 QEMU 运行 ESP32 固件测试
qemu-system-xtensa -machine esp32 \
  -nographic \
  -serial mon:stdio \
  -drive file=build/flash_image.bin,if=mtd,format=raw \
  -no-reboot | tee test_output.log

# 解析测试结果
grep -E "(PASS|FAIL|IGNORE)" test_output.log
```

### FreeRTOS 任务测试策略

```c
// 使用 vTaskDelay 模拟时间推进，验证周期性任务行为
void test_periodic_sensor_sampling(void) {
    sensor_task_start(SAMPLE_INTERVAL_MS);

    // 等待 3 个采样周期
    vTaskDelay(pdMS_TO_TICKS(SAMPLE_INTERVAL_MS * 3 + 50));

    TEST_ASSERT_INT_WITHIN(1, 3, sensor_get_sample_count());
}
```
