import { create } from "zustand";

interface CloseTabStore {
  pendingTabId: string | null;
  setPendingTabId: (id: string | null) => void;
}

export const useCloseTabStore = create<CloseTabStore>((set) => ({
  pendingTabId: null,
  setPendingTabId: (id) => set({ pendingTabId: id }),
}));
