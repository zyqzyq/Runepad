import { create } from "zustand";

interface FileChangeStore {
  pendingTabIds: string[];
  enqueue: (tabId: string) => void;
  clear: (tabId: string) => void;
  advance: () => void;
}

export const useFileChangeStore = create<FileChangeStore>((set) => ({
  pendingTabIds: [],

  enqueue: (tabId) =>
    set((state) => {
      if (state.pendingTabIds.includes(tabId)) return state;
      return { pendingTabIds: [...state.pendingTabIds, tabId] };
    }),

  clear: (tabId) =>
    set((state) => ({
      pendingTabIds: state.pendingTabIds.filter((id) => id !== tabId),
    })),

  advance: () =>
    set((state) => ({
      pendingTabIds: state.pendingTabIds.slice(1),
    })),
}));
