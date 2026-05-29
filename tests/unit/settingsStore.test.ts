import { beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../helpers/storeState";
import {
  DEFAULT_EDITOR_FONT_FAMILY,
  DEFAULT_EDITOR_SYNTAX_THEME,
  fontPresetIdForFamily,
  isEditorSyntaxTheme,
  useSettingsStore,
} from "@/stores/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    resetStores();
  });

  it("persists editor settings and locale together", () => {
    useSettingsStore.getState().setEditorFontFamily("Consolas, monospace");
    useSettingsStore.getState().setEditorFontSize(18);
    useSettingsStore.getState().setEditorSyntaxTheme("dracula");
    useSettingsStore.getState().setLocale("en-US");

    expect(JSON.parse(localStorage.getItem("runepad:settings") ?? "{}")).toMatchObject({
      editorFontFamily: "Consolas, monospace",
      editorFontSize: 18,
      editorSyntaxTheme: "dracula",
      locale: "en-US",
    });
  });

  it("validates known editor syntax theme ids and falls back to default", () => {
    expect(isEditorSyntaxTheme("github-light")).toBe(true);
    expect(isEditorSyntaxTheme("missing-theme")).toBe(false);
    expect(DEFAULT_EDITOR_SYNTAX_THEME).toBe("default");
  });

  it("maps known font families to preset ids and falls back to default", () => {
    expect(fontPresetIdForFamily('"Cascadia Mono", monospace')).toBe("cascadia");
    expect(fontPresetIdForFamily("Missing Font")).toBe("default");
    expect(fontPresetIdForFamily(DEFAULT_EDITOR_FONT_FAMILY)).toBe("default");
  });
});
