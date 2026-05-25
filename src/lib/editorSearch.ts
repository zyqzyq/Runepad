// Runepad | Module: editorSearch | Depends on: @codemirror/search

import {
  closeSearchPanel,
  openSearchPanel,
  searchPanelOpen,
} from "@codemirror/search";
import type { Command } from "@codemirror/view";
import type { EditorView } from "@codemirror/view";

export const toggleFindPanel: Command = (view) => {
  if (searchPanelOpen(view.state)) {
    return closeSearchPanel(view);
  }
  return openSearchPanel(view);
};

export const closeFindPanelIfOpen: Command = (view) => {
  if (!searchPanelOpen(view.state)) return false;
  return closeSearchPanel(view);
};

export function openFindPanel(view: EditorView): void {
  openSearchPanel(view);
}

export function openReplacePanel(view: EditorView): void {
  if (!searchPanelOpen(view.state)) {
    openSearchPanel(view);
  }
  const replaceField = view.dom.querySelector<HTMLInputElement>(
    ".cm-panel.cm-search input[name=replace]",
  );
  replaceField?.focus();
  replaceField?.select();
}
