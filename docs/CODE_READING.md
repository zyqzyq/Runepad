# Runepad 代码阅读导览

> 给人类快速理解代码用。AI 默认不需要阅读本文，避免增大上下文；只有用户明确要求“按代码导览解释”时再打开。

## 先看什么

1. `src/App.tsx`：应用只挂载 `AppLayout` 和全局 `Toaster`。
2. `src/components/layout/AppLayout.tsx`：主装配点。这里注册主题、设置、菜单、快捷键、会话恢复、目录监听等全局 hooks，并渲染 Header / Sidebar / TabBar / EditorArea / StatusBar。
3. `src/components/editor/EditorArea.tsx` 与 `src/components/editor/EditorPanel.tsx`：编辑器区域与 CodeMirror 实例创建逻辑。
4. `src/stores/tabStore.ts`、`src/lib/editorInstances.ts`：理解 Tab 元数据和真实文本内容如何分离。
5. `src-tauri/src/lib.rs`：Tauri 插件、状态、菜单事件、窗口关闭事件和 IPC 命令注册入口。

## 核心心智模型

Runepad 把“文档正文”和“文档元数据”分开管理：

- 正文：只在 CodeMirror `EditorView.state.doc` 里，实例放在 `src/lib/editorInstances.ts` 的 Map。
- 元数据：Tab 文件名、路径、dirty、编码、换行符、语言等放在 `tabStore`。
- 保存：`useFileActions.saveTabById` 从 `EditorView` 取 `doc.toString()`，再调用 `fileApi.writeFile`。
- 关闭：`useCloseTab` 处理脏关闭确认，最终销毁 EditorView 并删除 store 元数据。

这个设计的结果是：不要在 Zustand 里找完整文件内容，也不要把 `EditorView` 放进 React state。

## 前端目录路线

`src/api/`

所有 Tauri `invoke` 的封装层。组件和 hooks 不应直接散落 `invoke`。新增 IPC 时先看这里的命名和返回类型。

`src/hooks/`

业务流程集中区：

- `useFileActions`：新建、打开、保存、关闭当前 Tab。
- `useExplorerActions`：打开/关闭目录、加载文件树。
- `useSessionRestore`：启动恢复、会话保存、防抖、窗口关闭 flush。
- `useDirWatcher`：同步 watch 目标、处理 `dir-changed` 事件、刷新树和未 dirty 的已打开文件。
- `useAppMenu` / `useEditMenu` / `useSettingsMenu`：Tauri 原生菜单事件桥接。
- `useEditorShortcuts`：键盘快捷键兜底。

`src/lib/`

无 UI 的基础设施：

- `openFileInTab`：文件读取、Tab 创建、pending doc 写入。
- `pendingDocs`：在 EditorPanel 真正挂载前暂存正文。
- `buildSessionSnapshot` / `persistSession` / `restoreSession`：会话序列化与恢复。
- `reloadTabFromDisk`：磁盘变化后刷新未修改 Tab。
- `codemirrorTheme` / `codemirrorLanguages` / `editorKeymap` / `editorSearch`：编辑器配置。
- `normalizePath` / `parentDir` / `pathDisplay`：路径展示与比较。

`src/components/`

- `layout/`：应用框架、菜单、TabBar、Sidebar、StatusBar 和弹窗 host。
- `editor/`：CodeMirror 容器。
- `explorer/`：文件树与虚拟列表 flatten。
- `ui/`：shadcn 生成组件，尽量少改。

## 后端目录路线

`src-tauri/src/lib.rs`

Tauri Builder 的事实入口：

- 注册 `tauri-plugin-dialog`、`tauri-plugin-opener`。
- 管理 `WatchState`、`SessionCache`。
- 拦截窗口关闭，发 `runepad://window-closing` 给前端。
- 把原生菜单点击转成前端事件。
- 注册所有 IPC 命令。

`src-tauri/src/commands/`

- `file_ops.rs`：读写文件、10MB 限制、编码和换行处理。
- `dir_ops.rs`：读取目录树。
- `watch_ops.rs`：notify watcher，发 `dir-changed`。
- `session_ops.rs`：`session.json` 和 `session.preview.json`。
- `system_ops.rs`：系统主题、启动文件参数。
- `menu_ops.rs`：菜单语言切换。
- `window_ops.rs`：关闭窗口的最终 Rust 动作。

`src-tauri/src/utils/`

- `encoding.rs`：UTF-8 / GBK 识别与编码。
- `path.rs`：路径校验、换行检测与转换。

## 启动流程

1. `tabStore` 先创建一个未命名 Tab，让界面立即可见。
2. `main.tsx` 首帧后调用 `prefetchEditorPanel()`，避免 CodeMirror 阻塞首屏。
3. `useSessionRestore` 读取 `session.preview.json`，先恢复可见的标签和目录树。
4. 第二阶段读取完整 `session.json`，恢复未保存内容。
5. 如果应用由文件关联或右键菜单启动，`get_launch_files` 返回路径并打开到 Tab。

更细的性能约束见 `docs/STARTUP.md`。

## Windows 集成

- 文件关联：`src-tauri/tauri.conf.json` 的 `bundle.fileAssociations`。
- NSIS 右键菜单：`src-tauri/windows/nsis-installer-hooks.nsh` 写 HKCU 注册表。
- MSIX 右键菜单：`src-tauri/shell-ext` 生成 COM DLL，manifest 在 `src-tauri/windows/msix/Package.appxmanifest`。
- MSIX 打包脚本：`scripts/windows/pack-msix.ps1`。

## 常见修改入口

| 想改什么 | 入口 |
|----------|------|
| 新菜单项 | `src-tauri/src/menu.rs`、对应 `use*Menu` hook、`src/i18n/messages.ts` |
| 新 IPC | `src/api/*.ts`、`src-tauri/src/commands/*`、`src-tauri/src/lib.rs`、capabilities |
| 新设置项 | `settingsStore`、`SettingsHost` 下的设置组件、会话或 localStorage 策略 |
| 新编辑器行为 | `EditorPanel`、`editorKeymap`、CodeMirror extension |
| 新文件类型高亮 | `codemirrorLanguages`、`languageFromFilename` |
| 启动体验 | `main.tsx`、`useSessionRestore`、`STARTUP.md` |

## 阅读时的坑

- `get_system_theme` 仍存在，但启动路径不要调用它；Windows `reg.exe` 曾造成 release 启动卡顿。
- `session.preview.json` 不含正文，完整正文只在 `session.json` 中按需保存。
- 脏文件遇到磁盘变化只提示，不自动覆盖用户编辑。
- `package.json` 的 `build:context-menu` 是旧脚本入口，目前脚本文件不存在。
