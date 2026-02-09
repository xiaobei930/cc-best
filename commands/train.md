---
description: 训练机器学习/深度学习模型
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# /train - 训练模型

训练项目中的机器学习/深度学习模型。

## 适用场景

- 模型微调
- 迁移学习
- 从头训练

## 通用训练流程

### 1. 环境检查

```bash
# GPU 检查
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}')"
nvidia-smi

# 依赖检查
pip list | grep -E "torch|tensorflow|transformers"
```

### 2. 数据准备

- 检查训练数据集是否就绪
- 验证数据格式和质量
- 划分训练/验证/测试集

### 3. 训练配置

```yaml
# 示例配置结构
model:
  name: "model_name"
  pretrained: true

training:
  epochs: 10
  batch_size: 32
  learning_rate: 1e-4

data:
  train_path: "data/train"
  val_path: "data/val"
```

### 4. 启动训练

```bash
# 通用启动命令
python train.py --config config/train.yaml

# 使用 GPU
CUDA_VISIBLE_DEVICES=0 python train.py

# 后台运行
nohup python train.py > train.log 2>&1 &
```

## 训练监控

### 日志记录

- Loss 变化曲线
- 验证集指标
- 学习率变化

### Checkpoint 管理

- 定期保存模型权重
- 保留最优模型
- 支持断点续训

## 常用框架

| 框架              | 训练命令                         |
| ----------------- | -------------------------------- |
| PyTorch           | `python train.py`                |
| Hugging Face      | `python -m transformers.trainer` |
| TensorFlow        | `python train.py`                |
| PyTorch Lightning | `python train.py`                |

## 注意事项

- 确保有足够的 GPU 显存
- 使用 tmux/screen 后台运行长时间任务
- 定期保存训练状态和 checkpoint
- 记录实验参数和结果

## 项目定制

> 根据项目需要修改此文件，添加具体的：
>
> - 模型类型和参数
> - 数据集路径
> - 训练脚本位置
> - 评估指标
