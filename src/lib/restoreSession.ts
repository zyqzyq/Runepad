import { readDir } from "@/api/dirApi";
import { disposeTabEditor } from "@/lib/editorInstances";
import { languageFromFilename } from "@/lib/languageFromFilename";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { loadTabContentFromDisk } from "@/lib/reloadTabFromDisk";
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

function sessionTabHasCachedContent(st: SessionTab): boolean {
  return (
    st.content != null && (st.content !== "" || st.isDirty || st.isNew)
  );
}

function applyCachedSessionContent(tab: Tab, st: SessionTab): void {
  if (st.content != null) {
    pendingInitialDocs.set(tab.id, st.content);
    if (st.isDirty) {
      useTabStore.getState().markDirty(tab.id, true);
    }
    return;
  }
  pendingInitialDocs.set(tab.id, "");
}

function tabNeedsDiskLoad(tab: Tab, st: SessionTab): boolean {
  return Boolean(tab.filepath && !sessionTabHasCachedContent(st));
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

function restoreSessionInBackground(
  restoredTabs: Tab[],
  sessionTabs: SessionTab[],
  activeTabId: string | null,
  snapshot: SessionSnapshot,
): void {
  void (async () => {
    const tabStore = useTabStore.getState();

    const loads = restoredTabs
      .map((tab, i) => {
        const st = sessionTabs[i];
        if (!tab || !st || tab.id === activeTabId) return null;
        if (!tabNeedsDiskLoad(tab, st)) return null;
        return loadTabContentFromDisk(tab, { showErrorToast: false }).then(
          (ok) => {
            if (!ok) {
              tabStore.closeTab(tab.id);
            }
          },
        );
      })
      .filter((task): task is Promise<void> => task !== null);

    await Promise.all(loads);

    if (snapshot.explorerRoot) {
      await loadExplorerTree(snapshot.explorerRoot, snapshot.expandedPaths);
    }
  })();
}

/** Restores UI and active-tab content; other tabs and explorer load in the background. */
export async function restoreSession(snapshot: SessionSnapshot): Promise<void> {
  const tabStore = useTabStore.getState();

  for (const tab of tabStore.tabs) {
    disposeTabEditor(tab.id);
  }

  const sessionTabs = snapshot.tabs;
  const restoredTabs = sessionTabs.map(sessionTabToTab);
  const activeTab =
    restoredTabs[snapshot.activeIndex] ?? restoredTabs[0] ?? null;

  for (let i = 0; i < restoredTabs.length; i++) {
    const tab = restoredTabs[i];
    const st = sessionTabs[i];
    if (!tab || !st) continue;

    if (sessionTabHasCachedContent(st) || !tab.filepath) {
      applyCachedSessionContent(tab, st);
    }
  }

  if (
    snapshot.theme === "light" ||
    snapshot.theme === "dark" ||
    snapshot.theme === "system"
  ) {
    useUiStore.getState().setTheme(snapshot.theme as ThemePreference);
  }

  tabStore.replaceTabs(restoredTabs, activeTab?.id ?? null);

  if (activeTab) {
    const activeIndex = restoredTabs.indexOf(activeTab);
    const activeSession = sessionTabs[activeIndex];
    if (activeSession && tabNeedsDiskLoad(activeTab, activeSession)) {
      const ok = await loadTabContentFromDisk(activeTab);
      if (!ok) {
        tabStore.closeTab(activeTab.id);
      }
    }
  }

  restoreSessionInBackground(
    restoredTabs,
    sessionTabs,
    activeTab?.id ?? null,
    snapshot,
  );
}
