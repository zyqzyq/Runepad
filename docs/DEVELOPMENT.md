# 开发与验收

> 人类与 AI 按需查阅。AI 每次对话默认只加载根目录 [`AGENTS.md`](../AGENTS.md)。

## 环境要求

- Node.js + [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)（Tauri 后端）
- 平台相关 Tauri 依赖见 [Tauri 文档](https://v2.tauri.app/start/prerequisites/)

### Codex 中的 pnpm

本机 pnpm shim 位于：

```text
C:\Users\zhang\AppData\Local\pnpm\bin\pnpm.CMD
```

Codex 沙箱内的 PATH 可能已经包含该目录，但 Windows 会拒绝沙箱直接执行用户目录下的 `pnpm.CMD`。如果出现“无法将 pnpm 识别为命令”或“pnpm.CMD 拒绝访问”，AI 应请求沙箱外执行授权，而不是要求重新安装依赖。已验证沙箱外 `pnpm --version` 为 `11.1.2`。

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm tauri dev

# 构建
pnpm tauri build

# MSIX 打包（需要 winapp CLI）
pnpm run pack:msix

# Microsoft Store MSIX（跳过本地签名，使用离线 WebView2 配置）
pnpm run pack:msix:store

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

`package.json` 中 `build:context-menu` 目前引用旧脚本，仓库内已无该脚本；右键菜单以 NSIS hook 与 MSIX shell extension 路径为准。

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
| MSIX 脚本 | 需要传 PowerShell 参数时直接调用 `scripts/windows/pack-msix.ps1`；`pnpm run pack:msix` 走默认参数 |
| 手动 P0 | 新建 → 编辑 → 保存 → 重开 → 脏关闭提示 |
| 图标更新 | `pnpm tauri icon <source>.png` → 确认 `src-tauri/icons/` 全更新 |
| 右键菜单 | NSIS 安装后检查文件右键 `Open with Runepad`；MSIX 安装/升级后重启 `explorer.exe` |

IPC 逻辑宜在 Rust `#[cfg(test)]` 中单测路径规范化。
