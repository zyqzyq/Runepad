## AI 开发指导手册 (AGENTS.md)

> 本文件是项目的「宪法」，Cursor 每次对话会注入全文。详细参考见 [`docs/`](docs/)；人类上手见 [`README.md`](README.md)。
> 版本: 0.5.2 | 最后更新: 2026-05-25

### 文档索引（按需阅读）

| 文档 | 何时打开 |
|------|----------|
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | 阶段范围、已完成功能、Out of Scope |
| [`docs/STACK.md`](docs/STACK.md) | 技术栈版本、禁止库、shadcn/i18n、依赖说明 |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | 目录树、Store 划分、扩展预留 |
| [`docs/UI.md`](docs/UI.md) | 布局、主题、菜单、快捷键 |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | 安装、构建、类型检查、验收命令 |
| [`docs/STARTUP.md`](docs/STARTUP.md) | 启动性能、会话预览恢复、首屏约束 |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | 文档版本历史 |
| [`docs/CODE_READING.md`](docs/CODE_READING.md) | 给人类读代码的导览；**AI 默认不读**，除非用户明确要求 |

**契约单一事实来源**：`src/api/*.ts`、`src/types/*.ts`、`src/stores/*.ts` — 不假设接口存在；修改契约时同步 Rust 与 capabilities。

---

## AI 接手必读检查清单

- [ ] **阅读本文件当前版本**（用户可能修改过）
- [ ] **确认任务所属阶段**（见下表；详情 [`docs/ROADMAP.md`](docs/ROADMAP.md)），禁止跨阶段实现未列入特性
- [ ] **检查技术栈**（下表 + [`docs/STACK.md`](docs/STACK.md)），禁止擅自升级或引入替代库
- [ ] **涉及目录 / UI / 依赖时**，先打开上表对应 `docs/` 文件
- [ ] **阅读相关 Store / IPC / types 源码**，不假设接口
- [ ] **类型检查**：`pnpm tsc --noEmit`；`cd src-tauri && cargo check`（命令见 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)）
- [ ] **修改契约时**在回复开头标注变更影响（见「契约变更」）

---

## 快速参考 (TL;DR)

| 项 | 值 |
|----|-----|
| **项目** | Runepad — 轻量级桌面文本编辑器（Notepad++ 现代替代品） |
| **阶段** | P0/P1/P2 完成；P3+ 部分（会话恢复、目录监听已落地） |
| **前端** | React 18 + Vite 6 + Tailwind v4 + shadcn/ui v4 (Base UI) + CodeMirror 6 |
| **后端** | Tauri v2 + Rust + tokio + notify + encoding_rs |
| **状态** | Zustand v5（tab/editor/ui/settings/explorer/recent/closeTab） |
| **构建** | `pnpm tauri dev` / `pnpm tauri build` / `pnpm run pack:msix` |

---

## 阶段护栏（摘要）

| 阶段 | 状态 | 备注 |
|------|------|------|
| P0 可编辑可存盘 | 完成 | 菜单、Tab、StatusBar、主题 |
| P1 像编辑器 | 完成 | 文件树、脏关闭、语法高亮 |
| P2 效率 | 完成 | 查找替换、最近文件、拖拽排序、GBK/UTF-8 读写 |
| P3+ 进阶 | 部分 | 会话恢复、watch 已做；>10MB 分片、Command Palette 未做 |

**禁止**跨阶段一次性实现未列入当前阶段的特性。v1 不做：N++ 插件、宏、FTP、打印、内置浏览器、分屏。

---

## 技术栈硬约束（摘要）

| 层级 | 技术 | 版本 |
|------|------|------|
| 桌面 | Tauri | v2.x |
| 构建 | Vite | v6.x |
| UI | React | v18.x |
| 样式 | TailwindCSS | v4.x |
| 组件 | shadcn/ui | CLI v4.x |
| 编辑器 | CodeMirror | ^6.0 |
| 状态 | Zustand | v5.x |

**禁止引入**（除非人工批准）：Redux/MobX、React Router、styled-components/emotion、Monaco/Ace、Electron、react-window、Radix 手写覆盖 shadcn、用 `next-themes` 驱动应用主题。详见 [`docs/STACK.md`](docs/STACK.md)。

---

## 编码硬规则

**TypeScript**：`strict: true`；显式类型；禁止 `any`（Tauri 边界除外）；`@/` → `src/`。

**Rust**：IPC 返回 `Result<T, String>`；路径用 `PathBuf`；IO 用 `tokio::fs`；禁止 `unsafe`（除非批准）；禁止对用户输入/IO `.unwrap()`。

**React**：仅函数组件；状态用 Zustand；**`EditorView` 禁止放入 React state**（用 `editorInstances` Map）；IPC/事件在 `useEffect` 注册并清理；长列表仅 `@tanstack/react-virtual`。

**文件头**（仅 `src/api/*`、`src-tauri/src/commands/*`、跨模块 `src/lib/` 公共模块）：

```typescript
// Runepad | Module: xxx | Depends on: xxx
```

**i18n**：UI 文案仅经 `src/i18n/messages.ts`；新增须同步 `MessageKey`、zhCN、enUS。

---

## 状态与编辑器不变量

- 正文**唯一来源**：CodeMirror `Text`（`EditorView` / `lib/editorInstances.ts`）
- **禁止**在 Zustand 缓存完整文件内容
- **保存**：`EditorView.state.doc.toString()` → `fileApi.writeFile`
- **isDirty**：`updateListener` 在 `docChanged` 置 true；保存成功后 false
- **关 Tab**：`view.destroy()` + `editorInstances.delete(docId)`
- 类型见 `src/types/tab.ts`、`src/types/editor.ts`；Store 列表见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## IPC 不变量

- 前端**禁止**在组件中散落 `import { invoke } from '@tauri-apps/api/core'`
- 所有命令封装在 `src/api/`（按域分文件）
- 新命令：实现于 `src-tauri/src/commands/`，在 `lib.rs` 注册，并更新 `capabilities/default.json`
- 签名与类型以 `src/api/*.ts` 为准

---

## AI 任务执行规则

1. 确认任务所属阶段与技术栈约束
2. **直接修改仓库文件**；禁止只贴片段让用户自行插入
3. `pnpm tsc --noEmit` 须通过
4. TS：IPC `try/catch`；用户可见错误 `toast.error(toastErrorMessage(e))`
5. 单一职责；**禁止** `export *`
6. 交付时简短说明改了什么、为何改；**禁止**擅自扩大范围或静默删逻辑

### Codex / pnpm 运行说明（Windows）

- 本机 pnpm shim 路径：`C:\Users\zhang\AppData\Local\pnpm\bin\pnpm.CMD`
- Codex 沙箱内可能已含该 PATH，但直接执行用户目录下的 `pnpm.CMD` 会报“拒绝访问”。
- 遇到 `pnpm` 不可识别或 `pnpm.CMD` 拒绝访问时，优先用同一路径请求沙箱外执行授权；不要误判为项目缺依赖。
- 已确认沙箱外 `pnpm --version` 为 `11.1.2`。

**契约变更**时回复开头标明：

```markdown
### ⚠️ 契约变更
- 变更项
- 影响文件列表
```

---

## 性能与安全

**大文件**：<1MB 正常+高亮；1–10MB 关闭高亮+警告；>10MB 当前拒绝（P3+ 分片/只读未做）。

**内存**：关 Tab 必 destroy EditorView；Rust 句柄及时释放。

**安全**：路径规范化、拒绝 `..` 与非用户选定的敏感路径；禁止 shell 拼接用户输入；禁止 `dangerouslySetInnerHTML` 渲染文件内容；capabilities 最小权限。

**错误**：IPC 必须 try/catch；Rust 友好 `Result` 字符串；路径失败 `"Invalid path: access denied"`；保存成功 `toast.success`。详见 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) 验收表。

**系统主题**：禁止通过 Rust IPC 调用 `reg.exe` 读取 Windows 主题；启动路径使用 `window.matchMedia("(prefers-color-scheme: dark)")`，避免 release 启动性能回退。

---

## 已知技术债

1. Windows 构建后 `.exe` 图标可能仍旧（见 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)）
2. Sonner 仍用 `next-themes`；应用主题由 `uiStore` 管理
3. 目录监听仅前端防抖（`useDirWatcher`）
4. >10MB 直接拒绝；Command Palette 未做（P3+）

---

> **AI 开发者须知**：不确定时采用更保守方案（不增依赖、不改契约、不删代码），并标注 `[TODO: 需人工确认]`。
