// Runepad | Module: prefetchEditorPanel | Depends on: EditorPanel, startupPerf

import { startupMark, startupMeasure } from "@/lib/startupPerf";

let prefetchPromise: Promise<unknown> | null = null;

/** Starts loading the EditorPanel chunk (deduped with React.lazy). */
export function prefetchEditorPanel(): void {
  if (prefetchPromise === null) {
    startupMark("editor-prefetch-start");
    prefetchPromise = import("@/components/editor/EditorPanel").then((mod) => {
      startupMark("editor-prefetch-end");
      startupMeasure("editor-prefetch", "editor-prefetch-start");
      return mod;
    });
  }
}
