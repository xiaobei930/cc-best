---
paths:
  - "**/components/**/*.c"
  - "**/components/**/*.h"
  - "**/main/**/*.c"
  - "**/main/**/*.h"
---

# ESP32 C 代码风格规则

本项目是 ESP32 嵌入式 C 语言项目，遵循 ESP-IDF 编码规范。

## 格式化

- 使用 clang-format 格式化
- 配置基于 ESP-IDF 推荐风格

## 命名规范

| 类型     | 规范         | 示例                                 |
| -------- | ------------ | ------------------------------------ |
| 函数     | snake_case   | `wifi_init()`, `adc_read_value()`    |
| 局部变量 | snake_case   | `buffer_size`, `retry_count`         |
| 全局变量 | g\_ 前缀     | `g_wifi_connected`, `g_oilwell_data` |
| 静态变量 | s\_ 前缀     | `s_retry_count`, `s_mutex`           |
| 常量/宏  | UPPER_SNAKE  | `MAX_BUFFER_SIZE`, `UART2_TXD`       |
| 类型定义 | snake_case_t | `oilwell_data_t`, `wifi_config_t`    |
| 枚举值   | UPPER_SNAKE  | `WIFI_STATE_CONNECTED`               |

## 头文件规范

```c
#pragma once  // 或 #ifndef _MODULE_NAME_H_

// 导入顺序
#include <stdio.h>              // 1. C 标准库
#include <string.h>

#include "freertos/FreeRTOS.h"  // 2. ESP-IDF 系统
#include "freertos/task.h"
#include "esp_log.h"

#include "driver/uart.h"        // 3. ESP-IDF 驱动

#include "ads111x.h"            // 4. 第三方组件

#include "oilwell_struct.h"     // 5. 项目头文件
```

## 禁止事项

```c
// ❌ 禁止 include .c 文件
#include "wlan.c"           // 错误！

// ✅ 正确做法：include .h 文件
#include "wlan.h"           // 正确
```

## 错误处理

```c
// ✅ 使用 ESP-IDF 错误检查宏
ESP_ERROR_CHECK(mbc_slave_init(MB_PORT_SERIAL_SLAVE, &handler));

// ✅ 带重试的错误处理
esp_err_t err;
int retries = 0;
do {
    err = i2c_master_read(...);
    if (err != ESP_OK) {
        ESP_LOGW(TAG, "I2C 读取失败: %s", esp_err_to_name(err));
        vTaskDelay(pdMS_TO_TICKS(100));
        retries++;
    }
} while (err != ESP_OK && retries < MAX_RETRIES);

// ✅ 返回值检查
if (result == NULL) {
    ESP_LOGE(TAG, "内存分配失败");
    return ESP_ERR_NO_MEM;
}
```

## 日志规范

```c
static const char *TAG = "WIFI";  // 模块标签

ESP_LOGI(TAG, "WiFi 初始化完成");           // 信息
ESP_LOGW(TAG, "连接重试: %d/%d", i, max);   // 警告
ESP_LOGE(TAG, "初始化失败: %s", esp_err_to_name(err));  // 错误
ESP_LOGD(TAG, "调试数据: %d", value);       // 调试
```

## FreeRTOS 任务规范

```c
// 任务函数签名
void task_name(void *pvParameters)
{
    // 初始化

    for (;;) {
        // 任务循环体
        vTaskDelay(pdMS_TO_TICKS(100));
    }

    // 任务清理（通常不会到达）
    vTaskDelete(NULL);
}

// 任务创建
xTaskCreate(
    task_name,              // 任务函数
    "task_name",            // 任务名称
    4096,                   // 栈大小
    NULL,                   // 参数
    5,                      // 优先级
    &task_handle            // 句柄
);
```

## 互斥锁使用

```c
static SemaphoreHandle_t s_uart_mutex = NULL;

// 初始化
s_uart_mutex = xSemaphoreCreateMutex();

// 使用
if (xSemaphoreTake(s_uart_mutex, pdMS_TO_TICKS(1000)) == pdTRUE) {
    // 临界区操作
    xSemaphoreGive(s_uart_mutex);
}
```

## 函数文档

```c
/**
 * @brief 读取 ADC 通道值
 *
 * @param channel ADC 通道号 (0-3)
 * @param[out] value 读取的值
 * @return esp_err_t ESP_OK 成功，其他为错误码
 */
esp_err_t adc_read_channel(uint8_t channel, int16_t *value);
```

## 复杂度控制

- 函数行数 ≤ 100 行
- 圈复杂度 ≤ 10
- 嵌套深度 ≤ 3 层
- 参数个数 ≤ 5 个（超过时使用结构体）

## NVS 使用规范

```c
// 打开 → 操作 → 提交 → 关闭
nvs_handle_t handle;
ESP_ERROR_CHECK(nvs_open("storage", NVS_READWRITE, &handle));
ESP_ERROR_CHECK(nvs_set_i32(handle, "key", value));
ESP_ERROR_CHECK(nvs_commit(handle));
nvs_close(handle);
```
