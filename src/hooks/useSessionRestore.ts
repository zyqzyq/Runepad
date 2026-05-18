import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { loadSession } from "@/api/sessionApi";
import { syncFileWatchesNow } from "@/hooks/useDirWatcher";
import { persistSessionSnapshot } from "@/lib/persistSession";
import { restoreSession } from "@/lib/restoreSession";
import { useEditorStore } from "@/stores/editorStore";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

const SAVE_DEBOUNCE_MS = 2000;
const CLOSE_SAVE_TIMEOUT_MS = 3000;

export function useSessionRestore(): void {
  const restoreStarted = useRef(false);
  const restoreDone = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistSession = async (): Promise<void> => {
    if (!restoreDone.current) return;
    try {
      await persistSessionSnapshot();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const scheduleSave = (): void => {
    if (!restoreDone.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void persistSession();
    }, SAVE_DEBOUNCE_MS);
  };

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    const run = async (): Promise<void> => {
      try {
        const snapshot = await loadSession();
        if (snapshot && snapshot.tabs.length > 0) {
          await restoreSession(snapshot);
          toast.success(`Restored ${snapshot.tabs.length} tab(s)`);
          syncFileWatchesNow();
        }
      } catch (e) {
        toast.error(
          `Session restore failed: ${e instanceof Error ? e.message : String(e)}`,
        );
      } finally {
        restoreDone.current = true;
      }
    };

    void run();
  }, []);

  useEffect(() => {
    let unlistenClose: (() => void) | undefined;
    let disposed = false;

    void (async () => {
      const win = getCurrentWindow();
      unlistenClose = await win.onCloseRequested(async (event) => {
        event.preventDefault();
        unlistenClose?.();
        unlistenClose = undefined;

        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }

        try {
          await Promise.race([
            persistSession(),
            new Promise<void>((resolve) => {
              setTimeout(resolve, CLOSE_SAVE_TIMEOUT_MS);
            }),
          ]);
        } catch {
          // Do not block window close on save failure
        }

        if (!disposed) {
          await win.destroy();
        }
      });
    })();

    const unsubTab = useTabStore.subscribe(scheduleSave);
    const unsubEditor = useEditorStore.subscribe(scheduleSave);
    const unsubExplorer = useExplorerStore.subscribe(scheduleSave);
    const unsubUi = useUiStore.subscribe((state, prev) => {
      if (state.theme !== prev.theme) scheduleSave();
    });

    const onVisibility = (): void => {
      if (document.visibilityState === "hidden") {
        void persistSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      unlistenClose?.();
      unsubTab();
      unsubEditor();
      unsubExplorer();
      unsubUi();
      document.removeEventListener("visibilitychange", onVisibility);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);
}
