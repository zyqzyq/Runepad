import { editorInstances } from "@/lib/editorInstances";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";
import type { SessionSnapshot, SessionTab } from "@/types/session";
import type { Tab } from "@/types/tab";

const SESSION_VERSION = 2;

function tabNeedsContent(tab: Tab): boolean {
  return tab.isDirty || tab.isNew || tab.filepath === null;
}

function tabToSessionTab(tab: Tab): SessionTab {
  const needsContent = tabNeedsContent(tab);
  const content = needsContent
    ? (editorInstances.get(tab.id)?.state.doc.toString() ?? "")
    : undefined;

  return {
    filepath: tab.filepath,
    filename: tab.filename,
    isNew: tab.isNew,
    encoding: tab.encoding,
    lineEnding: tab.lineEnding,
    language: tab.language,
    content,
    isDirty: tab.isDirty,
  };
}

export function buildSessionSnapshot(): SessionSnapshot {
  const { tabs, activeId } = useTabStore.getState();
  const { rootPath, expandedPaths } = useExplorerStore.getState();
  const { theme } = useUiStore.getState();

  const activeIndex = Math.max(
    0,
    activeId ? tabs.findIndex((t) => t.id === activeId) : 0,
  );

  return {
    version: SESSION_VERSION,
    activeIndex,
    tabs: tabs.map(tabToSessionTab),
    explorerRoot: rootPath,
    expandedPaths: Object.keys(expandedPaths),
    theme,
  };
}
