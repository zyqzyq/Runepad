import { create } from "zustand";
import type { LineEnding, Tab } from "@/types/tab";

interface TabStore {
  tabs: Tab[];
  activeId: string | null;
  addNewTab: () => string;
  addTabFromFile: (params: {
    id?: string;
    filepath: string;
    filename: string;
    encoding: string;
    lineEnding: LineEnding;
    language: string;
  }) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  markDirty: (id: string, dirty?: boolean) => void;
  updateTab: (id: string, patch: Partial<Tab>) => void;
  getActiveTab: () => Tab | undefined;
}

let untitledCounter = 1;

function createEmptyTab(): Tab {
  const id = crypto.randomUUID();
  const n = untitledCounter++;
  return {
    id,
    filename: n === 1 ? "Untitled" : `Untitled-${n - 1}`,
    filepath: null,
    isDirty: false,
    isNew: true,
    language: "plaintext",
    encoding: "UTF-8",
    lineEnding: "LF",
  };
}

const initialTab = createEmptyTab();

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [initialTab],
  activeId: initialTab.id,

  addNewTab: () => {
    const tab = createEmptyTab();
    set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id }));
    return tab.id;
  },

  addTabFromFile: (params) => {
    const tab: Tab = {
      id: params.id ?? crypto.randomUUID(),
      filename: params.filename,
      filepath: params.filepath,
      isDirty: false,
      isNew: false,
      language: params.language,
      encoding: params.encoding,
      lineEnding: params.lineEnding,
    };
    set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id }));
    return tab.id;
  },

  closeTab: (id) => {
    const { tabs, activeId } = get();
    if (tabs.length <= 1) {
      const tab = createEmptyTab();
      set({ tabs: [tab], activeId: tab.id });
      return;
    }
    const idx = tabs.findIndex((t) => t.id === id);
    const nextTabs = tabs.filter((t) => t.id !== id);
    let nextActive = activeId;
    if (activeId === id) {
      const newIdx = Math.min(idx, nextTabs.length - 1);
      nextActive = nextTabs[newIdx]?.id ?? nextTabs[0]?.id ?? null;
    }
    set({ tabs: nextTabs, activeId: nextActive });
  },

  setActiveTab: (id) => set({ activeId: id }),

  reorderTabs: (fromIndex, toIndex) =>
    set((s) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= s.tabs.length ||
        toIndex >= s.tabs.length ||
        fromIndex === toIndex
      ) {
        return s;
      }
      const tabs = [...s.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      if (!moved) return s;
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    }),

  markDirty: (id, dirty = true) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty: dirty } : t)),
    })),

  updateTab: (id, patch) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  getActiveTab: () => {
    const { tabs, activeId } = get();
    return tabs.find((t) => t.id === activeId);
  },
}));
