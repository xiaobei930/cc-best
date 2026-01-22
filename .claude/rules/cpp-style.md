---
paths:
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.h"
  - "**/*.cc"
  - "**/*.cxx"
---

# C++ 代码风格规则

## 格式化
- 使用 clang-format 格式化
- 配置文件：`.clang-format`（如有）

## 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 类/结构体 | PascalCase | `AudioProcessor`, `SessionManager` |
| 函数 | camelCase 或 snake_case | `processAudio()`, `process_audio()` |
| 变量 | camelCase 或 snake_case | `audioData`, `audio_data` |
| 常量 | kPascalCase 或 UPPER_CASE | `kMaxBufferSize`, `MAX_BUFFER_SIZE` |
| 成员变量 | m_camelCase 或 trailing_ | `m_audioBuffer`, `audio_buffer_` |
| 宏 | UPPER_SNAKE_CASE | `AUDIO_SAMPLE_RATE` |
| 命名空间 | lowercase | `audio`, `network` |

## 头文件规范
```cpp
#pragma once

// 导入顺序
#include "audio_processor.h"  // 对应头文件

#include <cstdio>             // C 系统
#include <memory>             // C++ 标准库
#include <opencv2/core.hpp>   // 第三方库
#include "common/logger.h"    // 项目内
```

## 内存管理
```cpp
// ✅ 优先使用智能指针
std::unique_ptr<AudioBuffer> buffer = std::make_unique<AudioBuffer>();
std::shared_ptr<Session> session = std::make_shared<Session>();

// ❌ 避免裸指针 new/delete
AudioBuffer* buffer = new AudioBuffer();  // 不推荐
```

## 现代 C++ 特性
- 使用 `auto` 简化类型声明
- 使用范围 for 循环
- 使用 `nullptr` 而非 `NULL`
- 使用 `constexpr` 替代宏常量
- 使用 `enum class` 替代 `enum`
