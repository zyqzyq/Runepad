import { create } from "zustand";

const STORAGE_KEY = "runepad:recent-files";
const MAX_RECENT = 15;

function loadPaths(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return [];
  }
}

function savePaths(paths: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {
    // ignore quota / private mode
  }
}

interface RecentFilesStore {
  paths: string[];
  push: (path: string) => void;
  remove: (path: string) => void;
  clear: () => void;
}

export const useRecentFilesStore = create<RecentFilesStore>((set, get) => ({
  paths: loadPaths(),

  push: (path) => {
    const trimmed = path.trim();
    if (!trimmed) return;
    const next = [
      trimmed,
      ...get().paths.filter((p) => p !== trimmed),
    ].slice(0, MAX_RECENT);
    savePaths(next);
    set({ paths: next });
  },

  remove: (path) => {
    const next = get().paths.filter((p) => p !== path);
    savePaths(next);
    set({ paths: next });
  },

  clear: () => {
    savePaths([]);
    set({ paths: [] });
  },
}));
