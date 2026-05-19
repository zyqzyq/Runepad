import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getT, toastErrorMessage } from "@/i18n";
import { loadSession, saveSession } from "@/api/sessionApi";
import { finishWindowClose } from "@/api/windowApi";
import { syncFileWatchesNow } from "@/hooks/useDirWatcher";
import { buildSessionSnapshot } from "@/lib/buildSessionSnapshot";
import { persistSessionSnapshot } from "@/lib/persistSession";
import { restoreSession } from "@/lib/restoreSession";
import { useEditorStore } from "@/stores/editorStore";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

const SAVE_DEBOUNCE_MS = 2000;
const DIRTY_SAVE_DEBOUNCE_MS = 500;
const WINDOW_CLOSING_EVENT = "runepad://window-closing";

function getDebounceMs(): number {
  const hasDirty = useTabStore.getState().tabs.some((t) => t.isDirty);
  return hasDirty ? DIRTY_SAVE_DEBOUNCE_MS : SAVE_DEBOUNCE_MS;
}

function isSessionPersistFresh(lastPersistedAt: number): boolean {
  return (
    lastPersistedAt > 0 && Date.now() - lastPersistedAt < SAVE_DEBOUNCE_MS
  );
}

export function useSessionRestore(): void {
  const restoreStarted = useRef(false);
  const restoreDone = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPersistedAt = useRef(0);

  const persistSession = async (): Promise<void> => {
    if (!restoreDone.current) return;
    try {
      await persistSessionSnapshot();
      lastPersistedAt.current = Date.now();
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

  const flushSessionBeforeClose = (): void => {
    const hadPendingSave = saveTimer.current !== null;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    if (!restoreDone.current) return;

    const skipCloseSave =
      !hadPendingSave && isSessionPersistFresh(lastPersistedAt.current);
    if (skipCloseSave) return;

    try {
      const snapshot = buildSessionSnapshot();
      void saveSession(snapshot).catch(() => {
        // Window is closing; avoid toast noise
      });
    } catch {
      // Do not block window close on snapshot build failure
    }
  };

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    const run = async (): Promise<void> => {
      try {
        const snapshot = await loadSession();
        if (snapshot && snapshot.tabs.length > 0) {
          await restoreSession(snapshot);
          toast.success(
            getT()("toast.sessionRestored", {
              count: String(snapshot.tabs.length),
            }),
          );
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
      }
    };

    void run();
  }, []);

  useEffect(() => {
    let unlistenClosing: (() => void) | undefined;
    let active = true;

    // Window X is handled in Rust (CloseRequested -> emit). JS onCloseRequested
    // + destroy() is unreliable in dev; finish_window_close uses Rust destroy().
    void listen(WINDOW_CLOSING_EVENT, () => {
      void finishWindowClose().catch(() => {
        // Ignore; ExitRequested may still flush session cache
      });
      flushSessionBeforeClose();
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
      if (state.theme !== prev.theme) scheduleSave(SAVE_DEBOUNCE_MS);
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
