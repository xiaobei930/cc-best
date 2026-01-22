---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /infer - 模型推理

运行机器学习/深度学习模型推理。

## 适用场景
- 模型预测
- 批量推理
- 实时服务

## 通用推理流程

### 1. 环境检查
```bash
# GPU 检查
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"

# 模型文件检查
ls -la models/

# 依赖检查
pip list | grep -E "torch|onnx|tensorrt"
```

### 2. 模型加载
```python
# PyTorch 示例
model = torch.load("models/model.pt")
model.eval()

# Hugging Face 示例
from transformers import AutoModel
model = AutoModel.from_pretrained("models/my-model")
```

### 3. 推理执行
```bash
# 单文件推理
python infer.py --input data/input.txt --output results/

# 批量推理
python infer.py --input-dir data/batch/ --output-dir results/

# API 服务模式
python serve.py --model models/model.pt --port 8000
```

## 性能优化

### 加速选项
| 方法 | 命令/配置 |
|------|----------|
| 半精度推理 | `--fp16` 或 `torch.float16` |
| 批量处理 | `--batch-size 32` |
| ONNX 转换 | `torch.onnx.export()` |
| TensorRT | `trtexec --onnx=model.onnx` |

### 显存优化
```python
# 梯度检查点
torch.cuda.empty_cache()

# 推理模式
with torch.no_grad():
    output = model(input)
```

## 常用框架

| 框架 | 推理命令 |
|------|----------|
| PyTorch | `python infer.py` |
| Hugging Face | `python -m transformers.pipelines` |
| ONNX Runtime | `python onnx_infer.py` |
| TensorRT | `trtexec --loadEngine=model.trt` |

## 输出格式

### 保存结果
```python
# JSON 格式
import json
with open("results.json", "w") as f:
    json.dump(results, f)

# CSV 格式
import pandas as pd
df.to_csv("results.csv", index=False)
```

## 注意事项

- 首次运行需要加载模型权重（可能较慢）
- 确保输入数据格式与训练时一致
- 检查 GPU 显存是否充足
- 大批量推理建议分批处理

## 项目定制

> 根据项目需要修改此文件，添加具体的：
> - 模型路径和类型
> - 输入/输出格式
> - 推理参数
> - 后处理逻辑
