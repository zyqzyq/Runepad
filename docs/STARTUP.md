# 启动性能

> 发布版本的启动行为与会话恢复链路说明。

## 当前策略

- 应用从 `tabStore` 的初始状态立即渲染一个轻量未命名 Tab，使编辑器区域在会话 IO 完成前即可见。
- `EditorPanel` 保持懒加载；`main.tsx` 在第一帧后预取该组件。这让 CodeMirror 不进入首屏关键路径，同时又在短时间内可用。
- 会话恢复分为两个阶段：
  - `load_session_preview` 读取 `session.preview.json`，包含标签元数据、活动索引、资源管理器根路径/展开状态、主题、侧边栏状态与窗口状态等，但不包含文档正文。
  - `load_session` 稍后读取完整的 `session.json`，恢复未保存内容。
- 在预览恢复后优先加载资源管理器根目录和活动标签内容，使可见的树和活动编辑器内容先于低优先级的会话工作出现。
- 设置/最近文件/脏关闭宿主组件均为懒加载，仅在打开时才挂载。
- 窗口状态（位置、尺寸、最大化）在窗口显示前即从 preview 恢复，由 Rust 端的 `load_session_preview_window_state` 完成。

## 当前代码路径

- `src/main.tsx`：标记启动耗时点，渲染 React，第一帧后预取 `EditorPanel`。
- `src/components/layout/AppLayout.tsx`：挂载全局启动钩子与懒加载对话框宿主。
- `src/hooks/useSessionRestore.ts`：编排预览恢复、完整恢复、启动文件处理、防抖保存与关闭时 flush。
- `src/lib/persistSession.ts` 与 `src/lib/buildSessionSnapshot.ts`：收集并持久化会话状态，不在 Zustand 中存储完整文档内容。
- `src/lib/windowState.ts`：读取当前窗口几何信息并纳入会话快照。
- `src-tauri/src/commands/session_ops.rs`：写入 `session.json` 与精简的 `session.preview.json`；提供 `load_session_preview_window_state` 供启动时提前恢复窗口。
- `src-tauri/src/commands/window_ops.rs`：在窗口显示前应用 preview 中的窗口状态。

## 重要约束

- **禁止在启动时通过 Rust IPC 获取系统主题**。使用 `window.matchMedia("(prefers-color-scheme: dark)")`；在 Windows 上调用 `reg.exe` 曾导致发布版本启动卡顿约 6 秒。
- **禁止重新引入 `get_system_theme` 或任何基于 `reg.exe` 的主题查询**。系统主题应通过 WebView `matchMedia` 获取，包括启动时和后续主题变更处理。
- **禁止在启动热路径添加同步日志**。临时的 `startup.log` 诊断有助于定位问题，但文件写入和额外 invoke 会扭曲启动测量结果。
- 保持 `session.preview.json` 体积小巧且不含文档 `content`。完整正文只在 `session.json` 中按需保存（针对脏标签或新标签）。
- 除非有实测依据，否则不要将 CodeMirror 移入主启动包；这会增加应用壳层就绪前需解析的 JS 量。
- 侧边栏宽度与折叠状态已纳入会话保存；它们不阻塞首屏渲染，但应在窗口可见前尽早恢复，以避免布局跳动。

## 诊断

使用 `src/lib/startupPerf.ts` 中的浏览器 Performance API 辅助函数进行临时排查。开发环境下会输出到控制台。发布版本中可通过以下方式启用控制台日志：

```js
localStorage.setItem("runepad:startup-perf", "1")
```

诊断完成后应移除基于文件的临时日志，除非存在持久化遥测的产品需求。
