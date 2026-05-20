# Runepad

轻量级桌面文本编辑器（Tauri v2 + React 18 + CodeMirror 6），目标为 Notepad++ 的现代化替代品。支持 Windows / Linux / macOS。

## 快速开始

```bash
pnpm install
pnpm tauri dev
```

生产构建：`pnpm tauri build`

## 文档

| 文档 | 说明 |
|------|------|
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | 开发环境、常用命令、测试验收 |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | 阶段规划与 v1 范围 |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | 目录结构与 Store 划分 |
| [`docs/STACK.md`](docs/STACK.md) | 技术栈、依赖与 i18n |
| [`docs/UI.md`](docs/UI.md) | 布局、主题、快捷键 |
| [`AGENTS.md`](AGENTS.md) | AI 开发硬规则（Cursor 注入） |

## 技术栈（摘要）

Tauri v2 · React 18 · Vite 6 · Tailwind v4 · shadcn/ui v4 · CodeMirror 6 · Zustand v5

详细版本与禁止引入的库见 [`docs/STACK.md`](docs/STACK.md)。
