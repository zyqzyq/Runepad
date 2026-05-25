# 项目路线与阶段范围

> 阶段护栏的简要表见 [`AGENTS.md`](../AGENTS.md)。本文档为完整说明。

## 项目概述

一个基于 **Tauri v2 + React 18 + shadcn/ui + CodeMirror 6** 的轻量级文本编辑器（**Runepad**），目标为 Notepad++ 的现代化替代品。

- **定位**: 轻量、快速、可扩展的桌面文本编辑器
- **平台**: Windows / Linux / macOS
- **包管理**: 前端 `pnpm`（须提交 `pnpm-lock.yaml`），Rust `cargo`
- **窗口**: 单窗口多标签，分屏为后续能力

## 已集成功能

脚手架已完成，以下能力**已集成并可用**：

- TailwindCSS v4、shadcn/ui v4（Base UI）
- CodeMirror 6 核心包及语言包（JS/JSON/Markdown），编辑器组件已接入
- `@tauri-apps/plugin-dialog`，文件打开/保存对话框已接入
- `sonner`，Toast 已挂载，全局错误提示已统一
- 原生菜单（文件/编辑/设置）、快捷键、主题切换、StatusBar
- Sidebar 文件树、目录监听（`notify`）、按扩展名语法高亮
- 脏标签关闭确认、查找/替换面板、最近文件列表
- 会话恢复（自动保存/恢复标签和侧边栏状态）
- 国际化（i18n，zh-CN / en-US）
- 设置面板（字体、字号、语言、主题）
- 自定义应用图标（已替换 Tauri 默认图标）
- Windows 文件关联与右键菜单（NSIS 安装器注册基础动词；MSIX 路径含 shell extension）
- 启动性能优化（轻量首屏、EditorPanel 延迟加载、两阶段会话恢复）

## 开发阶段与范围

按阶段交付，**禁止跨阶段一次性实现未列入当前阶段的特性**。

| 阶段 | 目标 | 包含 | 状态 |
|------|------|------|------|
| **P0** | 可编辑、可存盘 | 布局骨架、CodeMirror 编辑器、Tab、**Tauri 原生菜单**（文件/编辑）、`Ctrl+O/S/N/W`、StatusBar（行列/编码/换行/字数）、Light/Dark/System 主题 | 已完成 |
| **P1** | 像编辑器 | Sidebar 文件树、`readDir`、脏标签关闭确认、按扩展名语法高亮、错误 toast | 已完成 |
| **P2** | 效率 | 查找/替换、最近文件、Tab 拖拽排序、GBK 等非 UTF-8 读写（Windows 常见） | 已完成 |
| **P3+** | 进阶 | 会话恢复、目录 `watch`（须防抖）、>10MB 分片/只读、Command Palette | 部分完成（会话恢复、目录监听已落地；分片/只读、Command Palette 未做） |

## 打包与平台集成进度

- NSIS：`src-tauri/windows/nsis-installer-hooks.nsh` 在安装后写入 HKCU 右键菜单 `Open with Runepad`，卸载时清理。
- MSIX：`scripts/windows/pack-msix.ps1` 负责 Tauri 构建、shell extension 构建、资源复制与 `winapp pack`；Store 构建使用 `pnpm run pack:msix:store`。
- 文件关联：`tauri.conf.json` 已声明常见文本/代码扩展名，应用角色为 `Editor`。
- 启动入参：`get_launch_files` 支持从文件关联或右键菜单传入路径并打开到 Tab。

## v1 明确不做（Out of Scope）

N++ 插件兼容、宏录制、FTP/SFTP、打印、内置浏览器、分屏编辑。
