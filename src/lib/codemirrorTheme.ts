// Runepad | Module: codemirrorTheme | Depends on: @codemirror/view

import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ResolvedTheme } from "@/stores/uiStore";

interface EditorCssVars {
  background: string;
  foreground: string;
  gutterBg: string;
  gutterFg: string;
  border: string;
  accent: string;
  ring: string;
}

function readEditorCssVars(): EditorCssVars {
  const style = getComputedStyle(document.documentElement);
  return {
    background: style.getPropertyValue("--editor-background").trim() || "#ffffff",
    foreground: style.getPropertyValue("--editor-foreground").trim() || "#1e1e1e",
    gutterBg: style.getPropertyValue("--editor-gutter-bg").trim() || "#f5f5f5",
    gutterFg: style.getPropertyValue("--editor-gutter-fg").trim() || "#6e6e6e",
    border: style.getPropertyValue("--border").trim() || "#e5e5e5",
    accent: style.getPropertyValue("--accent").trim() || "#f4f4f5",
    ring: style.getPropertyValue("--ring").trim() || "#8a8a8a",
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
      ".cm-content": {
        caretColor: vars.foreground,
        paddingTop: "10px",
        paddingBottom: "14px",
      },
      ".cm-line": {
        paddingLeft: "12px",
        paddingRight: "18px",
      },
      ".cm-cursor": {
        borderLeftColor: vars.foreground,
      },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor:
          "color-mix(in oklch, var(--ring) 22%, transparent)",
      },
      ".cm-gutters": {
        backgroundColor: vars.gutterBg,
        color: vars.gutterFg,
        borderRight: `1px solid ${vars.border}`,
      },
      ".cm-lineNumbers .cm-gutterElement": {
        paddingLeft: "12px",
        paddingRight: "10px",
      },
      ".cm-foldGutter span": {
        color: vars.gutterFg,
        cursor: "pointer",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: vars.accent,
        borderColor: vars.border,
        color: vars.foreground,
      },
      ".cm-activeLine": {
        backgroundColor:
          "color-mix(in oklch, var(--accent) 58%, transparent)",
      },
      ".cm-activeLineGutter": {
        backgroundColor:
          "color-mix(in oklch, var(--accent) 76%, transparent)",
        color: vars.foreground,
      },
      ".cm-matchingBracket, .cm-nonmatchingBracket": {
        backgroundColor:
          "color-mix(in oklch, var(--ring) 16%, transparent)",
        outline: `1px solid ${vars.border}`,
      },
      ".cm-searchMatch": {
        backgroundColor:
          "color-mix(in oklch, var(--ring) 20%, transparent)",
        outline: `1px solid color-mix(in oklch, ${vars.ring} 34%, transparent)`,
      },
      ".cm-searchMatch-selected": {
        backgroundColor:
          "color-mix(in oklch, var(--ring) 32%, transparent)",
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

export function getLanguagePresentationTheme(language: string): Extension[] {
  if (language !== "markdown") return [];

  return [
    EditorView.theme({
      ".cm-content": {
        lineHeight: "1.65",
        paddingTop: "14px",
        paddingBottom: "18px",
      },
      ".cm-line": {
        paddingLeft: "18px",
        paddingRight: "22px",
      },
      ".cm-gutters": {
        paddingTop: "14px",
      },
      ".cm-line span": {
        textUnderlineOffset: "3px",
      },
      ".cm-content span[class]": {
        textDecorationThickness: "1px",
      },
      ".cm-content .cm-line span[class]": {
        borderRadius: "3px",
      },
    }),
  ];
}
