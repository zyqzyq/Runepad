// Runepad | Module: codemirrorTheme | Depends on: @codemirror/view

import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ResolvedTheme } from "@/stores/uiStore";

interface EditorCssVars {
  background: string;
  foreground: string;
  gutterBg: string;
  gutterFg: string;
}

function readEditorCssVars(): EditorCssVars {
  const style = getComputedStyle(document.documentElement);
  return {
    background: style.getPropertyValue("--editor-background").trim() || "#ffffff",
    foreground: style.getPropertyValue("--editor-foreground").trim() || "#1e1e1e",
    gutterBg: style.getPropertyValue("--editor-gutter-bg").trim() || "#f5f5f5",
    gutterFg: style.getPropertyValue("--editor-gutter-fg").trim() || "#6e6e6e",
  };
}

function buildEditorTheme(vars: EditorCssVars, dark: boolean): Extension {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: vars.background,
        color: vars.foreground,
        height: "100%",
      },
      ".cm-content": { caretColor: vars.foreground },
      ".cm-gutters": {
        backgroundColor: vars.gutterBg,
        color: vars.gutterFg,
        border: "none",
      },
    },
    { dark },
  );
}

export function getCodemirrorTheme(resolved: ResolvedTheme): Extension[] {
  const vars = readEditorCssVars();
  return [buildEditorTheme(vars, resolved === "dark")];
}

export function getEditorFontTheme(
  family: string,
  sizePx: number,
): Extension {
  return EditorView.theme({
    ".cm-content": {
      fontFamily: family,
      fontSize: `${sizePx}px`,
    },
    ".cm-gutters": {
      fontFamily: family,
      fontSize: `${sizePx}px`,
    },
  });
}
