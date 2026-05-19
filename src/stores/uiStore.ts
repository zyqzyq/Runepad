import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface UiStore {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  sidebarCollapsed: boolean;
  recentFilesOpen: boolean;
  settingsOpen: boolean;
  setTheme: (theme: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  toggleSidebar: () => void;
  setRecentFilesOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  sidebarCollapsed: false,
  recentFilesOpen: false,
  settingsOpen: false,
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setRecentFilesOpen: (recentFilesOpen) => set({ recentFilesOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
