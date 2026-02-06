---
paths:
  - "**/*"
alwaysApply: true
---

# 嵌入式安全规范 | Embedded Security Rules

> 本文件扩展 [common/security.md](../common/security.md)，提供嵌入式固件特定安全规范

## 禁止操作

### 明文存储密钥到 Flash

```c
// ❌ 密钥明文写入 NVS，可通过 Flash 读取工具提取
nvs_set_blob(handle, "aes_key", key_data, 32);

// ✅ 使用 NVS 加密分区或 eFuse 存储密钥
const esp_partition_t *part = esp_partition_find_first(
    ESP_PARTITION_TYPE_DATA, ESP_PARTITION_SUBTYPE_DATA_NVS,
    "nvs_encrypted");
esp_err_t err = nvs_flash_secure_init_partition(part->label, &nvs_sec_cfg);
```

### 未验证 OTA 固件签名

```c
// ❌ 直接写入 OTA 数据，未校验签名
esp_ota_write(ota_handle, data, len);

// ✅ 启用 Secure Boot v2 签名验证
// sdkconfig 配置:
// CONFIG_SECURE_BOOT=y
// CONFIG_SECURE_BOOT_V2_ENABLED=y
// CONFIG_SECURE_SIGNED_ON_UPDATE=y

esp_https_ota_config_t ota_config = {
    .http_config = &http_config,
    .partial_http_download = true,
};
// esp_https_ota 内部自动验证签名链
esp_err_t err = esp_https_ota(&ota_config);
```

### 生产固件保留 JTAG 调试接口

```c
// ❌ 生产环境未禁用调试接口，攻击者可提取固件
// 未配置 eFuse，JTAG 默认开启

// ✅ 通过 eFuse 永久禁用 JTAG
// 仅在生产烧录阶段执行，不可逆操作
esp_efuse_write_field_bit(ESP_EFUSE_DIS_PAD_JTAG);
esp_efuse_write_field_bit(ESP_EFUSE_DIS_USB_JTAG);
ESP_LOGI(TAG, "JTAG 调试接口已永久禁用");
```

---

## 必须遵守

### Secure Boot 信任链

生产固件必须启用完整的 Secure Boot 流程：

```
┌──────────────────────────────────────────────────┐
│  ROM Bootloader (芯片内置，不可修改)               │
│  → 验证 Second Stage Bootloader 签名              │
├──────────────────────────────────────────────────┤
│  Second Stage Bootloader (签名)                   │
│  → 验证 Application 签名                          │
├──────────────────────────────────────────────────┤
│  Application (签名)                               │
│  → 运行时校验 OTA 分区完整性                       │
└──────────────────────────────────────────────────┘
```

```bash
# 生成签名密钥（离线保管，禁止提交到仓库）
espsecure.py generate_signing_key --version 2 secure_boot_signing_key.pem

# 构建签名固件
idf.py build
espsecure.py sign_data --version 2 \
  --keyfile secure_boot_signing_key.pem \
  build/my_app.bin
```

### OTA 安全更新流程

```c
// OTA 更新必须满足：签名验证 + HTTPS 传输 + 回滚机制
static esp_err_t perform_ota_update(const char *url) {
    // 1. 仅允许 HTTPS 连接
    esp_http_client_config_t http_config = {
        .url = url,
        .cert_pem = server_ca_cert,  // 固定 CA 证书
        .timeout_ms = 30000,
    };

    // 2. 配置 OTA（自动校验签名）
    esp_https_ota_config_t ota_config = {
        .http_config = &http_config,
    };

    esp_err_t err = esp_https_ota(&ota_config);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "OTA 更新失败: %s", esp_err_to_name(err));
        return err;
    }

    // 3. 标记为待验证状态（下次启动自检，失败则回滚）
    esp_ota_mark_app_valid_cancel_rollback();
    return ESP_OK;
}
```

### TLS 连接强制要求

```c
// ❌ 使用不安全的 HTTP 连接
esp_http_client_config_t config = {
    .url = "http://api.example.com/data",
};

// ✅ 使用 TLS + 证书固定（Certificate Pinning）
extern const uint8_t ca_cert_start[] asm("_binary_ca_cert_pem_start");
extern const uint8_t ca_cert_end[]   asm("_binary_ca_cert_pem_end");

esp_http_client_config_t config = {
    .url = "https://api.example.com/data",
    .cert_pem = (const char *)ca_cert_start,
    .transport_type = HTTP_TRANSPORT_OVER_SSL,
    .skip_cert_common_name_check = false,  // 必须校验 CN
};
```

### 密钥注入与存储策略

| 密钥类型        | 存储位置         | 特点                         |
| --------------- | ---------------- | ---------------------------- |
| Secure Boot Key | eFuse (一次写入) | 不可读出、不可修改           |
| TLS 客户端证书  | 加密 NVS 分区    | 出厂烧录、运行时解密         |
| OTA 签名公钥    | 固件内嵌         | 随固件更新、Secure Boot 保护 |
| 业务 API Key    | Secure Element   | 硬件隔离、防侧信道攻击       |

---

## 推荐做法

### Flash 加密配置

```
# sdkconfig 推荐配置
CONFIG_SECURE_FLASH_ENC_ENABLED=y
CONFIG_SECURE_FLASH_ENCRYPTION_MODE_RELEASE=y  # 生产模式（不可逆）
CONFIG_SECURE_BOOT_ALLOW_JTAG=n
CONFIG_SECURE_BOOT_ALLOW_ROM_BASIC=n
CONFIG_SECURE_BOOT_ALLOW_UNUSED_HEADER_BYTES=n
```

### 固件完整性自检

```c
// 启动时校验关键分区的 SHA-256
static esp_err_t verify_firmware_integrity(void) {
    const esp_partition_t *running = esp_ota_get_running_partition();
    esp_app_desc_t app_desc;
    esp_err_t err = esp_ota_get_partition_description(running, &app_desc);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "固件描述读取失败，疑似被篡改");
        return ESP_ERR_INVALID_STATE;
    }

    ESP_LOGI(TAG, "固件版本: %s, 编译时间: %s %s",
             app_desc.version, app_desc.date, app_desc.time);
    return ESP_OK;
}
```

### 安全开发检查清单

- [ ] Secure Boot v2 已启用且密钥离线保管
- [ ] Flash 加密已启用（Release 模式）
- [ ] JTAG/USB 调试接口已通过 eFuse 禁用
- [ ] 所有网络连接使用 TLS 1.2+
- [ ] OTA 更新强制签名验证 + 回滚机制
- [ ] 敏感密钥存储在 eFuse 或 Secure Element 中
- [ ] NVS 分区已启用加密
- [ ] 固件启动时执行完整性自检
