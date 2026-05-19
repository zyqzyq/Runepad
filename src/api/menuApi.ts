// Runepad | Module: menuApi | Depends on: @tauri-apps/api/core

import { invoke } from "@tauri-apps/api/core";
import type { AppLocale } from "@/stores/settingsStore";

export async function setAppMenuLocale(locale: AppLocale): Promise<void> {
  await invoke("set_app_menu_locale", { locale });
}
