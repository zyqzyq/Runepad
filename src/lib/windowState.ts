// Runepad | Module: windowState | Depends on: @tauri-apps/api/window, session types

import { getCurrentWindow } from "@tauri-apps/api/window";
import type { SessionWindowState } from "@/types/session";

const MIN_RESTORED_WIDTH = 400;
const MIN_RESTORED_HEIGHT = 300;

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function normalizeWindowState(
  state: SessionWindowState | null | undefined,
): SessionWindowState | null {
  if (!state) return null;
  if (
    !isFiniteNumber(state.x) ||
    !isFiniteNumber(state.y) ||
    !isFiniteNumber(state.width) ||
    !isFiniteNumber(state.height)
  ) {
    return null;
  }

  return {
    x: Math.round(state.x),
    y: Math.round(state.y),
    width: Math.max(MIN_RESTORED_WIDTH, Math.round(state.width)),
    height: Math.max(MIN_RESTORED_HEIGHT, Math.round(state.height)),
    maximized: state.maximized === true,
  };
}

export async function readCurrentWindowState(): Promise<SessionWindowState | null> {
  try {
    const win = getCurrentWindow();
    const [position, size, maximized] = await Promise.all([
      win.outerPosition(),
      win.outerSize(),
      win.isMaximized(),
    ]);

    return normalizeWindowState({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      maximized,
    });
  } catch {
    return null;
  }
}
