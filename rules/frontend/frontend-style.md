---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.less"
  - "**/*.svelte"
  - "**/*.html"
---

# 前端代码风格规则

> 本文件扩展 [common/coding-standards.md](../common/coding-standards.md)，提供前端特定代码风格规范

## 格式化

- 使用 Prettier 格式化
- 配置见 `.prettierrc`（如有）

## TypeScript 规范

### 类型注解

```typescript
// 必须有明确的类型注解
interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}

// 函数参数和返回值必须有类型
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // ...
}
```

### 命名规范

- 接口/类型: `PascalCase`（如 `UserProfile`）
- 变量/函数: `camelCase`（如 `getUserProfile`）
- 常量: `UPPER_CASE`（如 `MAX_RETRY_COUNT`）
- 组件: `PascalCase`（如 `UserCard.vue`）

### 导入顺序

```typescript
// 1. 框架/库
import { ref, computed } from "vue";
import axios from "axios";

// 2. 项目模块
import { useUserStore } from "@/stores/user";
import type { User } from "@/types";

// 3. 相对路径导入
import UserCard from "./UserCard.vue";
```

## Vue 组件规范

### 组件结构（Composition API）

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue';

// 2. Props 和 Emits
const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  (e: 'update', value: string): void;
}>();

// 3. 响应式状态
const loading = ref(false);

// 4. 计算属性
const displayName = computed(() => /* ... */);

// 5. 方法
function handleClick() {
  // ...
}

// 6. 生命周期
onMounted(() => {
  // ...
});
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
/* 样式 */
</style>
```

## 错误处理

```typescript
// 使用 try-catch 处理异步错误
try {
  const data = await fetchData("/api/user");
} catch (error) {
  console.error("获取用户数据失败:", error);
  // 显示用户友好的错误信息
}
```

## 注释规范

- 使用中文注释
- 复杂逻辑必须有注释说明
- JSDoc 格式记录公共 API
