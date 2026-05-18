// Runepad | Module: dirApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";
import type { DirEntry } from "@/types/dir";

export async function readDir(path: string): Promise<DirEntry[]> {
  return invoke<DirEntry[]>("read_dir", { path });
}
