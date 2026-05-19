import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";

export function setEditorContent(docId: string, content: string): void {
  pendingInitialDocs.set(docId, content);
  const view = editorInstances.get(docId);
  if (!view) return;
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: content,
    },
  });
}
