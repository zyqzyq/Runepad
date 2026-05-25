// Runepad | Module: systemApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

const OPEN_FILES_EVENT = "runepad://open-files";

export async function getLaunchFiles(): Promise<string[]> {
  return await invoke<string[]>("get_launch_files");
}

export async function listenOpenFiles(
  handler: (paths: string[]) => void,
): Promise<UnlistenFn> {
  return await listen<string[]>(OPEN_FILES_EVENT, (event) => {
    handler(event.payload);
  });
}
