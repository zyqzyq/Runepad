import { create } from "zustand";
import type { DirEntry } from "@/types/dir";

interface ExplorerStore {
  rootPath: string | null;
  expandedPaths: Record<string, true>;
  childrenByPath: Record<string, DirEntry[]>;
  openRoot: (path: string) => void;
  closeRoot: () => void;
  toggleExpand: (path: string) => void;
  setChildren: (path: string, entries: DirEntry[]) => void;
  restoreExplorer: (root: string, expandedPaths: string[]) => void;
  isExpanded: (path: string) => boolean;
}

export const useExplorerStore = create<ExplorerStore>((set, get) => ({
  rootPath: null,
  expandedPaths: {},
  childrenByPath: {},

  openRoot: (path) =>
    set({
      rootPath: path,
      expandedPaths: { [path]: true },
      childrenByPath: {},
    }),

  closeRoot: () =>
    set({
      rootPath: null,
      expandedPaths: {},
      childrenByPath: {},
    }),

  toggleExpand: (path) =>
    set((s) => {
      const next = { ...s.expandedPaths };
      if (next[path]) {
        delete next[path];
      } else {
        next[path] = true;
      }
      return { expandedPaths: next };
    }),

  setChildren: (path, entries) =>
    set((s) => ({
      childrenByPath: { ...s.childrenByPath, [path]: entries },
    })),

  restoreExplorer: (root, expandedPaths) => {
    const expanded: Record<string, true> = { [root]: true };
    for (const p of expandedPaths) {
      expanded[p] = true;
    }
    set({
      rootPath: root,
      expandedPaths: expanded,
      childrenByPath: {},
    });
  },

  isExpanded: (path) => Boolean(get().expandedPaths[path]),
}));
