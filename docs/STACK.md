# 技术栈与依赖

> 版本锁死、禁止库、shadcn/i18n 细则、已安装依赖。新增依赖须经人工批准。

**单一事实来源**：版本以 [`package.json`](../package.json)、[`src-tauri/Cargo.toml`](../src-tauri/Cargo.toml) 为准；下表为说明性清单。

## 技术栈与版本锁死

以下版本**未经人工批准禁止变更**：

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 桌面框架 | Tauri | v2.x | 系统 API、窗口管理、IPC、Capabilities |
| 构建工具 | Vite | v6.x | 前端构建 |
| UI 框架 | React | v18.x | 组件渲染 |
| 样式 | TailwindCSS | **v4.x** | `@tailwindcss/vite`；主题在 `src/index.css`（`@import "tailwindcss"` + `@theme`） |
| 组件库 | shadcn/ui | **CLI v4.x**（`components.json` 为准） | 通过 registry 生成到 `src/components/ui/` |
| UI primitives | @base-ui/react | 随 shadcn 组件 | v4 默认替代 Radix（勿擅自改回 Radix） |
| 工具链 | clsx、tailwind-merge、CVA、lucide-react | 随 shadcn init | `cn()` 见 `src/lib/utils.ts` |
| 编辑器 | CodeMirror 6 | ^6.0 | 核心文本编辑 |
| 状态管理 | Zustand | v5.x | 全局状态 |
| 列表虚拟化 | @tanstack/react-virtual | latest | 文件树等大列表 |
| 国际化 | 自研轻量方案 | — | `src/i18n/messages.ts` + `src/i18n/index.ts`，zh-CN / en-US |
| 路由 | 无 | — | 单页应用，不使用路由库 |
| 表单 | 无 | — | 不使用 React Hook Form / Zod |

## 禁止引入的库

（除非人工明确批准）

- Redux / MobX（用 Zustand）
- React Router / TanStack Router
- styled-components / emotion（用 Tailwind）
- Monaco Editor / Ace Editor（用 CodeMirror 6）
- Electron（用 Tauri）
- react-window（统一用 `@tanstack/react-virtual`）
- 手写复制 Radix 版 shadcn 组件覆盖 registry 生成物（须 `npx shadcn@latest add`）
- 用 `next-themes` 驱动**应用**亮暗（Tauri 非 Next）；见 [`docs/UI.md`](UI.md)

## shadcn/ui v4（已选方案 A）

- **初始化 / 加组件**：`npx shadcn@latest init`、`npx shadcn@latest add <name>`（勿固定死旧版 CLI）。
- **配置**：根目录 [`components.json`](../components.json)，当前 `style`: `base-nova`。
- **依赖**：`shadcn`、`@base-ui/react`、`tw-animate-css`、`@fontsource-variable/geist` 等为 v4 模板自带；`package.json` 中保留，勿在无理由下删除。
- **生成物**：仅改 `src/components/ui/*` 与 `src/lib/utils.ts`；业务组件放 `layout/`、`editor/`。
- **Tailwind v4**：使用 `@tailwindcss/vite` 插件（见 `vite.config.ts`），**无** `tailwind.config.js` / `postcss.config.js`；`components.json` 中 `tailwind.config` 为空字符串。设计令牌在 `src/index.css` 的 `@theme inline` 与 `:root` / `.dark`。
- **Toast**：使用生成的 `Toaster`（`src/components/ui/sonner.tsx`）。可依赖 `next-themes` 的 `useTheme` 供 Sonner；**应用主题**仍由 `uiStore` + `html.dark`。

## 国际化 (i18n)

- **方案**：自研轻量方案，不引入 i18next / react-intl。
- **定义**：`src/i18n/messages.ts` 中统一定义 `MessageKey` 联合类型，以及 `zhCN` / `enUS` 字典。
- **用法**：
  - 组件内：`const { t } = useI18n()`（来自 `src/i18n/index.ts`）
  - Store / 纯函数内：`getT()(key, params)` 或 `getT(locale)(key, params)`
  - 错误提示：`toastErrorMessage(error)` 统一包装
- **禁忌**：禁止在 messages.ts 之外散落硬编码的中文或英文 UI 文本。
- **新增文案**：须同步更新 `MessageKey` 类型、zhCN 字典、enUS 字典三处。

## 已安装依赖（说明）

### 前端核心

| 包 | 用途 |
|----|------|
| `zustand` | 全局状态管理 |
| `@codemirror/view`, `@codemirror/state`, `@codemirror/language`, `@codemirror/commands`, `@codemirror/search` | CodeMirror 6 核心 |
| `@codemirror/lang-javascript`, `@codemirror/lang-json`, `@codemirror/lang-markdown` | 语法高亮语言包 |
| `@tauri-apps/plugin-dialog` | 系统文件对话框 |
| `@tauri-apps/plugin-opener` | 系统默认程序打开文件 |
| `sonner` | Toast 通知 |
| `@tanstack/react-virtual` | 文件树虚拟滚动 |
| `@base-ui/react`, `shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react` | shadcn/ui v4 工具链 |
| `next-themes` | **仅限** Sonner 的 `useTheme`；应用主题仍由 `uiStore` 控制 |
| `@fontsource-variable/geist` | Geist 字体 |

### 构建依赖

| 包 | 用途 |
|----|------|
| `vite` ^6.x | 构建工具 |
| `@vitejs/plugin-react` | React 支持 |
| `@tailwindcss/vite` | Tailwind v4 Vite 插件 |
| `tailwindcss` ^4.x | 样式引擎 |
| `typescript` ~5.6 | 类型检查 |

### Tauri 插件

| 包 | Rust 对应 | 用途 |
|----|-----------|------|
| `@tauri-apps/plugin-dialog` | `tauri-plugin-dialog` | 打开/保存对话框 |
| `@tauri-apps/plugin-opener` | `tauri-plugin-opener` | 用系统程序打开文件 |

### Rust Crates

| Crate | 用途 |
|-------|------|
| `notify` | 目录文件监听 |
| `encoding_rs` | GBK/UTF-8 编码检测与转换 |
| `tokio` | 异步 IO |
| `serde`, `serde_json` | 序列化 |
| `windows`, `windows-core`（shell-ext 子 crate） | Windows 11 ExplorerCommand 右键菜单 COM DLL |

## 平台打包工具

- NSIS：由 Tauri bundle 使用，安装/卸载 hook 见 `src-tauri/windows/nsis-installer-hooks.nsh`。
- MSIX：`scripts/windows/pack-msix.ps1` 使用 Microsoft `winapp` CLI 打包；本地签名证书由 `scripts/windows/create-msix-dev-cert.ps1` 生成。
- shell extension：`src-tauri/shell-ext` 是独立 Rust crate，仅用于 Windows MSIX 右键菜单，不属于主 Tauri IPC 进程。
