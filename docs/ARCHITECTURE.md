# 架构与目录结构

> 涉及目录布局、Store 划分、扩展预留时查阅。

## 目录结构

```
runepad/                         # 项目根（包名 runepad）
├── AGENTS.md                    # AI 硬规则入口（每次对话注入）
├── docs/                        # 详细参考文档（按需阅读）
│   ├── DEVELOPMENT.md
│   ├── ARCHITECTURE.md
│   ├── STACK.md
│   ├── ROADMAP.md
│   ├── UI.md
│   └── CHANGELOG.md
├── src/
│   ├── components/
│   │   ├── editor/              # EditorArea, EditorPanel
│   │   ├── layout/              # AppLayout, TabBar, Sidebar, StatusBar, CloseTabHost, RecentFilesHost, ThemeToggle
│   │   ├── ui/                  # shadcn 生成（button, dialog, scroll-area, sonner, tabs...）
│   │   └── explorer/            # FileTree, FileTreeNode, flattenTree
│   ├── hooks/                   # 业务 Hooks（useFileActions, useCloseTab, useDirWatcher, useSessionRestore...）
│   ├── stores/                  # Zustand Stores（tab/editor/ui/settings/explorer/recent/closeTab）
│   ├── types/                   # TypeScript 类型（tab, editor, dir, session）
│   ├── lib/                     # 工具函数与编辑器基础设施
│   │   ├── editorInstances.ts   # Map<string, EditorView> 全局实例管理
│   │   ├── codemirrorTheme.ts   # CodeMirror 主题
│   │   ├── codemirrorLanguages.ts # 语言包注册
│   │   ├── editorSearch.ts      # 查找/替换面板控制
│   │   ├── openFileInTab.ts     # 打开文件到 Tab
│   │   ├── pendingDocs.ts       # 待初始化文档内容
│   │   ├── buildSessionSnapshot.ts, restoreSession.ts, persistSession.ts # 会话恢复
│   │   ├── setEditorContent.ts, reloadTabFromDisk.ts # 编辑器内容操作
│   │   ├── normalizePath.ts, parentDir.ts, pathDisplay.ts # 路径工具
│   │   ├── languageFromFilename.ts, dialogFilters.ts # 文件类型
│   │   ├── collectWatchTargets.ts # 目录监听目标收集
│   │   └── utils.ts             # cn() 等通用工具
│   ├── api/                     # 所有 invoke 封装（契约以源码为准）
│   │   ├── fileApi.ts
│   │   ├── dirApi.ts
│   │   ├── menuApi.ts
│   │   ├── sessionApi.ts
│   │   ├── systemApi.ts
│   │   └── index.ts             # 统一再导出
│   ├── i18n/                    # 国际化（messages.ts, index.ts）
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # Tailwind v4 入口 + shadcn 变量
├── src-tauri/
│   ├── capabilities/            # Tauri v2 权限（default.json 等）
│   ├── gen/                     # 生成物，禁止手改
│   ├── icons/                   # 应用图标（icon.ico, icon.icns, icon.png, 各尺寸 PNG）
│   ├── src/
│   │   ├── main.rs              # 二进制入口
│   │   ├── lib.rs               # Tauri Builder 组装
│   │   ├── menu.rs              # 原生菜单定义
│   │   ├── commands/            # IPC 命令（file_ops, dir_ops, watch_ops, session_ops, system_ops, menu_ops, window_ops）
│   │   └── utils/               # Rust 工具（encoding, path）
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── components.json
├── pnpm-lock.yaml
└── README.md
```

## 文件命名规范

- React 组件: `PascalCase.tsx`（如 `EditorPanel.tsx`）
- Hooks: `useCamelCase.ts`（如 `useDirWatcher.ts`）
- Stores: `camelCaseStore.ts`（如 `tabStore.ts`）
- Rust 模块: `snake_case.rs`（如 `file_ops.rs`）
- i18n: `messages.ts` 为字典，`index.ts` 为 API 入口

## Zustand Store 划分

禁止单一巨型 Store。

```text
stores/tabStore.ts         # Tab 列表、激活 id、增删改
stores/editorStore.ts      # 仅元数据（行列、字数），无 EditorView
stores/uiStore.ts          # 主题、侧栏折叠
stores/settingsStore.ts    # 用户配置（字体、字号、locale），持久化到 localStorage
stores/explorerStore.ts    # 侧边栏文件树（根路径、展开状态、子目录缓存）
stores/recentFilesStore.ts # 最近文件列表，持久化到 localStorage
stores/closeTabStore.ts    # 关闭标签时的确认弹窗状态（待关闭 id、可见性）
```

类型定义以 `src/types/tab.ts`、`src/types/editor.ts` 等为准。

## 扩展预留（实现时保持兼容即可）

- 语言：CodeMirror 语言包通过配置注册，不改编辑器核心
- 主题：App 与 CM 主题分离，切换时同一入口
- 快捷键：P0–P2 硬编码；后续可 JSON 覆盖
- 插件系统：**不**在 v1 创建空目录；接口稳定后再议
