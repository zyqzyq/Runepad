import { describe, expect, it } from "vitest";
import {
  EDITOR_SYNTAX_THEMES,
  getEditorSyntaxThemeExtension,
} from "@/lib/codemirrorSyntaxThemes";

describe("codemirrorSyntaxThemes", () => {
  it("exposes a curated set of selectable editor syntax themes", () => {
    expect(EDITOR_SYNTAX_THEMES.map((theme) => theme.id)).toEqual([
      "default",
      "vscode-dark",
      "github-light",
      "dracula",
      "nord",
      "tokyo-night",
      "xcode-light",
    ]);
  });

  it("falls back to the default CodeMirror highlight style for unknown ids", () => {
    const fallback = getEditorSyntaxThemeExtension("missing-theme");

    expect(fallback).toEqual(getEditorSyntaxThemeExtension("default"));
  });
});
