import { normalizePath } from "@/lib/normalizePath";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";

export interface WatchTarget {
  path: string;
  recursive: boolean;
  isFile: boolean;
}

/** Watch explorer folder (recursive) and each open file path (direct file watch). */
export function collectWatchTargets(): WatchTarget[] {
  const targets: WatchTarget[] = [];
  const seen = new Set<string>();

  const add = (path: string, recursive: boolean, isFile: boolean): void => {
    const key = normalizePath(path);
    if (seen.has(key)) return;
    seen.add(key);
    targets.push({ path, recursive, isFile });
  };

  const rootPath = useExplorerStore.getState().rootPath;
  if (rootPath) {
    add(rootPath, true, false);
  }

  for (const tab of useTabStore.getState().tabs) {
    if (tab.filepath) {
      add(tab.filepath, false, true);
    }
  }

  return targets;
}
