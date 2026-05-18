// Runepad | Module: dirApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";
import type { DirEntry } from "@/types/dir";

export async function readDir(path: string): Promise<DirEntry[]> {
  return invoke<DirEntry[]>("read_dir", { path });
}

export type DirChangedKind = "create" | "modify" | "remove" | "rename";

export interface DirChangedEvent {
  kind: DirChangedKind;
  path: string;
}

export interface WatchTarget {
  path: string;
  recursive: boolean;
  isFile: boolean;
}

export async function syncWatchedDirs(targets: WatchTarget[]): Promise<void> {
  await invoke("sync_watched_dirs", {
    targets: targets.map((t) => ({
      path: t.path,
      recursive: t.recursive,
      isFile: t.isFile,
    })),
  });
}

export async function unwatchDir(): Promise<void> {
  await invoke("unwatch_dir");
}
