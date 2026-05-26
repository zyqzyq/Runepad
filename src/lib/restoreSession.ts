// Runepad | Module: restoreSession | Depends on: dirApi, openFileInTab, stores

import { readDir } from "@/api/dirApi";
import { disposeTabEditor } from "@/lib/editorInstances";
import { languageFromFilename } from "@/lib/languageFromFilename";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { loadTabContentFromDisk } from "@/lib/reloadTabFromDisk";
import { setEditorContent } from "@/lib/setEditorContent";
import { startupMark, startupMeasure } from "@/lib/startupPerf";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import {
  DEFAULT_SIDEBAR_WIDTH,
  useUiStore,
  type ThemePreference,
} from "@/stores/uiStore";
import type { SessionSnapshot, SessionTab } from "@/types/session";
import type { LineEnding, Tab } from "@/types/tab";

interface RestoreSessionOptions {
  awaitActiveTabLoad?: boolean;
  awaitExplorerRootLoad?: boolean;
  reuseExistingTabIds?: boolean;
}

function parseLineEnding(value: string): LineEnding {
  return value === "CRLF" ? "CRLF" : "LF";
}

function sessionTabToTab(st: SessionTab, existingId?: string): Tab {
  const filenameLanguage = languageFromFilename(st.filename);
  return {
    id: existingId ?? crypto.randomUUID(),
    filename: st.filename,
    filepath: st.filepath,
    isNew: st.isNew,
    isDirty: st.isDirty,
    encoding: st.encoding,
    lineEnding: parseLineEnding(String(st.lineEnding)),
    language:
      st.language && st.language !== "plaintext"
        ? st.language
        : filenameLanguage,
  };
}

function sessionTabHasCachedContent(st: SessionTab): boolean {
  return (
    st.content != null && (st.content !== "" || st.isDirty || st.isNew)
  );
}

function applyCachedSessionContent(tab: Tab, st: SessionTab): void {
  if (st.content != null) {
    setEditorContent(tab.id, st.content);
    if (st.isDirty) {
      useTabStore.getState().markDirty(tab.id, true);
    }
    return;
  }
  pendingInitialDocs.set(tab.id, "");
}

function tabNeedsDiskLoad(tab: Tab, st: SessionTab): boolean {
  return Boolean(
    tab.filepath &&
      !st.isDirty &&
      !st.isNew &&
      !sessionTabHasCachedContent(st),
  );
}

async function loadExplorerTree(
  root: string,
  expandedPaths: string[],
): Promise<void> {
  const store = useExplorerStore.getState();
  const pathsToLoad = Array.from(
    new Set([root, ...expandedPaths.filter((p) => p !== root)]),
  );
  for (const [index, p] of pathsToLoad.entries()) {
    try {
      if (index === 0) {
        startupMark("explorer-root-load-start");
      }
      const entries = await readDir(p);
      store.setChildren(p, entries);
      if (index === 0) {
        startupMeasure("explorer-root-loaded", "explorer-root-load-start");
      }
    } catch {
      // Skip paths that no longer exist
    }
  }
}

async function loadExplorerRoot(root: string): Promise<void> {
  const store = useExplorerStore.getState();
  try {
    startupMark("explorer-root-load-start");
    const entries = await readDir(root);
    store.setChildren(root, entries);
    startupMeasure("explorer-root-loaded", "explorer-root-load-start");
  } catch {
    // Skip paths that no longer exist
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

    if (snapshot.explorerRoot) {
      void loadExplorerTree(snapshot.explorerRoot, snapshot.expandedPaths);
    }

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
  })();
}

/** Restores UI and active-tab content; other tabs and explorer load in the background. */
export async function restoreSession(
  snapshot: SessionSnapshot,
  options: RestoreSessionOptions = {},
): Promise<void> {
  const {
    awaitActiveTabLoad = true,
    awaitExplorerRootLoad = false,
    reuseExistingTabIds = false,
  } = options;
  const tabStore = useTabStore.getState();
  const existingTabs = tabStore.tabs;

  if (!reuseExistingTabIds) {
    for (const tab of existingTabs) {
      disposeTabEditor(tab.id);
    }
  }

  const sessionTabs = snapshot.tabs;
  const restoredTabs = sessionTabs.map((tab, index) =>
    sessionTabToTab(
      tab,
      reuseExistingTabIds ? existingTabs[index]?.id : undefined,
    ),
  );
  const restoredIds = new Set(restoredTabs.map((tab) => tab.id));
  for (const tab of existingTabs) {
    if (!restoredIds.has(tab.id)) {
      disposeTabEditor(tab.id);
    }
  }
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
  useUiStore
    .getState()
    .setSidebarCollapsed(snapshot.sidebarCollapsed === true);
  useUiStore
    .getState()
    .setSidebarWidth(snapshot.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);

  tabStore.replaceTabs(restoredTabs, activeTab?.id ?? null);
  startupMeasure("session-ui-restored", "start");

  if (snapshot.explorerRoot) {
    useExplorerStore
      .getState()
      .restoreExplorer(snapshot.explorerRoot, snapshot.expandedPaths);
    startupMeasure("explorer-state-restored", "start");
  }

  if (awaitExplorerRootLoad && snapshot.explorerRoot) {
    await loadExplorerRoot(snapshot.explorerRoot);
  }

  restoreSessionInBackground(
    restoredTabs,
    sessionTabs,
    activeTab?.id ?? null,
    snapshot,
  );

  const loadActiveTab = async (): Promise<void> => {
    if (!activeTab) return;
    const activeIndex = restoredTabs.indexOf(activeTab);
    const activeSession = sessionTabs[activeIndex];
    if (activeSession && tabNeedsDiskLoad(activeTab, activeSession)) {
      const ok = await loadTabContentFromDisk(activeTab);
      if (!ok) {
        tabStore.closeTab(activeTab.id);
      }
    }
  };

  if (awaitActiveTabLoad) {
    await loadActiveTab();
  } else {
    void loadActiveTab();
  }
}
