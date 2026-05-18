// Runepad | Module: systemApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";

export async function getSystemTheme(): Promise<"light" | "dark"> {
  const theme = await invoke<string>("get_system_theme");
  return theme === "dark" ? "dark" : "light";
}
