import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExplorerStore } from "@/stores/explorerStore";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/stores/settingsStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";
import type { Tab } from "@/types/tab";

export function makeTab(patch: Partial<Tab> = {}): Tab {
  return {
    id: patch.id ?? crypto.randomUUID(),
    filename: patch.filename ?? "Untitled",
    filepath: patch.filepath ?? null,
    isDirty: patch.isDirty ?? false,
    isNew: patch.isNew ?? true,
    language: patch.language ?? "plaintext",
    encoding: patch.encoding ?? "UTF-8",
    lineEnding: patch.lineEnding ?? "LF",
  };
}

export function resetStores(tabs: Tab[] = [makeTab({ id: "tab-1" })]): void {
  const activeId = tabs[0]?.id ?? null;
  useTabStore.setState({ tabs, activeId });
  useExplorerStore.setState({ rootPath: null, expandedPaths: {}, childrenByPath: {} });
  useUiStore.setState(
    {
      theme: "system",
      resolvedTheme: "light",
      sidebarCollapsed: false,
      recentFilesOpen: false,
      settingsOpen: false,
    },
  );
  useRecentFilesStore.setState({ paths: [] });
  useSettingsStore.setState(DEFAULT_SETTINGS);
  useEditorStore.setState({ metaByDocId: {} });
  useCloseTabStore.setState({ pendingTabId: null });
  editorInstances.clear();
  pendingInitialDocs.clear();
}
