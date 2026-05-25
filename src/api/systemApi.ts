// Runepad | Module: systemApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";

export async function getLaunchFiles(): Promise<string[]> {
  return await invoke<string[]>("get_launch_files");
}
