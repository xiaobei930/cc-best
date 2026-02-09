# 前端调试

## Console 方法

```typescript
// 分组输出
console.group("用户数据");
console.log("ID:", user.id);
console.log("Name:", user.name);
console.groupEnd();

// 表格输出
console.table(users);

// 条件断言
console.assert(user.age > 0, "年龄必须大于0");

// 堆栈跟踪
console.trace("调用堆栈");

// 计数
console.count("render"); // render: 1, render: 2, ...
```

## React DevTools

```typescript
// 添加 displayName
const MyComponent = () => { ... }
MyComponent.displayName = 'MyComponent'

// 使用 useDebugValue
function useCustomHook() {
  const [value, setValue] = useState(null)
  useDebugValue(value ? 'Has Value' : 'Empty')
  return [value, setValue]
}
```

## 常见 JavaScript 问题排查

### 异步问题

```typescript
// ❌ 忘记 await
async function fetchData() {
  const data = fetch("/api/data"); // 缺少 await
  return data.json(); // data 是 Promise，不是 Response
}

// ✅ 正确
async function fetchData() {
  const response = await fetch("/api/data");
  return await response.json();
}
```

### 闭包陷阱

```typescript
// ❌ 闭包捕获变量
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 全部输出 5
}

// ✅ 使用 let
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2, 3, 4
}
```

### this 指向

```typescript
// ❌ this 丢失
class Handler {
  name = "handler";
  handle() {
    console.log(this.name);
  }
}
const h = new Handler();
const fn = h.handle;
fn(); // undefined

// ✅ 绑定 this
const fn = h.handle.bind(h);
// 或使用箭头函数
handle = () => {
  console.log(this.name);
};
```
