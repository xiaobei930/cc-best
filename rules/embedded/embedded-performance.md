---
paths:
  - "**/*"
alwaysApply: true
---

# 嵌入式性能优化规范 | Embedded Performance Rules

> 本文件扩展 [common/performance.md](../common/performance.md)，提供嵌入式固件特定性能规范

## 禁止操作

### 在 ISR 中执行耗时操作

```c
// ❌ ISR 内执行日志打印和复杂计算，阻塞中断响应
void IRAM_ATTR gpio_isr_handler(void *arg) {
    ESP_LOGI(TAG, "中断触发");  // 日志涉及 Flash 读取和锁操作
    process_sensor_data();       // 耗时计算
}

// ✅ ISR 仅做标记，交由任务处理
void IRAM_ATTR gpio_isr_handler(void *arg) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xSemaphoreGiveFromISR(s_gpio_sem, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

### 频繁使用 malloc/free

```c
// ❌ 运行时频繁动态分配，导致内存碎片化
void process_loop(void) {
    for (;;) {
        uint8_t *buf = malloc(256);
        do_work(buf);
        free(buf);
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

// ✅ 使用静态分配或内存池
static uint8_t s_work_buf[256];  // 静态分配

// 或使用内存池
static uint8_t s_pool_storage[POOL_BLOCK_SIZE * POOL_BLOCK_COUNT];
static StaticSemaphore_t s_pool_mutex_buf;
static mem_pool_t s_pool;

void init(void) {
    mem_pool_init(&s_pool, s_pool_storage, POOL_BLOCK_SIZE, POOL_BLOCK_COUNT);
}
```

### 任务优先级全部设为相同值

```c
// ❌ 所有任务同一优先级，调度行为不可预测
xTaskCreate(sensor_task, "sensor", 4096, NULL, 5, NULL);
xTaskCreate(display_task, "display", 4096, NULL, 5, NULL);
xTaskCreate(network_task, "network", 4096, NULL, 5, NULL);

// ✅ 按实时性要求分配优先级
xTaskCreate(sensor_task,  "sensor",  4096, NULL, 10, NULL);  // 高：实时采集
xTaskCreate(network_task, "network", 4096, NULL, 5,  NULL);  // 中：网络通信
xTaskCreate(display_task, "display", 2048, NULL, 3,  NULL);  // 低：界面刷新
```

---

## 必须遵守

### 栈大小调优流程

分配栈空间后必须监控实际使用量，避免溢出或浪费：

```c
// 创建任务时预留足够栈空间
TaskHandle_t sensor_handle;
xTaskCreate(sensor_task, "sensor", 4096, NULL, 10, &sensor_handle);

// 运行一段时间后检查高水位标记
void monitor_task(void *arg) {
    for (;;) {
        UBaseType_t hw = uxTaskGetStackHighWaterMark(sensor_handle);
        ESP_LOGI(TAG, "sensor 任务剩余栈: %u words", hw);
        if (hw < 128) {
            ESP_LOGW(TAG, "sensor 任务栈空间不足，建议增加");
        }
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}
```

### 功耗管理分级策略

```c
// Deep Sleep：长时间无任务时使用（微安级功耗）
void enter_deep_sleep(uint64_t wakeup_us) {
    esp_wifi_stop();
    esp_bt_controller_disable();
    esp_sleep_enable_timer_wakeup(wakeup_us);
    esp_sleep_enable_ext0_wakeup(GPIO_WAKEUP_PIN, 0);
    ESP_LOGI(TAG, "进入 Deep Sleep，%llu 秒后唤醒", wakeup_us / 1000000);
    esp_deep_sleep_start();  // 不返回，唤醒后从 app_main 重新执行
}

// Light Sleep：需要快速恢复时使用（毫安级功耗）
void enter_light_sleep(uint64_t wakeup_us) {
    esp_sleep_enable_timer_wakeup(wakeup_us);
    esp_light_sleep_start();  // 返回后从此处继续执行
    ESP_LOGI(TAG, "Light Sleep 唤醒，原因: %d", esp_sleep_get_wakeup_cause());
}
```

### DMA 传输替代 CPU 搬运

```c
// ❌ CPU 逐字节搬运 SPI 数据
void spi_transfer_blocking(const uint8_t *data, size_t len) {
    for (size_t i = 0; i < len; i++) {
        SPI_DR = data[i];
        while (!(SPI_SR & SPI_SR_TXE));
    }
}

// ✅ 使用 DMA 传输，CPU 可执行其他任务
spi_transaction_t trans = {
    .length = len * 8,         // 位数
    .tx_buffer = data,
    .rx_buffer = rx_buf,
};
// DMA 自动搬运，spi_device_transmit 内部等待完成
esp_err_t err = spi_device_transmit(spi_handle, &trans);
```

---

## 推荐做法

### 编译优化选项选择

| 选项    | 用途                          | 适用阶段     |
| ------- | ----------------------------- | ------------ |
| `-Og`   | 调试友好优化，保留调试信息    | 开发调试     |
| `-Os`   | 优化代码体积，减少 Flash 占用 | 生产发布     |
| `-O2`   | 优化执行速度                  | 性能关键模块 |
| `-flto` | 链接时优化，消除未使用代码    | 生产发布     |

```cmake
# CMakeLists.txt 中按构建类型配置
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    target_compile_options(${COMPONENT_LIB} PRIVATE -Os -flto)
else()
    target_compile_options(${COMPONENT_LIB} PRIVATE -Og -g)
endif()
```

### Flash 读写优化

```c
// ❌ 频繁小块写入 Flash，缩短 Flash 寿命
void save_sensor_data(sensor_data_t *data) {
    nvs_set_blob(handle, "data", data, sizeof(*data));
    nvs_commit(handle);  // 每次写入都执行擦写周期
}

// ✅ 批量缓存后一次写入
#define BATCH_SIZE 16
static sensor_data_t s_batch_buf[BATCH_SIZE];
static uint8_t s_batch_idx = 0;

void save_sensor_data(sensor_data_t *data) {
    s_batch_buf[s_batch_idx++] = *data;
    if (s_batch_idx >= BATCH_SIZE) {
        nvs_set_blob(handle, "batch", s_batch_buf, sizeof(s_batch_buf));
        nvs_commit(handle);
        s_batch_idx = 0;
    }
}
```

### RTOS 调度优化建议

| 策略           | 说明                                            | 注意事项                           |
| -------------- | ----------------------------------------------- | ---------------------------------- |
| 优先级反转保护 | 使用 Mutex（含优先级继承）而非 Binary Semaphore | 仅在任务间共享资源时               |
| 时间片调整     | 同优先级任务设置合理时间片                      | `configTICK_RATE_HZ` 通常 100-1000 |
| 任务通知       | 用 `xTaskNotify` 替代队列/信号量                | 仅单生产者单消费者场景             |
| 空闲任务钩子   | 在 Idle Hook 中执行低优先级维护                 | 禁止阻塞操作                       |

### 内存使用监控

```c
// 定期打印堆内存统计，用于调优
void log_memory_stats(void) {
    ESP_LOGI(TAG, "空闲堆: %u bytes, 最小水位: %u bytes",
             esp_get_free_heap_size(),
             esp_get_minimum_free_heap_size());
    ESP_LOGI(TAG, "最大可分配块: %u bytes",
             heap_caps_get_largest_free_block(MALLOC_CAP_8BIT));
}
```
