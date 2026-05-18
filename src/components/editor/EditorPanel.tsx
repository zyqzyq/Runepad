import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useEffect, useRef } from "react";
import { getCodemirrorTheme } from "@/lib/codemirrorTheme";
import { getLanguageExtension } from "@/lib/codemirrorLanguages";
import { destroyEditorInstance, editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

interface EditorPanelProps {
  docId: string;
  language: string;
  isActive: boolean;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function languageExtensions(language: string): Extension[] {
  const ext = getLanguageExtension(language);
  return ext ? [ext] : [];
}

export function EditorPanel({
  docId,
  language,
  isActive,
}: EditorPanelProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeCompartment = useRef(new Compartment()).current;
  const languageCompartment = useRef(new Compartment()).current;
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const markDirty = useTabStore((s) => s.markDirty);
  const setMeta = useEditorStore((s) => s.setMeta);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    // Keep pending doc until tab close (disposeTabEditor). Do not delete here:
    // StrictMode remounts would otherwise recreate the editor with empty text.
    const initialDoc = pendingInitialDocs.get(docId) ?? "";

    const updateMeta = (view: EditorView): void => {
      const pos = view.state.selection.main.head;
      const line = view.state.doc.lineAt(pos);
      setMeta({
        docId,
        wordCount: countWords(view.state.doc.toString()),
        cursorPos: { line: line.number, col: pos - line.from + 1 },
      });
    };

    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        lineNumbers(),
        drawSelection(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        themeCompartment.of(getCodemirrorTheme(resolvedTheme)),
        languageCompartment.of(languageExtensions(language)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            markDirty(docId, true);
          }
          if (update.selectionSet || update.docChanged) {
            updateMeta(update.view);
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent });
    editorInstances.set(docId, view);
    updateMeta(view);

    return () => {
      destroyEditorInstance(docId);
    };
  }, [docId, languageCompartment, markDirty, setMeta, themeCompartment]);

  useEffect(() => {
    const view = editorInstances.get(docId);
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.reconfigure(getCodemirrorTheme(resolvedTheme)),
    });
  }, [docId, resolvedTheme, themeCompartment]);

  useEffect(() => {
    const view = editorInstances.get(docId);
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.reconfigure(languageExtensions(language)),
    });
  }, [docId, language, languageCompartment]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ display: isActive ? "block" : "none" }}
    />
  );
}
