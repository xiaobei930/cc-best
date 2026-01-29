# Tauri 桌面应用开发模式

Tauri 桌面应用开发的专属模式，涵盖 Tauri 2.0 特性。

## 项目结构

### Tauri 2.0 项目布局

```
project/
├── src/                      # Rust 后端代码
│   ├── main.rs               # Tauri 入口点
│   ├── lib.rs                # 库导出
│   ├── commands/             # Tauri commands
│   │   ├── mod.rs
│   │   ├── file.rs           # 文件操作命令
│   │   └── system.rs         # 系统操作命令
│   ├── state/                # 应用状态管理
│   │   ├── mod.rs
│   │   └── app_state.rs
│   ├── models/               # 数据模型
│   │   └── mod.rs
│   └── utils/                # 工具函数
│       └── mod.rs
├── ui/                       # 前端代码 (React/Vue/Svelte)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useTauri.ts   # Tauri API hooks
│   │   └── lib/
│   │       └── tauri.ts      # Tauri 调用封装
│   ├── package.json
│   └── vite.config.ts
├── Cargo.toml
├── tauri.conf.json           # Tauri 配置
└── README.md
```

---

## Tauri Commands

### 基本命令定义

```rust
// src/commands/mod.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
}

// 简单命令
#[command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Tauri.", name)
}

// 返回结构体
#[command]
pub fn get_user(id: i64) -> Result<User, String> {
    // 模拟数据库查询
    if id == 1 {
        Ok(User {
            id: 1,
            name: "Alice".into(),
            email: "alice@example.com".into(),
        })
    } else {
        Err(format!("用户 {} 未找到", id))
    }
}
```

### 异步命令

```rust
// src/commands/file.rs
use tauri::command;
use tokio::fs;

#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .await
        .map_err(|e| format!("读取文件失败: {}", e))
}

#[command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content)
        .await
        .map_err(|e| format!("写入文件失败: {}", e))
}

// 带进度的长时间操作
#[command]
pub async fn process_files(
    paths: Vec<String>,
    window: tauri::Window,
) -> Result<Vec<String>, String> {
    let total = paths.len();
    let mut results = Vec::with_capacity(total);

    for (i, path) in paths.iter().enumerate() {
        // 处理文件
        let content = fs::read_to_string(path)
            .await
            .map_err(|e| e.to_string())?;
        results.push(content);

        // 发送进度事件
        window.emit("progress", (i + 1, total)).unwrap();
    }

    Ok(results)
}
```

### 注册命令

```rust
// src/main.rs
mod commands;
mod state;

use commands::{greet, get_user, read_file, write_file};
use state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_user,
            read_file,
            write_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 状态管理

### 定义应用状态

```rust
// src/state/app_state.rs
use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Settings {
    pub theme: String,
    pub language: String,
    pub auto_save: bool,
}

pub struct AppState {
    pub settings: Mutex<Settings>,
    pub db_path: String,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            settings: Mutex::new(Settings::default()),
            db_path: "app.db".into(),
        }
    }
}
```

### 在命令中使用状态

```rust
// src/commands/settings.rs
use tauri::{command, State};
use crate::state::{AppState, Settings};

#[command]
pub fn get_settings(state: State<AppState>) -> Settings {
    state.settings.lock().unwrap().clone()
}

#[command]
pub fn update_settings(
    state: State<AppState>,
    new_settings: Settings,
) -> Result<(), String> {
    let mut settings = state.settings.lock()
        .map_err(|_| "获取状态锁失败")?;
    *settings = new_settings;
    Ok(())
}

// 异步状态访问
#[command]
pub async fn save_settings(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let settings = state.settings.lock()
        .map_err(|_| "获取状态锁失败")?
        .clone();

    // 异步保存到文件
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| e.to_string())?;
    tokio::fs::write("settings.json", json)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
```

---

## 前后端通信 (IPC)

### 前端调用 Rust 命令

```typescript
// ui/src/lib/tauri.ts
import { invoke } from "@tauri-apps/api/core";

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
}

interface Settings {
  theme: string;
  language: string;
  auto_save: boolean;
}

// 封装 Tauri 调用
export const tauriApi = {
  // 简单调用
  greet: (name: string): Promise<string> => {
    return invoke("greet", { name });
  },

  // 返回结构体
  getUser: (id: number): Promise<User> => {
    return invoke("get_user", { id });
  },

  // 文件操作
  readFile: (path: string): Promise<string> => {
    return invoke("read_file", { path });
  },

  writeFile: (path: string, content: string): Promise<void> => {
    return invoke("write_file", { path, content });
  },

  // 设置
  getSettings: (): Promise<Settings> => {
    return invoke("get_settings");
  },

  updateSettings: (settings: Settings): Promise<void> => {
    return invoke("update_settings", { newSettings: settings });
  },
};
```

### React Hook 封装

```typescript
// ui/src/hooks/useTauri.ts
import { useState, useCallback } from "react";
import { tauriApi } from "../lib/tauri";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tauriApi.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    setLoading(true);
    setError(null);
    try {
      await tauriApi.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }, []);

  return { settings, loading, error, loadSettings, saveSettings };
}
```

### 事件监听

```typescript
// ui/src/hooks/useProgress.ts
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export function useProgress() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const unlisten = listen<[number, number]>("progress", (event) => {
      const [current, total] = event.payload;
      setProgress({ current, total });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return progress;
}
```

---

## 错误处理

### 自定义错误类型

```rust
// src/error.rs
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),

    #[error("数据库错误: {0}")]
    Database(String),

    #[error("验证失败: {0}")]
    Validation(String),

    #[error("未找到: {0}")]
    NotFound(String),

    #[error("权限不足")]
    PermissionDenied,
}

// 为 Tauri 实现序列化
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### 在命令中使用

```rust
use crate::error::{AppError, Result};

#[command]
pub async fn secure_operation(
    path: String,
    state: State<'_, AppState>,
) -> Result<String> {
    // 验证
    if path.is_empty() {
        return Err(AppError::Validation("路径不能为空".into()));
    }

    // 权限检查
    if !has_permission(&path) {
        return Err(AppError::PermissionDenied);
    }

    // IO 操作（自动转换 io::Error）
    let content = tokio::fs::read_to_string(&path).await?;

    Ok(content)
}
```

---

## 文件系统操作

### 文件对话框

```rust
use tauri::api::dialog::{FileDialogBuilder, MessageDialogBuilder};

#[command]
pub async fn open_file_dialog() -> Result<Option<String>, String> {
    let file = FileDialogBuilder::new()
        .add_filter("Text Files", &["txt", "md"])
        .add_filter("All Files", &["*"])
        .pick_file();

    Ok(file.map(|p| p.to_string_lossy().to_string()))
}

#[command]
pub async fn save_file_dialog(default_name: String) -> Result<Option<String>, String> {
    let file = FileDialogBuilder::new()
        .set_file_name(&default_name)
        .add_filter("Text Files", &["txt"])
        .save_file();

    Ok(file.map(|p| p.to_string_lossy().to_string()))
}
```

### 前端调用

```typescript
import { open, save } from "@tauri-apps/plugin-dialog";

// 打开文件
const openFile = async () => {
  const selected = await open({
    multiple: false,
    filters: [
      { name: "Text", extensions: ["txt", "md"] },
      { name: "All", extensions: ["*"] },
    ],
  });

  if (selected) {
    const content = await tauriApi.readFile(selected as string);
    setContent(content);
  }
};

// 保存文件
const saveFile = async (content: string) => {
  const path = await save({
    defaultPath: "untitled.txt",
    filters: [{ name: "Text", extensions: ["txt"] }],
  });

  if (path) {
    await tauriApi.writeFile(path, content);
  }
};
```

---

## 窗口管理

### 创建新窗口

```rust
use tauri::{Manager, WindowBuilder, WindowUrl};

#[command]
pub async fn open_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowBuilder::new(
        &app,
        "settings",
        WindowUrl::App("settings.html".into()),
    )
    .title("设置")
    .inner_size(600.0, 400.0)
    .resizable(false)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
```

### 窗口间通信

```rust
// 从 Rust 发送到特定窗口
#[command]
pub fn notify_window(app: tauri::AppHandle, window_label: &str, message: &str) {
    if let Some(window) = app.get_window(window_label) {
        window.emit("notification", message).unwrap();
    }
}

// 广播到所有窗口
#[command]
pub fn broadcast(app: tauri::AppHandle, event: &str, payload: &str) {
    app.emit_all(event, payload).unwrap();
}
```

---

## tauri.conf.json 配置

### 基本配置

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "MyApp",
  "version": "0.1.0",
  "identifier": "com.example.myapp",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "pnpm build",
    "frontendDist": "../ui/dist"
  },
  "app": {
    "windows": [
      {
        "title": "My Tauri App",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### 权限配置 (Tauri 2.0)

```json
{
  "plugins": {
    "fs": {
      "scope": ["$APPDATA/**", "$DOCUMENT/**"]
    },
    "shell": {
      "open": true
    },
    "dialog": {
      "open": true,
      "save": true
    }
  }
}
```

---

## 测试

### Rust 端测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("World");
        assert!(result.contains("World"));
    }

    #[tokio::test]
    async fn test_read_file() {
        // 创建临时文件
        let temp_dir = tempfile::tempdir().unwrap();
        let file_path = temp_dir.path().join("test.txt");
        std::fs::write(&file_path, "test content").unwrap();

        let result = read_file(file_path.to_string_lossy().to_string()).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "test content");
    }
}
```

### 前端测试

```typescript
// ui/src/lib/__tests__/tauri.test.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { tauriApi } from "../tauri";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("tauriApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call greet command", async () => {
    (invoke as any).mockResolvedValue("Hello, World!");

    const result = await tauriApi.greet("World");

    expect(invoke).toHaveBeenCalledWith("greet", { name: "World" });
    expect(result).toBe("Hello, World!");
  });

  it("should handle errors", async () => {
    (invoke as any).mockRejectedValue("User not found");

    await expect(tauriApi.getUser(999)).rejects.toBe("User not found");
  });
});
```

---

## 常用开发命令

```bash
# 开发
pnpm tauri dev              # 启动开发服务器

# 构建
pnpm tauri build            # 构建生产版本
pnpm tauri build --debug    # Debug 构建

# 图标生成
pnpm tauri icon icon.png    # 从图片生成所有尺寸图标

# 更新
pnpm tauri update           # 检查 Tauri 更新
```

---

## Maintenance

- Sources: Tauri 2.0 文档, Tauri GitHub
- Last updated: 2025-01-29
- Compatible: Tauri 2.x
