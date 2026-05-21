import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { search, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, Prec, type Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { useEffect, useRef } from "react";
import { getCodemirrorTheme, getEditorFontTheme } from "@/lib/codemirrorTheme";
import { loadLanguageExtension } from "@/lib/codemirrorLanguages";
import { closeFindPanelIfOpen, toggleFindPanel } from "@/lib/editorSearch";
import { destroyEditorInstance, editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { startupMeasure } from "@/lib/startupPerf";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";
import { useSettingsStore } from "@/stores/settingsStore";
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

function toLanguageExtensions(ext: Extension | null): Extension[] {
  return ext ? [ext] : [];
}

export function EditorPanel({
  docId,
  language,
  isActive,
}: EditorPanelProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeCompartment = useRef(new Compartment()).current;
  const fontCompartment = useRef(new Compartment()).current;
  const languageCompartment = useRef(new Compartment()).current;
  const resolvedTheme = useUiStore((s) => s.resolvedTheme);
  const editorFontFamily = useSettingsStore((s) => s.editorFontFamily);
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
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
        search({ top: true }),
        Prec.highest(
          keymap.of([
            { key: "Mod-f", run: toggleFindPanel },
            { key: "Mod-f", run: toggleFindPanel, scope: "editor search-panel" },
            { key: "Escape", run: closeFindPanelIfOpen },
            {
              key: "Escape",
              run: closeFindPanelIfOpen,
              scope: "editor search-panel",
            },
          ]),
        ),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        themeCompartment.of(
          getCodemirrorTheme(useUiStore.getState().resolvedTheme),
        ),
        fontCompartment.of(
          getEditorFontTheme(
            useSettingsStore.getState().editorFontFamily,
            useSettingsStore.getState().editorFontSize,
          ),
        ),
        languageCompartment.of([]),
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
    if (isActive) {
      view.focus();
      startupMeasure("editor-mounted", "start");
    }

    return () => {
      destroyEditorInstance(docId);
    };
  }, [
    docId,
    fontCompartment,
    isActive,
    languageCompartment,
    markDirty,
    setMeta,
    themeCompartment,
  ]);

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
      effects: fontCompartment.reconfigure(
        getEditorFontTheme(editorFontFamily, editorFontSize),
      ),
    });
  }, [docId, editorFontFamily, editorFontSize, fontCompartment]);

  useEffect(() => {
    const view = editorInstances.get(docId);
    if (!view) return;

    let cancelled = false;
    void loadLanguageExtension(language).then((ext) => {
      if (cancelled) return;
      view.dispatch({
        effects: languageCompartment.reconfigure(toLanguageExtensions(ext)),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [docId, language, languageCompartment]);

  useEffect(() => {
    if (!isActive) return;
    editorInstances.get(docId)?.focus();
  }, [docId, isActive]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ display: isActive ? "block" : "none" }}
    />
  );
}
