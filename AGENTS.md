## AI 开发指导手册 (AGENTS.md)

> 本文件是项目的「宪法」。Cursor / AI 在生成代码前必须阅读并严格遵守。  
> 人类向文档见 `README.md`（安装、运行）；本文件仅描述架构契约与 AI 执行规则。  
> 版本: 0.2.0 | 最后更新: 2026-05-18

---

## 1. 项目概述

一个基于 **Tauri v2 + React 18 + shadcn/ui + CodeMirror 6** 的轻量级文本编辑器（**Runepad**），目标为 Notepad++ 的现代化替代品。

- **定位**: 轻量、快速、可扩展的桌面文本编辑器
- **平台**: Windows / Linux / macOS
- **包管理**: 前端 `pnpm`（须提交 `pnpm-lock.yaml`），Rust `cargo`
- **窗口**: 单窗口多标签，分屏为后续能力

### 1.1 当前仓库阶段

脚手架已就绪（Tauri v2 + React + Vite）。以下依赖**尚未安装**，实现对应功能前须按 §13 安装，禁止 AI 假设已存在：

- TailwindCSS v3、shadcn/ui、Zustand v4
- CodeMirror 6 核心包及语言包
- `@tauri-apps/plugin-dialog`（及按需的 fs 相关能力）
- `sonner`（配合 shadcn toast）

---

## 2. 开发阶段与范围

按阶段交付，**禁止跨阶段一次性实现未列入当前阶段的特性**。

| 阶段 | 目标 | 包含 |
|------|------|------|
| **P0** | 可编辑、可存盘 | 布局骨架、CodeMirror 编辑器、Tab、`Ctrl+O/S/N/W`、StatusBar（行列/编码/换行/字数）、Light/Dark/System 主题 |
| **P1** | 像编辑器 | Sidebar 文件树、`readDir`、脏标签关闭确认、按扩展名语法高亮、错误 toast |
| **P2** | 效率 | 查找/替换、最近文件、Tab 拖拽排序、GBK 等非 UTF-8 读写（Windows 常见） |
| **P3+** | 进阶 | 会话恢复、目录 `watch`（须防抖）、>10MB 分片/只读、Command Palette |

**v1 明确不做（Out of Scope）**：N++ 插件兼容、宏录制、FTP/SFTP、打印、内置浏览器、分屏编辑。

---

## 3. 技术栈与版本锁死

以下版本**未经人工批准禁止变更**：

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 桌面框架 | Tauri | v2.x | 系统 API、窗口管理、IPC、Capabilities |
| 构建工具 | Vite | v6.x | 前端构建 |
| UI 框架 | React | v18.x | 组件渲染 |
| 样式 | TailwindCSS | v3.x | 原子化 CSS |
| 组件库 | shadcn/ui | 随 `components.json` | Button、Dialog、Tabs 等 |
| 编辑器 | CodeMirror 6 | ^6.0 | 核心文本编辑 |
| 状态管理 | Zustand | v4.x | 全局状态 |
| 列表虚拟化 | @tanstack/react-virtual | latest | 文件树等大列表 |
| 路由 | 无 | — | 单页应用，不使用路由库 |
| 表单 | 无 | — | 不使用 React Hook Form / Zod |

**禁止引入的库**（除非人工明确批准）：

- ❌ Redux / MobX（用 Zustand）
- ❌ React Router / TanStack Router
- ❌ styled-components / emotion（用 Tailwind）
- ❌ Monaco Editor / Ace Editor（用 CodeMirror 6）
- ❌ Electron（用 Tauri）
- ❌ react-window（统一用 `@tanstack/react-virtual`）

---

## 4. 目录结构规范

```
runepad/                         # 项目根（包名 runepad）
├── src/
│   ├── components/
│   │   ├── editor/
│   │   ├── layout/
│   │   ├── ui/                  # shadcn 生成
│   │   └── explorer/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── lib/
│   ├── api/                     # 所有 invoke 封装（见 §7）
│   └── App.tsx
├── src-tauri/
│   ├── capabilities/            # Tauri v2 权限（default.json 等）
│   ├── gen/                     # 生成物，禁止手改
│   ├── src/
│   │   ├── lib.rs
│   │   ├── commands/            # 随功能创建，按模块分文件
│   │   ├── models/
│   │   └── utils/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json
├── pnpm-lock.yaml
└── AGENTS.md
```

**文件命名规范**：

- React 组件: `PascalCase.tsx`（如 `EditorPanel.tsx`）
- Hooks: `useCamelCase.ts`（如 `useFileWatcher.ts`）
- Stores: `camelCaseStore.ts`（如 `tabStore.ts`）
- Rust 模块: `snake_case.rs`（如 `file_ops.rs`）

---

## 5. 编码规范

### 5.1 TypeScript

- `"strict": true`，不得关闭
- 函数参数与返回值须显式类型
- 禁止 `any`（除未类型化的 Tauri 边界外）
- 路径别名 `@/` → `src/`
- 接口 `I` 前缀：同一项目内统一即可

### 5.2 Rust

- IPC 命令返回 `Result<T, String>`，错误信息对用户友好
- 路径一律 `std::path::PathBuf`，禁止字符串拼接路径
- IO 使用 `tokio::fs`，不阻塞主线程
- 禁止 `unsafe`（除非人工批准）

### 5.3 React

- 仅函数组件 + Hooks
- 跨组件状态：**Zustand**；禁止 Prop Drilling
- **CodeMirror `EditorView` 禁止放入 React state**；用 `useRef` 或 §6 的全局 `Map`
- IPC / 事件监听在 `useEffect` 中注册并清理
- 文件树等长列表：**仅** `@tanstack/react-virtual`

### 5.4 快捷键

- Windows / Linux：`Ctrl+*`
- macOS：对应为 `Cmd+*`（实现时通过平台检测或 Tauri 菜单统一处理）

---

## 6. 状态管理契约 (Zustand)

### 6.1 Store 划分

```text
stores/tabStore.ts       # Tab 列表、激活 id、增删改
stores/editorStore.ts    # 仅元数据（行列、字数），无 EditorView
stores/uiStore.ts        # 主题、侧栏折叠
stores/settingsStore.ts  # 用户配置（后续）
```

禁止单一巨型 Store。

### 6.2 核心数据结构

```typescript
// types/tab.ts
export interface Tab {
  id: string;               // uuid；filepath 可作辅助键，不与 id 混用
  filename: string;
  filepath: string | null;
  isDirty: boolean;
  isNew: boolean;
  language: string;
  encoding: string;         // UTF-8 | GBK 等
  lineEnding: 'LF' | 'CRLF';
}

// types/editor.ts
export interface EditorMeta {
  docId: string;
  wordCount: number;
  cursorPos: { line: number; col: number };
}
```

### 6.3 文档内容与脏标记（关键）

- **正文唯一来源**：CodeMirror `Text`（挂在 `EditorView` / `editorInstances` 上）
- **禁止**在 Zustand 中缓存完整文件内容
- **保存**：从对应 `EditorView.state.doc.toString()` 读取，经 `fileApi.writeFile` 写出
- **isDirty**：监听 `EditorView` 的 `updateListener`，在 `docChanged` 时置 `true`；成功保存后置 `false`（可选：维护 `savedDocVersion` 与 `state.doc` 版本比较）
- **打开文件**：IPC 读入 → `EditorState.create({ doc })` → 绑定 Tab.`id` === `docId`

```typescript
// lib/editorInstances.ts
export const editorInstances = new Map<string, EditorView>();
```

关闭 Tab：`view.destroy()` + `editorInstances.delete(docId)`。

---

## 7. IPC 接口契约

- 前端**禁止**直接 `import { invoke } from '@tauri-apps/api/core'` 散落在组件中
- 所有命令封装在 `src/api/` 下按域分文件（如 `fileApi.ts`、`dirApi.ts`）
- 可选：`src/api/index.ts` 统一再导出，无强制 `tauri.ts` 单文件

### 7.1 文件

```typescript
// src/api/fileApi.ts
export async function readFile(path: string): Promise<{
  content: string;
  encoding: string;
  lineEnding: 'LF' | 'CRLF';
}>;

export async function writeFile(
  path: string,
  content: string,
  options?: { encoding?: string; lineEnding?: 'LF' | 'CRLF' }
): Promise<void>;

export async function openDialog(options?: {
  multiple?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | string[] | null>;

export async function saveDialog(options?: {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | null>;
```

### 7.2 目录

```typescript
// src/api/dirApi.ts
export async function readDir(path: string): Promise<Array<{
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modifiedAt: number;
}>>;

export async function watchDir(path: string): Promise<void>;   // P3+，须防抖
export async function unwatchDir(path: string): Promise<void>;
```

### 7.3 系统

```typescript
// src/api/systemApi.ts
export async function showInFolder(path: string): Promise<void>;
export async function getSystemTheme(): Promise<'light' | 'dark'>;
```

### 7.4 Rust 注册

命令实现在 `src-tauri/src/commands/`，在 `lib.rs` 注册。新增命令时同步更新 `capabilities/default.json` 中所需 permission。

---

## 8. UI/UX 约束

### 8.1 主题

- Light / Dark / System
- 暗色主背景 `#1e1e1e`，亮色 `#ffffff`
- CodeMirror 主题随应用主题切换

### 8.2 布局

```text
┌─────────────────────────────────────────┐
│  TitleBar（可选，自定义标题栏时）          │
├──────────┬──────────────────────────────┤
│ Sidebar  │  TabBar                       │
│ (可折叠)  ├──────────────────────────────┤
│          │  Editor Area                  │
├──────────┴──────────────────────────────┤
│  StatusBar（编码 | 换行 | 行列 | 字数）    │
└─────────────────────────────────────────┘
```

- Sidebar 默认 250px，折叠至 40px（图标模式）
- TabBar：拖拽排序（P2）、中键关闭、未保存圆点
- StatusBar：高 22px，字 12px

### 8.3 交互（P0 起）

| 操作 | 快捷键 |
|------|--------|
| 打开 | Ctrl/Cmd+O |
| 保存 | Ctrl/Cmd+S |
| 新建 | Ctrl/Cmd+N |
| 关闭标签 | Ctrl/Cmd+W / 中键 / × |

无路径保存 → Save Dialog。`isDirty` 关闭须确认 Dialog。错误提示用 **sonner**（shadcn toast）。

Command Palette（Ctrl/Cmd+Shift+P）属 **P3+**。

---

## 9. AI 任务执行规则

### 9.1 前置检查

1. 阅读本文件，确认任务所属 **阶段（§2）**
2. 技术栈与 §3、§13 一致
3. 是否触及已有 IPC / Store / 组件契约

### 9.2 代码生成

1. **IDE 内直接修改仓库文件**；禁止只贴片段让用户自行插入
2. **文件头注释**（仅新建 `src/api/*`、`src-tauri/src/commands/*` 或跨模块核心文件）：
   `// Runepad | Module: xxx | Depends on: xxx`
3. `pnpm tsc --noEmit` 须通过
4. Rust：`Result` 用 `?` / `match`；禁止生产代码 `.unwrap()`
5. TS：IPC `try/catch`，用户可见错误走 toast
6. 单一职责；**禁止** `export *`

### 9.3 交付说明

- 用简短变更列表说明改了什么、为何改
- 用户明确要求「只输出代码、不写文件」时，可给出完整文件内容
- **禁止**：擅自扩大任务范围、静默删除已有逻辑

### 9.4 契约变更

修改 IPC、Store 结构或公共类型时，在回复开头标明：

```markdown
### ⚠️ 契约变更
- 变更项
- 影响文件列表
```

---

## 10. 性能与体验

### 10.1 大文件

| 大小 | 策略 |
|------|------|
| < 1MB | 正常加载 + 语法高亮 |
| 1MB–10MB | 正常加载，**关闭语法高亮** + 警告 |
| > 10MB | **P3+**：分片或只读；P0–P2 可提示过大并拒绝/只读打开 |

### 10.2 启动

- 首屏 < 500ms；不阻塞 UI 等大文件
- 会话恢复（P3+）：先 UI，后台读文件

### 10.3 内存

- 关 Tab 必 `destroy` EditorView 并 `delete` Map 项
- Rust 文件句柄及时释放（`Drop`）

---

## 11. 安全约束

1. **路径校验**：规范化路径后拒绝 `..` 遍历；禁止读写应用安装目录、`src-tauri` 源码树等**非用户选定**的敏感路径。用户通过系统对话框选择的路径允许访问。
2. **命令注入**：禁止将用户输入拼进 shell
3. **XSS**：禁止用 `dangerouslySetInnerHTML` 渲染文件内容
4. **权限最小化（Tauri v2）**：仅在 `src-tauri/capabilities/*.json` 声明所需 permission；优先官方 plugin（dialog 等），新增权限须说明理由

---

## 12. 扩展预留（实现时保持兼容即可）

- 语言：CodeMirror 语言包通过配置注册，不改编辑器核心
- 主题：App 与 CM 主题分离，切换时同一入口
- 快捷键：P0–P2 硬编码；后续可 JSON 覆盖
- 插件系统：**不**在 v1 创建空目录；接口稳定后再议

---

## 13. 依赖清单

实现前按阶段安装，版本须符合 §3。

**前端核心**

```bash
pnpm add zustand @codemirror/view @codemirror/state @codemirror/language @codemirror/commands @codemirror/search @codemirror/lang-javascript @codemirror/lang-json @codemirror/lang-markdown
pnpm add -D tailwindcss postcss autoprefixer
# shadcn 初始化后：
npx shadcn@latest add button dialog tabs scroll-area sonner toast
pnpm add sonner @tanstack/react-virtual
```

**Tauri 插件（按需注册到 lib.rs + capabilities）**

```bash
pnpm add @tauri-apps/plugin-dialog
# 若 Rust 侧自实现 read/write 可不装 plugin-fs；否则再评估
```

**Rust（编码检测 P2+ 示例）**

```toml
# encoding_rs = "0.8"  # GBK/UTF-8 等，人工确认后添加
```

---

## 14. 测试与验收

| 类型 | 命令 / 方式 |
|------|-------------|
| TS 类型 | `pnpm tsc --noEmit` |
| Rust | `cd src-tauri && cargo check && cargo clippy` |
| 手动 P0 | 新建 → 编辑 → 保存 → 重开 → 脏关闭提示 |

IPC 逻辑宜在 Rust `#[cfg(test)]` 中单测路径规范化。

---

## 15. 附录：常用命令

```bash
pnpm install
pnpm tauri dev
pnpm tauri build
pnpm tsc --noEmit
cd src-tauri && cargo check && cargo clippy
npx shadcn@latest add tabs dialog button input scroll-area sonner
```

---

> **AI 开发者须知**：不确定时采用更保守方案（不增依赖、不改契约、不删代码），并标注 `[TODO: 需人工确认]`。
