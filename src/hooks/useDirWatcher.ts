import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getT } from "@/i18n";
import {
  readDir,
  syncWatchedDirs,
  unwatchDir,
  type DirChangedEvent,
  type DirChangedKind,
} from "@/api/dirApi";
import { collectWatchTargets } from "@/lib/collectWatchTargets";
import { parentDir } from "@/lib/parentDir";
import { normalizePath, pathsMatch } from "@/lib/normalizePath";
import { reloadTabFromDisk } from "@/lib/reloadTabFromDisk";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";

const DEBOUNCE_MS = 300;

interface PendingChange {
  path: string;
  kind: DirChangedKind;
}

function isReloadKind(kind: DirChangedKind): boolean {
  return kind === "modify" || kind === "create" || kind === "rename";
}

export function useDirWatcher(): void {
  const pendingChanges = useRef<PendingChange[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncWatches = async (): Promise<void> => {
    const targets = collectWatchTargets();
    try {
      if (targets.length === 0) {
        await unwatchDir();
      } else {
        await syncWatchedDirs(targets);
      }
    } catch (e) {
      toast.error(
        getT()("toast.fileWatchFailed", {
          message: e instanceof Error ? e.message : String(e),
        }),
      );
    }
  };

  useEffect(() => {
    void syncWatches();

    const unsubExplorer = useExplorerStore.subscribe((state, prev) => {
      if (state.rootPath !== prev.rootPath) {
        void syncWatches();
      }
    });

    const unsubTabs = useTabStore.subscribe((state, prev) => {
      const prevPaths = prev.tabs
        .map((t) => t.filepath)
        .filter(Boolean)
        .join("\0");
      const nextPaths = state.tabs
        .map((t) => t.filepath)
        .filter(Boolean)
        .join("\0");
      if (prevPaths !== nextPaths) {
        void syncWatches();
      }
    });

    return () => {
      unsubExplorer();
      unsubTabs();
      void unwatchDir();
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const reloadMatchingTabs = async (
      eventPath: string,
      kind: DirChangedKind,
    ): Promise<void> => {
      if (!isReloadKind(kind)) return;

      const tabs = useTabStore.getState().tabs;

      for (const tab of tabs) {
        if (!tab.filepath) continue;
        if (!pathsMatch(tab.filepath, eventPath)) continue;

        if (tab.isDirty) {
          toast.info(
            getT()("toast.fileChangedOnDisk", { filename: tab.filename }),
          );
          continue;
        }

        await reloadTabFromDisk(tab);
      }
    };

    const flush = async (): Promise<void> => {
      const changes = [...pendingChanges.current];
      pendingChanges.current = [];
      timerRef.current = null;

      const { rootPath, expandedPaths, setChildren } =
        useExplorerStore.getState();

      const dirsToRefresh = new Set<string>();

      for (const { path: eventPath } of changes) {
        const normalized = normalizePath(eventPath);
        const parent = parentDir(normalized);

        if (rootPath) {
          const rootNorm = normalizePath(rootPath);
          if (
            normalized === rootNorm ||
            parent === rootNorm ||
            parent.startsWith(`${rootNorm}/`) ||
            expandedPaths[parent] ||
            expandedPaths[normalized]
          ) {
            if (expandedPaths[normalized] || normalized === rootNorm) {
              dirsToRefresh.add(normalized);
            } else {
              dirsToRefresh.add(parent);
            }
          }
        }
      }

      for (const dir of dirsToRefresh) {
        try {
          const entries = await readDir(dir);
          setChildren(dir, entries);
        } catch {
          // Directory may have been removed
        }
      }

      for (const { path, kind } of changes) {
        await reloadMatchingTabs(path, kind);
      }
    };

    const schedule = (payload: DirChangedEvent): void => {
      pendingChanges.current.push({ path: payload.path, kind: payload.kind });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, DEBOUNCE_MS);
    };

    const setupListener = async (): Promise<void> => {
      unlisten = await listen<DirChangedEvent>("dir-changed", (event) => {
        schedule(event.payload);
      });
    };

    void setupListener();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unlisten?.();
    };
  }, []);
}

/** Re-register watches after session restore adds tabs. */
export function syncFileWatchesNow(): void {
  const targets = collectWatchTargets();
  void (async () => {
    try {
      if (targets.length === 0) {
        await unwatchDir();
      } else {
        await syncWatchedDirs(targets);
      }
    } catch {
      // Caller may surface errors
    }
  })();
}
