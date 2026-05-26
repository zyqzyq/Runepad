import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_SIDEBAR_WIDTH = 250;
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 420;

interface UiStore {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  recentFilesOpen: boolean;
  settingsOpen: boolean;
  setTheme: (theme: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setRecentFilesOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export function clampSidebarWidth(width: number): number {
  return Math.min(
    MAX_SIDEBAR_WIDTH,
    Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)),
  );
}

export const useUiStore = create<UiStore>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  sidebarCollapsed: false,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  recentFilesOpen: false,
  settingsOpen: false,
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setSidebarWidth: (sidebarWidth) =>
    set({ sidebarWidth: clampSidebarWidth(sidebarWidth) }),
  setRecentFilesOpen: (recentFilesOpen) => set({ recentFilesOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
