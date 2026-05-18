import { readDir } from "@/api/dirApi";
import { disposeTabEditor } from "@/lib/editorInstances";
import { languageFromFilename } from "@/lib/languageFromFilename";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { reloadTabFromDisk } from "@/lib/reloadTabFromDisk";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore, type ThemePreference } from "@/stores/uiStore";
import type { SessionSnapshot, SessionTab } from "@/types/session";
import type { LineEnding, Tab } from "@/types/tab";

function parseLineEnding(value: string): LineEnding {
  return value === "CRLF" ? "CRLF" : "LF";
}

function sessionTabToTab(st: SessionTab): Tab {
  return {
    id: crypto.randomUUID(),
    filename: st.filename,
    filepath: st.filepath,
    isNew: st.isNew,
    isDirty: st.isDirty,
    encoding: st.encoding,
    lineEnding: parseLineEnding(String(st.lineEnding)),
    language: st.language || languageFromFilename(st.filename),
  };
}

async function loadExplorerTree(
  root: string,
  expandedPaths: string[],
): Promise<void> {
  const store = useExplorerStore.getState();
  store.restoreExplorer(root, expandedPaths);

  const pathsToLoad = new Set<string>([root, ...expandedPaths]);
  for (const p of pathsToLoad) {
    try {
      const entries = await readDir(p);
      store.setChildren(p, entries);
    } catch {
      // Skip paths that no longer exist
    }
  }
}

export async function restoreSession(snapshot: SessionSnapshot): Promise<void> {
  const tabStore = useTabStore.getState();

  for (const tab of tabStore.tabs) {
    disposeTabEditor(tab.id);
  }

  const restoredTabs = snapshot.tabs.map(sessionTabToTab);
  const activeTab = restoredTabs[snapshot.activeIndex] ?? restoredTabs[0];
  tabStore.replaceTabs(restoredTabs, activeTab?.id ?? null);

  if (
    snapshot.theme === "light" ||
    snapshot.theme === "dark" ||
    snapshot.theme === "system"
  ) {
    useUiStore.getState().setTheme(snapshot.theme as ThemePreference);
  }

  if (snapshot.explorerRoot) {
    await loadExplorerTree(snapshot.explorerRoot, snapshot.expandedPaths);
  }

  const sessionTabs = snapshot.tabs;
  for (let i = 0; i < restoredTabs.length; i++) {
    const tab = restoredTabs[i];
    const st = sessionTabs[i];
    if (!tab || !st) continue;

    if (st.content != null) {
      pendingInitialDocs.set(tab.id, st.content);
      if (st.isDirty) {
        tabStore.markDirty(tab.id, true);
      }
    } else if (tab.filepath) {
      const ok = await reloadTabFromDisk(tab);
      if (!ok) {
        tabStore.closeTab(tab.id);
      }
    } else {
      pendingInitialDocs.set(tab.id, "");
    }
  }
}
