import { create } from "zustand";

const STORAGE_KEY = "runepad:settings";

export type AppLocale = "zh-CN" | "en-US";

export const DEFAULT_EDITOR_FONT_FAMILY =
  '"Cascadia Mono", Consolas, "Courier New", monospace';

export const EDITOR_FONT_PRESETS: ReadonlyArray<{
  id: string;
  family: string;
}> = [
  { id: "default", family: DEFAULT_EDITOR_FONT_FAMILY },
  { id: "cascadia", family: '"Cascadia Mono", monospace' },
  { id: "consolas", family: "Consolas, monospace" },
  { id: "jetbrains", family: '"JetBrains Mono", monospace' },
  { id: "fira", family: '"Fira Code", monospace' },
];

export const EDITOR_FONT_SIZES = [12, 13, 14, 15, 16, 18, 20] as const;

function defaultLocale(): AppLocale {
  if (typeof navigator !== "undefined" && navigator.language.startsWith("zh")) {
    return "zh-CN";
  }
  return "en-US";
}

interface PersistedSettings {
  editorFontFamily: string;
  editorFontSize: number;
  locale: AppLocale;
}

function loadSettings(): PersistedSettings {
  const defaults: PersistedSettings = {
    editorFontFamily: DEFAULT_EDITOR_FONT_FAMILY,
    editorFontSize: 14,
    locale: defaultLocale(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaults;

    const obj = parsed as Record<string, unknown>;
    const editorFontFamily =
      typeof obj.editorFontFamily === "string"
        ? obj.editorFontFamily
        : defaults.editorFontFamily;
    const editorFontSize =
      typeof obj.editorFontSize === "number" &&
      EDITOR_FONT_SIZES.includes(obj.editorFontSize as (typeof EDITOR_FONT_SIZES)[number])
        ? obj.editorFontSize
        : defaults.editorFontSize;
    const locale =
      obj.locale === "zh-CN" || obj.locale === "en-US"
        ? obj.locale
        : defaults.locale;

    return { editorFontFamily, editorFontSize, locale };
  } catch {
    return defaults;
  }
}

function saveSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota / private mode
  }
}

interface SettingsStore extends PersistedSettings {
  setEditorFontFamily: (family: string) => void;
  setEditorFontSize: (size: number) => void;
  setLocale: (locale: AppLocale) => void;
}

const initial = loadSettings();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initial,

  setEditorFontFamily: (editorFontFamily) => {
    const next = { ...get(), editorFontFamily };
    saveSettings({
      editorFontFamily: next.editorFontFamily,
      editorFontSize: next.editorFontSize,
      locale: next.locale,
    });
    set({ editorFontFamily });
  },

  setEditorFontSize: (editorFontSize) => {
    const next = { ...get(), editorFontSize };
    saveSettings({
      editorFontFamily: next.editorFontFamily,
      editorFontSize: next.editorFontSize,
      locale: next.locale,
    });
    set({ editorFontSize });
  },

  setLocale: (locale) => {
    const next = { ...get(), locale };
    saveSettings({
      editorFontFamily: next.editorFontFamily,
      editorFontSize: next.editorFontSize,
      locale: next.locale,
    });
    set({ locale });
  },
}));

export function fontPresetIdForFamily(family: string): string {
  const match = EDITOR_FONT_PRESETS.find((p) => p.family === family);
  return match?.id ?? "default";
}
