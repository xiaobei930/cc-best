# Ralph Loop 提示词模板

这些模板用于配合官方 [ralph-wiggum](https://github.com/anthropics/claude-plugins-official) 插件使用，实现跨会话的自主开发循环。

## 前置条件

```bash
# 安装 ralph-wiggum 插件（官方插件）
/plugin install ralph-wiggum@claude-plugins-official
```

## 可用模板

| 模板               | 用途         | 典型场景          |
| ------------------ | ------------ | ----------------- |
| `iterate-phase.md` | 阶段迭代     | 按 Phase 自动推进 |
| `full-feature.md`  | 完整功能开发 | 从需求到完成      |
| `bug-fix.md`       | Bug 修复     | 定位并修复问题    |
| `refactor.md`      | 代码重构     | 改善代码质量      |
| `fix-tests.md`     | 修复测试     | 让测试通过        |
| `doc-gen.md`       | 文档生成     | 生成/更新文档     |

## 使用方式

### 方式一：直接命令（推荐）

```bash
# 基本用法
/ralph-loop "根据 memory-bank/progress.md 继续开发任务"

# 指定最大迭代次数
/ralph-loop "实现用户认证功能" --max-iterations 10

# 指定完成承诺（当输出包含此文本时停止）
/ralph-loop "修复所有测试" --completion-promise "所有测试通过"

# 完整示例
/ralph-loop "按照 progress.md 中的计划完成 Phase 2" --max-iterations 20 --completion-promise "Phase 2 完成"
```

### 方式二：使用模板文件

将模板内容复制到 `/ralph-loop` 命令中：

```bash
# 读取模板内容后执行
/ralph-loop "<模板内容>" --max-iterations 15
```

### 取消循环

```bash
/cancel-ralph
```

## 与 /iterate 的区别

| 功能     | /iterate        | /ralph-loop        |
| -------- | --------------- | ------------------ |
| 会话边界 | 单会话内        | 跨会话自动重启     |
| 进度保存 | progress.md     | progress.md + 插件 |
| 适用场景 | 短期任务（<2h） | 长期项目（小时级） |
| 中断恢复 | 手动            | 自动               |
| 上下文   | 受限于单会话    | 每次新会话重新加载 |

## 模板变量

在使用模板前，替换以下变量：

- `{{PROJECT_NAME}}` - 项目名称
- `{{PROJECT_DESCRIPTION}}` - 项目描述
- `{{CURRENT_PHASE}}` - 当前阶段

## 注意事项

- 需要先安装 `ralph-wiggum` 官方插件
- 模板遵循 `<promise>` 标签协议控制循环
- 建议配合 `memory-bank/progress.md` 使用以保持上下文
- 每次循环迭代会消耗 API 配额，注意设置合理的 `--max-iterations`
