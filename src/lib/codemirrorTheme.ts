import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ResolvedTheme } from "@/stores/uiStore";

const lightTheme = EditorView.theme(
  {
    "&": { backgroundColor: "#ffffff", color: "#1e1e1e", height: "100%" },
    ".cm-content": { caretColor: "#1e1e1e" },
    ".cm-gutters": { backgroundColor: "#f5f5f5", color: "#6e6e6e", border: "none" },
  },
  { dark: false },
);

const darkTheme = EditorView.theme(
  {
    "&": { backgroundColor: "#1e1e1e", color: "#d4d4d4", height: "100%" },
    ".cm-content": { caretColor: "#d4d4d4" },
    ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#858585", border: "none" },
  },
  { dark: true },
);

export function getCodemirrorTheme(resolved: ResolvedTheme): Extension[] {
  return resolved === "dark" ? [darkTheme] : [lightTheme];
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
