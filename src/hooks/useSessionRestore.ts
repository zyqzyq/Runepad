import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getT, toastErrorMessage } from "@/i18n";
import { getLaunchFiles, listenOpenFiles } from "@/api/systemApi";
import { loadSession, loadSessionPreview, saveSession } from "@/api/sessionApi";
import { finishWindowClose } from "@/api/windowApi";
import { syncFileWatchesNow } from "@/hooks/useDirWatcher";
import { buildSessionSnapshot } from "@/lib/buildSessionSnapshot";
import { disposeTabEditor } from "@/lib/editorInstances";
import { openFileInTab } from "@/lib/openFileInTab";
import { persistSessionSnapshot } from "@/lib/persistSession";
import { restoreSession } from "@/lib/restoreSession";
import { startupMark, startupMeasure } from "@/lib/startupPerf";
import { readCurrentWindowState } from "@/lib/windowState";
import { useEditorStore } from "@/stores/editorStore";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

const SAVE_DEBOUNCE_MS = 2000;
const DIRTY_SAVE_DEBOUNCE_MS = 500;
const WINDOW_CLOSING_EVENT = "runepad://window-closing";

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function getDebounceMs(): number {
  const hasDirty = useTabStore.getState().tabs.some((t) => t.isDirty);
  return hasDirty ? DIRTY_SAVE_DEBOUNCE_MS : SAVE_DEBOUNCE_MS;
}

async function openLaunchFiles(paths: string[]): Promise<void> {
  const initialTabs = useTabStore.getState().tabs;
  const replaceInitialTab =
    initialTabs.length === 1 &&
    initialTabs[0]?.isNew === true &&
    initialTabs[0].filepath === null &&
    !initialTabs[0].isDirty;
  const initialTabId = replaceInitialTab ? initialTabs[0]?.id : null;
  let openedAny = false;

  for (const path of paths) {
    try {
      await openFileInTab(path);
      openedAny = true;
    } catch (e) {
      toast.error(toastErrorMessage(e));
    }
  }

  if (openedAny && initialTabId) {
    disposeTabEditor(initialTabId);
    useEditorStore.getState().removeMeta(initialTabId);
    useTabStore.getState().closeTab(initialTabId);
  }
}

export function useSessionRestore(): void {
  const restoreStarted = useRef(false);
  const restoreDone = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuedOpenPaths = useRef<string[]>([]);

  const persistSession = async (): Promise<void> => {
    if (!restoreDone.current) return;
    try {
      await persistSessionSnapshot();
    } catch (e) {
      toast.error(toastErrorMessage(e));
    }
  };

  const scheduleSave = (delayMs?: number): void => {
    if (!restoreDone.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const delay = delayMs ?? getDebounceMs();
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void persistSession();
    }, delay);
  };

  const flushSessionBeforeClose = async (): Promise<void> => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    if (!restoreDone.current) return;

    try {
      const windowState = await readCurrentWindowState();
      const snapshot = buildSessionSnapshot({ windowState });
      await saveSession(snapshot);
    } catch {
      // Do not block window close on snapshot build failure
    }
  };

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    const run = async (): Promise<void> => {
      let restoredPreview = false;
      try {
        const launchFiles = await getLaunchFiles();

        startupMark("session-preview-load-start");
        const preview = await loadSessionPreview();
        startupMeasure("session-preview-load", "session-preview-load-start");
        if (preview) {
          await restoreSession(preview, {
            awaitActiveTabLoad: true,
            awaitExplorerRootLoad: true,
          });
          restoredPreview = true;
          syncFileWatchesNow();
          await waitForNextPaint();
        } else if (useTabStore.getState().tabs.length === 0) {
          useTabStore.getState().addNewTab();
        }

        startupMark("session-load-start");
        const snapshot = await loadSession();
        startupMeasure("session-load", "session-load-start");
        if (snapshot) {
          await restoreSession(snapshot, {
            awaitActiveTabLoad: !restoredPreview,
            reuseExistingTabIds: restoredPreview,
          });
          if (snapshot.tabs.length > 0) {
            toast.success(
              getT()("toast.sessionRestored", {
                count: String(snapshot.tabs.length),
              }),
            );
          }
          syncFileWatchesNow();
        } else if (!restoredPreview && useTabStore.getState().tabs.length === 0) {
          useTabStore.getState().addNewTab();
        }

        if (launchFiles.length > 0) {
          await openLaunchFiles(launchFiles);
          syncFileWatchesNow();
        }
      } catch (e) {
        toast.error(
          getT()("toast.sessionRestoreFailed", {
            message: e instanceof Error ? e.message : String(e),
          }),
        );
      } finally {
        restoreDone.current = true;
        if (queuedOpenPaths.current.length > 0) {
          const paths = queuedOpenPaths.current;
          queuedOpenPaths.current = [];
          await openLaunchFiles(paths);
          syncFileWatchesNow();
        }
      }
    };

    void run();
  }, []);

  useEffect(() => {
    let unlistenOpenFiles: (() => void) | undefined;
    let active = true;

    void listenOpenFiles((paths) => {
      if (!restoreDone.current) {
        queuedOpenPaths.current.push(...paths);
        return;
      }

      void openLaunchFiles(paths).then(syncFileWatchesNow);
    }).then((unlisten) => {
      if (!active) {
        unlisten();
        return;
      }
      unlistenOpenFiles = unlisten;
    });

    return () => {
      active = false;
      unlistenOpenFiles?.();
    };
  }, []);

  useEffect(() => {
    let unlistenClosing: (() => void) | undefined;
    let active = true;

    // Window X is handled in Rust (CloseRequested -> emit). JS onCloseRequested
    // + destroy() is unreliable in dev; finish_window_close uses Rust destroy().
    void listen(WINDOW_CLOSING_EVENT, () => {
      void (async () => {
        await flushSessionBeforeClose();
        await finishWindowClose().catch(() => {
          // Ignore; ExitRequested may still flush session cache
        });
      })();
    }).then((unlisten) => {
      if (!active) {
        unlisten();
        return;
      }
      unlistenClosing = unlisten;
    });

    const unsubTab = useTabStore.subscribe(() => scheduleSave());
    const unsubEditor = useEditorStore.subscribe(() =>
      scheduleSave(DIRTY_SAVE_DEBOUNCE_MS),
    );
    const unsubExplorer = useExplorerStore.subscribe(() =>
      scheduleSave(SAVE_DEBOUNCE_MS),
    );
    const unsubUi = useUiStore.subscribe((state, prev) => {
      if (
        state.theme !== prev.theme ||
        state.sidebarCollapsed !== prev.sidebarCollapsed ||
        state.sidebarWidth !== prev.sidebarWidth
      ) {
        scheduleSave(SAVE_DEBOUNCE_MS);
      }
    });

    const onVisibility = (): void => {
      if (document.visibilityState === "hidden") {
        void persistSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      unlistenClosing?.();
      unsubTab();
      unsubEditor();
      unsubExplorer();
      unsubUi();
      document.removeEventListener("visibilitychange", onVisibility);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);
}
