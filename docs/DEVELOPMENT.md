# 开发与验收

> 人类与 AI 按需查阅。AI 每次对话默认只加载根目录 [`AGENTS.md`](../AGENTS.md)。

## 环境要求

- Node.js + [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)（Tauri 后端）
- 平台相关 Tauri 依赖见 [Tauri 文档](https://v2.tauri.app/start/prerequisites/)

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm tauri dev

# 构建
pnpm tauri build

# TypeScript 类型检查
pnpm tsc --noEmit

# Rust 检查
cd src-tauri && cargo check && cargo clippy

# 图标生成（替换应用图标时）
# 1. 准备 1024x1024 PNG 到项目根目录
# 2. 运行：
pnpm tauri icon runepad-source.png

# shadcn/ui（按需添加组件）
npx shadcn@latest add <component-name>
```

## 应用图标与 Windows 缓存

`pnpm tauri icon <source>.png` 会更新 `src-tauri/icons/` 下各尺寸资源。

在 Windows 上，`tauri build` 后生成的 `.exe` 有时仍显示旧图标（系统图标缓存）。可尝试：

- 清理 Windows 图标缓存，或
- 临时修改 `tauri.conf.json` 中的 `productName` 后重新 build

## 测试与验收

| 类型 | 命令 / 方式 |
|------|-------------|
| TS 类型 | `pnpm tsc --noEmit` |
| Rust | `cd src-tauri && cargo check && cargo clippy` |
| 手动 P0 | 新建 → 编辑 → 保存 → 重开 → 脏关闭提示 |
| 图标更新 | `pnpm tauri icon <source>.png` → 确认 `src-tauri/icons/` 全更新 |

IPC 逻辑宜在 Rust `#[cfg(test)]` 中单测路径规范化。
