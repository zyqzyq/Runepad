// Runepad | Module: codemirrorSyntaxThemes | Depends on: @codemirror/language, @uiw/codemirror-theme-*

import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubLight } from "@uiw/codemirror-theme-github";
import { nord } from "@uiw/codemirror-theme-nord";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { xcodeLight } from "@uiw/codemirror-theme-xcode";
import { EDITOR_SYNTAX_THEMES } from "@/lib/editorSyntaxThemeIds";

export { EDITOR_SYNTAX_THEMES };

const defaultSyntaxTheme = syntaxHighlighting(defaultHighlightStyle, {
  fallback: true,
});

export function getEditorSyntaxThemeExtension(theme: string): Extension {
  switch (theme) {
    case "vscode-dark":
      return vscodeDark;
    case "github-light":
      return githubLight;
    case "dracula":
      return dracula;
    case "nord":
      return nord;
    case "tokyo-night":
      return tokyoNight;
    case "xcode-light":
      return xcodeLight;
    default:
      return defaultSyntaxTheme;
  }
}
