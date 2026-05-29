# UI / UX 约束

> 做布局、主题、菜单与快捷键相关改动时查阅。硬规则摘要见 [`AGENTS.md`](../AGENTS.md)。

## 主题

- Light / Dark / System（`uiStore.theme` → `resolvedTheme` → `document.documentElement` 的 `dark` class）
- 应用壳：shadcn CSS 变量（`src/index.css` 的 `:root` / `.dark`，oklch）；编辑器区域约定 CM 背景亮 `#ffffff` / 暗 `#1e1e1e`（`codemirrorTheme.ts`）
- **禁止**以 `next-themes` 作为应用主题唯一来源；`next-themes` 仅允许服务于 `Toaster` 直至改为 `uiStore` 同步
- CodeMirror 主题随 `resolvedTheme` 切换，与 App 分离实现、同一状态入口更新

## 布局

```text
┌─────────────────────────────────────────┐
│  AppHeader（自定义标题栏 + 菜单 + 窗口按钮）│
├──────────┬──────────────────────────────┤
│ Sidebar  │  TabBar                       │
│ (可折叠)  ├──────────────────────────────┤
│          │  Editor Area                  │
├──────────┴──────────────────────────────┤
│  StatusBar（编码 | 换行 | 行列 | 字数）    │
└─────────────────────────────────────────┘
```

- AppHeader：高度 36px，承载文件/编辑下拉菜单、侧栏开关、设置入口、最小化/最大化/关闭按钮；拖拽区域调用 Tauri window API
- Sidebar 默认 250px，折叠至 40px（图标模式）
- TabBar：拖拽排序（P2）、中键关闭、未保存圆点
- StatusBar：高 22px，字 12px

## 交互（P0 起）

| 操作 | 原生菜单 | 快捷键 |
|------|----------|--------|
| 新建 | 文件 → 新建 | Ctrl/Cmd+N |
| 打开 | 文件 → 打开… | Ctrl/Cmd+O |
| 保存 | 文件 → 保存 | Ctrl/Cmd+S |
| 关闭标签 | 文件 → 关闭标签 | Ctrl/Cmd+W / 中键 / × |
| 退出 | macOS：Runepad → 退出；其它：文件 → 退出 | — |
| 编辑 | 编辑 → 撤销/复制等（系统项） | — |
| 查找 | 编辑 → 查找 | Ctrl/Cmd+F |
| 替换 | 编辑 → 替换 | Ctrl/Cmd+R |
| 设置 | 标题栏齿轮 / 原生菜单 | — |

无路径保存 → Save Dialog。`isDirty` 关闭须确认 Dialog。错误提示用 **sonner**（shadcn toast）。

Command Palette（Ctrl/Cmd+Shift+P）属 **P3+**（未实现）。

## 原生菜单实现要点

- 定义于 `src-tauri/src/menu.rs`（`MenuBuilder` / `SubmenuBuilder`）
- 菜单项带 `CmdOrCtrl` 加速器；点击经 `menu-file-action` 由前端 `useAppMenu` 调用 `useFileActions`（与快捷键共用逻辑）
- macOS 须首个 `Submenu` 作为应用菜单（About / Quit）；Win/Linux 在「文件」末项提供 Quit
- 编辑菜单使用 `PredefinedMenuItem`（撤销/复制等），作用于 WebView/CodeMirror 焦点
- 仍保留 `useEditorShortcuts`（Win 上部分加速器可能不进 `on_menu_event`）
