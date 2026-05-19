import type { AppLocale } from "@/stores/settingsStore";

export type MessageKey =
  | "settings.title"
  | "settings.close"
  | "settings.tab.appearance"
  | "settings.tab.editor"
  | "settings.tab.language"
  | "settings.theme.label"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.theme.system"
  | "settings.font.family"
  | "settings.font.size"
  | "settings.font.preset.default"
  | "settings.font.preset.cascadia"
  | "settings.font.preset.consolas"
  | "settings.font.preset.jetbrains"
  | "settings.font.preset.fira"
  | "settings.locale.label"
  | "settings.locale.zh"
  | "settings.locale.en"
  | "recent.title"
  | "recent.description.empty"
  | "recent.description.list"
  | "recent.clear"
  | "recent.close"
  | "closeTab.title"
  | "closeTab.description"
  | "closeTab.cancel"
  | "closeTab.discard"
  | "closeTab.save"
  | "sidebar.explorer"
  | "sidebar.expand"
  | "sidebar.collapse"
  | "tab.untitled"
  | "tab.untitledN"
  | "tab.unsaved"
  | "tab.dragReorder"
  | "tab.close"
  | "status.lineCol"
  | "status.words"
  | "explorer.emptyFolder"
  | "dialog.filter.textFiles"
  | "dialog.filter.allFiles"
  | "toast.saved"
  | "toast.sessionRestored"
  | "toast.sessionRestoreFailed"
  | "toast.fileWatchFailed"
  | "toast.fileChangedOnDisk"
  | "toast.reloadFailed"
  | "toast.error";

const zhCN: Record<MessageKey, string> = {
  "settings.title": "设置",
  "settings.close": "关闭",
  "settings.tab.appearance": "外观",
  "settings.tab.editor": "编辑器",
  "settings.tab.language": "语言",
  "settings.theme.label": "主题",
  "settings.theme.light": "浅色",
  "settings.theme.dark": "深色",
  "settings.theme.system": "跟随系统",
  "settings.font.family": "字体",
  "settings.font.size": "字号",
  "settings.font.preset.default": "系统默认",
  "settings.font.preset.cascadia": "Cascadia Mono",
  "settings.font.preset.consolas": "Consolas",
  "settings.font.preset.jetbrains": "JetBrains Mono",
  "settings.font.preset.fira": "Fira Code",
  "settings.locale.label": "界面语言",
  "settings.locale.zh": "简体中文",
  "settings.locale.en": "English",
  "recent.title": "最近打开",
  "recent.description.empty": "暂无最近文件。打开或保存文件后会出现在这里。",
  "recent.description.list": "选择要打开的文件。",
  "recent.clear": "清空列表",
  "recent.close": "关闭",
  "closeTab.title": "未保存的更改",
  "closeTab.description": "“{filename}”有未保存的更改。不保存并关闭？",
  "closeTab.cancel": "取消",
  "closeTab.discard": "不保存",
  "closeTab.save": "保存",
  "sidebar.explorer": "资源管理器",
  "sidebar.expand": "展开侧栏",
  "sidebar.collapse": "折叠侧栏",
  "tab.untitled": "未命名",
  "tab.untitledN": "未命名-{n}",
  "tab.unsaved": "有未保存的更改",
  "tab.dragReorder": "拖动以重新排序 {filename}",
  "tab.close": "关闭 {filename}",
  "status.lineCol": "行 {line}，列 {col}",
  "status.words": "{count} 字",
  "explorer.emptyFolder": "文件夹为空",
  "dialog.filter.textFiles": "文本文件",
  "dialog.filter.allFiles": "所有文件",
  "toast.saved": "已保存 {filename}",
  "toast.sessionRestored": "已恢复 {count} 个标签",
  "toast.sessionRestoreFailed": "会话恢复失败：{message}",
  "toast.fileWatchFailed": "文件监视失败：{message}",
  "toast.fileChangedOnDisk": "{filename} 已在磁盘上更改（标签页有未保存的编辑）",
  "toast.reloadFailed": "无法重新加载 {filename}：{message}",
  "toast.error": "{message}",
};

const enUS: Record<MessageKey, string> = {
  "settings.title": "Settings",
  "settings.close": "Close",
  "settings.tab.appearance": "Appearance",
  "settings.tab.editor": "Editor",
  "settings.tab.language": "Language",
  "settings.theme.label": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.font.family": "Font",
  "settings.font.size": "Font size",
  "settings.font.preset.default": "System default",
  "settings.font.preset.cascadia": "Cascadia Mono",
  "settings.font.preset.consolas": "Consolas",
  "settings.font.preset.jetbrains": "JetBrains Mono",
  "settings.font.preset.fira": "Fira Code",
  "settings.locale.label": "Interface language",
  "settings.locale.zh": "简体中文",
  "settings.locale.en": "English",
  "recent.title": "Recent files",
  "recent.description.empty":
    "No recent files yet. Open or save a file to add it here.",
  "recent.description.list": "Select a file to open.",
  "recent.clear": "Clear list",
  "recent.close": "Close",
  "closeTab.title": "Unsaved changes",
  "closeTab.description":
    "'{filename}' has unsaved changes. Close without saving?",
  "closeTab.cancel": "Cancel",
  "closeTab.discard": "Don't save",
  "closeTab.save": "Save",
  "sidebar.explorer": "Explorer",
  "sidebar.expand": "Expand sidebar",
  "sidebar.collapse": "Collapse sidebar",
  "tab.untitled": "Untitled",
  "tab.untitledN": "Untitled-{n}",
  "tab.unsaved": "Unsaved changes",
  "tab.dragReorder": "Drag to reorder {filename}",
  "tab.close": "Close {filename}",
  "status.lineCol": "Ln {line}, Col {col}",
  "status.words": "{count} words",
  "explorer.emptyFolder": "Empty folder",
  "dialog.filter.textFiles": "Text files",
  "dialog.filter.allFiles": "All files",
  "toast.saved": "Saved {filename}",
  "toast.sessionRestored": "Restored {count} tab(s)",
  "toast.sessionRestoreFailed": "Session restore failed: {message}",
  "toast.fileWatchFailed": "File watch failed: {message}",
  "toast.fileChangedOnDisk":
    "{filename} was changed on disk (tab has unsaved edits)",
  "toast.reloadFailed": "Could not reload {filename}: {message}",
  "toast.error": "{message}",
};

const catalogs: Record<AppLocale, Record<MessageKey, string>> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export function t(
  key: MessageKey,
  locale: AppLocale,
  params?: Record<string, string>,
): string {
  let text = catalogs[locale][key] ?? catalogs["en-US"][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(v);
    }
  }
  return text;
}
