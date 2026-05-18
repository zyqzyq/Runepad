import type { EditorView } from "@codemirror/view";
import { pendingInitialDocs } from "@/lib/pendingDocs";

export const editorInstances = new Map<string, EditorView>();

export function destroyEditorInstance(docId: string): void {
  const view = editorInstances.get(docId);
  if (view) {
    view.destroy();
    editorInstances.delete(docId);
  }
}

/** Tear down editor state when a tab is closed (not on Strict Mode remount). */
export function disposeTabEditor(docId: string): void {
  destroyEditorInstance(docId);
  pendingInitialDocs.delete(docId);
}
