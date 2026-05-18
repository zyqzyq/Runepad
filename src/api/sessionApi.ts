// Runepad | Module: sessionApi | Depends on: @tauri-apps/api

import { invoke } from "@tauri-apps/api/core";
import type { SessionSnapshot } from "@/types/session";

export async function saveSession(session: SessionSnapshot): Promise<void> {
  await invoke("save_session", { session });
}

export async function loadSession(): Promise<SessionSnapshot | null> {
  return invoke<SessionSnapshot | null>("load_session");
}

export async function clearSession(): Promise<void> {
  await invoke("clear_session");
}
