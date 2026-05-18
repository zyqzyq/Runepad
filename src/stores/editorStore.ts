import { create } from "zustand";
import type { EditorMeta } from "@/types/editor";

interface EditorStore {
  metaByDocId: Record<string, EditorMeta>;
  setMeta: (meta: EditorMeta) => void;
  removeMeta: (docId: string) => void;
  getMeta: (docId: string) => EditorMeta;
}

function defaultMeta(docId: string): EditorMeta {
  return {
    docId,
    wordCount: 0,
    cursorPos: { line: 1, col: 1 },
  };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  metaByDocId: {},

  setMeta: (meta) =>
    set((s) => ({
      metaByDocId: { ...s.metaByDocId, [meta.docId]: meta },
    })),

  removeMeta: (docId) =>
    set((s) => {
      const next = { ...s.metaByDocId };
      delete next[docId];
      return { metaByDocId: next };
    }),

  getMeta: (docId) => get().metaByDocId[docId] ?? defaultMeta(docId),
}));
