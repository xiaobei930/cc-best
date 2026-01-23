---
paths:
  - "**/*.py"
---

# Python 代码风格规则

## 格式化
- 使用 Black 格式化，行宽 88 字符
- 使用 isort 排序导入

## 导入顺序
```python
# 1. 标准库
import os
import sys
from typing import Optional, List

# 2. 第三方库
from fastapi import FastAPI
import numpy as np

# 3. 项目内模块
from shared.models import Session
from services.asr import ASRService
```

## 类型注解
```python
# 必须有类型注解
def process_audio(
    audio_data: bytes,
    sample_rate: int = 16000,
) -> str:
    """处理音频数据"""
    pass

# 使用 Optional 处理可能为 None 的值
def get_session(session_id: str) -> Optional[Session]:
    pass
```

## 文档字符串
```python
def transcribe(audio_path: str) -> ASRResult:
    """
    转录音频文件为文本

    Args:
        audio_path: 音频文件路径

    Returns:
        ASRResult: 包含识别文本和置信度的结果

    Raises:
        FileNotFoundError: 文件不存在
        ValueError: 音频格式不支持
    """
    pass
```

## 命名规范
- 函数/变量: `snake_case`
- 类: `PascalCase`
- 常量: `UPPER_CASE`
- 私有成员: `_leading_underscore`

## 错误处理
```python
# 使用自定义异常
from shared.exceptions import ServiceError

try:
    result = await service.process(data)
except ServiceError as e:
    logger.error(f"处理失败: {e}")
    raise
```
