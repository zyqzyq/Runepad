import type { AppLocale } from "@/stores/settingsStore";

export type MessageKey =
  | "settings.title"
  | "settings.close"
  | "settings.apply"
  | "settings.confirm"
  | "settings.resetDefault"
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
  | "settings.syntaxTheme.label"
  | "settings.syntaxTheme.default"
  | "settings.syntaxTheme.vscodeDark"
  | "settings.syntaxTheme.githubLight"
  | "settings.syntaxTheme.dracula"
  | "settings.syntaxTheme.nord"
  | "settings.syntaxTheme.tokyoNight"
  | "settings.syntaxTheme.xcodeLight"
  | "settings.locale.label"
  | "settings.locale.zh"
  | "settings.locale.en"
  | "header.appName"
  | "header.menu.file"
  | "header.menu.edit"
  | "header.newFile"
  | "header.openFile"
  | "header.saveFile"
  | "header.closeTab"
  | "header.recentFiles"
  | "header.openFolder"
  | "header.closeFolder"
  | "header.find"
  | "header.replace"
  | "header.settings"
  | "header.minimize"
  | "header.maximize"
  | "header.restore"
  | "header.closeWindow"
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
  | "fileChange.title"
  | "fileChange.description"
  | "fileChange.keep"
  | "fileChange.discardReload"
  | "sidebar.explorer"
  | "sidebar.expand"
  | "sidebar.collapse"
  | "tab.untitled"
  | "tab.untitledN"
  | "tab.unsaved"
  | "tab.dragReorder"
  | "tab.close"
  | "tab.scrollLeft"
  | "tab.scrollRight"
  | "status.lineCol"
  | "status.words"
  | "explorer.emptyFolder"
  | "dialog.filter.textFiles"
  | "dialog.filter.allFiles"
  | "toast.saved"
  | "toast.sessionRestoreFailed"
  | "toast.fileWatchFailed"
  | "toast.reloadFailed"
  | "toast.error";

const zhCN: Record<MessageKey, string> = {
  "settings.title": "设置",
  "settings.close": "关闭",
  "settings.apply": "应用",
  "settings.confirm": "确认",
  "settings.resetDefault": "恢复默认",
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
  "settings.syntaxTheme.label": "语法主题",
  "settings.syntaxTheme.default": "Runepad 默认",
  "settings.syntaxTheme.vscodeDark": "VS Code Dark",
  "settings.syntaxTheme.githubLight": "GitHub Light",
  "settings.syntaxTheme.dracula": "Dracula",
  "settings.syntaxTheme.nord": "Nord",
  "settings.syntaxTheme.tokyoNight": "Tokyo Night",
  "settings.syntaxTheme.xcodeLight": "Xcode Light",
  "settings.locale.label": "界面语言",
  "settings.locale.zh": "简体中文",
  "settings.locale.en": "English",
  "header.appName": "Runepad",
  "header.menu.file": "文件",
  "header.menu.edit": "编辑",
  "header.newFile": "新建",
  "header.openFile": "打开文件",
  "header.saveFile": "保存",
  "header.closeTab": "关闭标签",
  "header.recentFiles": "最近文件",
  "header.openFolder": "打开文件夹",
  "header.closeFolder": "关闭文件夹",
  "header.find": "查找",
  "header.replace": "替换",
  "header.settings": "设置",
  "header.minimize": "最小化",
  "header.maximize": "最大化",
  "header.restore": "还原",
  "header.closeWindow": "关闭窗口",
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
  "fileChange.title": "文件已在磁盘上更改",
  "fileChange.description":
    "“{filename}”有未保存的编辑。保留当前编辑，还是丢弃修改并加载本地文件？",
  "fileChange.keep": "保留当前编辑",
  "fileChange.discardReload": "丢弃并加载",
  "sidebar.explorer": "资源管理器",
  "sidebar.expand": "展开侧栏",
  "sidebar.collapse": "折叠侧栏",
  "tab.untitled": "未命名",
  "tab.untitledN": "未命名-{n}",
  "tab.unsaved": "有未保存的更改",
  "tab.dragReorder": "拖动以重新排序 {filename}",
  "tab.close": "关闭 {filename}",
  "tab.scrollLeft": "向左滚动标签",
  "tab.scrollRight": "向右滚动标签",
  "status.lineCol": "行 {line}，列 {col}",
  "status.words": "{count} 字",
  "explorer.emptyFolder": "文件夹为空",
  "dialog.filter.textFiles": "文本文件",
  "dialog.filter.allFiles": "所有文件",
  "toast.saved": "已保存 {filename}",
  "toast.sessionRestoreFailed": "会话恢复失败：{message}",
  "toast.fileWatchFailed": "文件监视失败：{message}",
  "toast.reloadFailed": "无法重新加载 {filename}：{message}",
  "toast.error": "{message}",
};

const enUS: Record<MessageKey, string> = {
  "settings.title": "Settings",
  "settings.close": "Close",
  "settings.apply": "Apply",
  "settings.confirm": "OK",
  "settings.resetDefault": "Restore defaults",
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
  "settings.syntaxTheme.label": "Syntax theme",
  "settings.syntaxTheme.default": "Runepad default",
  "settings.syntaxTheme.vscodeDark": "VS Code Dark",
  "settings.syntaxTheme.githubLight": "GitHub Light",
  "settings.syntaxTheme.dracula": "Dracula",
  "settings.syntaxTheme.nord": "Nord",
  "settings.syntaxTheme.tokyoNight": "Tokyo Night",
  "settings.syntaxTheme.xcodeLight": "Xcode Light",
  "settings.locale.label": "Interface language",
  "settings.locale.zh": "简体中文",
  "settings.locale.en": "English",
  "header.appName": "Runepad",
  "header.menu.file": "File",
  "header.menu.edit": "Edit",
  "header.newFile": "New file",
  "header.openFile": "Open file",
  "header.saveFile": "Save",
  "header.closeTab": "Close tab",
  "header.recentFiles": "Recent files",
  "header.openFolder": "Open folder",
  "header.closeFolder": "Close folder",
  "header.find": "Find",
  "header.replace": "Replace",
  "header.settings": "Settings",
  "header.minimize": "Minimize",
  "header.maximize": "Maximize",
  "header.restore": "Restore",
  "header.closeWindow": "Close window",
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
  "fileChange.title": "File changed on disk",
  "fileChange.description":
    "'{filename}' has unsaved edits. Keep your current edits, or discard them and load the local file?",
  "fileChange.keep": "Keep current edits",
  "fileChange.discardReload": "Discard and reload",
  "sidebar.explorer": "Explorer",
  "sidebar.expand": "Expand sidebar",
  "sidebar.collapse": "Collapse sidebar",
  "tab.untitled": "Untitled",
  "tab.untitledN": "Untitled-{n}",
  "tab.unsaved": "Unsaved changes",
  "tab.dragReorder": "Drag to reorder {filename}",
  "tab.close": "Close {filename}",
  "tab.scrollLeft": "Scroll tabs left",
  "tab.scrollRight": "Scroll tabs right",
  "status.lineCol": "Ln {line}, Col {col}",
  "status.words": "{count} words",
  "explorer.emptyFolder": "Empty folder",
  "dialog.filter.textFiles": "Text files",
  "dialog.filter.allFiles": "All files",
  "toast.saved": "Saved {filename}",
  "toast.sessionRestoreFailed": "Session restore failed: {message}",
  "toast.fileWatchFailed": "File watch failed: {message}",
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
