#!/bin/bash
# Ralph Loop 便捷启动脚本
#
# Clone 模式用法: bash scripts/shell/ralph.sh [mode] [max-iterations] [feature-description]
# Plugin 模式：直接在 Claude Code 中使用 /ralph-loop 命令
#
# mode: phase | fix-tests | refactor | feature
# max-iterations: 默认 30 (feature 模式默认 50)

MODE=${1:-phase}
MAX_ITER=${2:-30}
FEATURE_DESC=${3:-""}

case $MODE in
  phase)
    PROMPT="读取 .claude/ralph-prompts/iterate-phase.md 作为执行指南，按照指南完成当前 Phase 的所有任务"
    PROMISE="PHASE_COMPLETE"
    ;;
  fix-tests)
    PROMPT="读取 .claude/ralph-prompts/fix-tests.md 作为执行指南，修复所有失败的测试"
    PROMISE="ALL_GREEN"
    ;;
  refactor)
    PROMPT="读取 .claude/ralph-prompts/refactor.md 作为执行指南，完成代码重构"
    PROMISE="REFACTOR_DONE"
    ;;
  feature)
    if [ -z "$FEATURE_DESC" ]; then
      echo "feature 模式需要提供需求描述"
      echo "用法: bash scripts/shell/ralph.sh feature 50 \"需求描述\""
      exit 1
    fi
    MAX_ITER=${2:-50}
    PROMPT="读取 .claude/ralph-prompts/full-feature.md 作为执行指南。需求: $FEATURE_DESC"
    PROMISE="FEATURE_COMPLETE"
    ;;
  *)
    echo "未知模式: $MODE"
    echo ""
    echo "可用模式:"
    echo "  phase      - 完成当前 Phase 的所有任务"
    echo "  fix-tests  - 修复所有失败的测试"
    echo "  refactor   - 执行代码重构"
    echo "  feature    - 完全自主设计开发新功能"
    echo ""
    echo "用法:"
    echo "  bash scripts/shell/ralph.sh phase 30"
    echo "  bash scripts/shell/ralph.sh feature 50 \"实现用户登录功能\""
    exit 1
    ;;
esac

echo "=========================================="
echo "Ralph Loop 启动"
echo "=========================================="
echo "模式: $MODE"
echo "最大迭代: $MAX_ITER"
echo "完成信号: $PROMISE"
echo ""
echo "即将执行的命令:"
echo "/ralph-loop \"$PROMPT\" --max-iterations $MAX_ITER --completion-promise \"$PROMISE\""
echo ""
echo "请在 Claude Code 中手动执行上述命令"
echo "（ralph-loop 必须在 Claude Code 内运行）"
echo "=========================================="
