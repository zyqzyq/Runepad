// Runepad | Module: windowApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";

export async function finishWindowClose(): Promise<void> {
  await invoke("finish_window_close");
}
