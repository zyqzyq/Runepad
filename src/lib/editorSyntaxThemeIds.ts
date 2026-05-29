// Runepad | Module: editorSyntaxThemeIds | Depends on: i18n messages

import type { MessageKey } from "@/i18n/messages";

export type EditorSyntaxTheme =
  | "default"
  | "vscode-dark"
  | "github-light"
  | "dracula"
  | "nord"
  | "tokyo-night"
  | "xcode-light";

export const DEFAULT_EDITOR_SYNTAX_THEME: EditorSyntaxTheme = "default";

export const EDITOR_SYNTAX_THEME_IDS = [
  "default",
  "vscode-dark",
  "github-light",
  "dracula",
  "nord",
  "tokyo-night",
  "xcode-light",
] as const satisfies ReadonlyArray<EditorSyntaxTheme>;

export const EDITOR_SYNTAX_THEMES: ReadonlyArray<{
  id: EditorSyntaxTheme;
  labelKey: MessageKey;
}> = [
  { id: "default", labelKey: "settings.syntaxTheme.default" },
  { id: "vscode-dark", labelKey: "settings.syntaxTheme.vscodeDark" },
  { id: "github-light", labelKey: "settings.syntaxTheme.githubLight" },
  { id: "dracula", labelKey: "settings.syntaxTheme.dracula" },
  { id: "nord", labelKey: "settings.syntaxTheme.nord" },
  { id: "tokyo-night", labelKey: "settings.syntaxTheme.tokyoNight" },
  { id: "xcode-light", labelKey: "settings.syntaxTheme.xcodeLight" },
];

export function isEditorSyntaxTheme(
  value: unknown,
): value is EditorSyntaxTheme {
  return (
    typeof value === "string" &&
    EDITOR_SYNTAX_THEME_IDS.includes(value as EditorSyntaxTheme)
  );
}
