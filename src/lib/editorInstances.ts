import type { EditorView } from "@codemirror/view";

export const editorInstances = new Map<string, EditorView>();

export function destroyEditorInstance(docId: string): void {
  const view = editorInstances.get(docId);
  if (view) {
    view.destroy();
    editorInstances.delete(docId);
  }
}
