import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface UiStore {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  theme: "system",
  resolvedTheme: "light",
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
