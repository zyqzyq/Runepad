import { create } from "zustand";

interface CloseTabStore {
  pendingTabId: string | null;
  pendingTabIds: string[];
  setPendingTabId: (id: string | null) => void;
  setPendingTabIds: (ids: string[]) => void;
  clearPendingTabs: () => void;
}

export const useCloseTabStore = create<CloseTabStore>((set) => ({
  pendingTabId: null,
  pendingTabIds: [],
  setPendingTabId: (id) => set({ pendingTabId: id }),
  setPendingTabIds: (ids) => set({ pendingTabIds: ids }),
  clearPendingTabs: () => set({ pendingTabId: null, pendingTabIds: [] }),
}));
