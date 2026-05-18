import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";

export function setEditorContent(docId: string, content: string): void {
  const view = editorInstances.get(docId);
  if (view) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content,
      },
    });
    return;
  }
  pendingInitialDocs.set(docId, content);
}
