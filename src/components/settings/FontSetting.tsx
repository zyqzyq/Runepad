import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";
import {
  EDITOR_FONT_PRESETS,
  EDITOR_FONT_SIZES,
  fontPresetIdForFamily,
  useSettingsStore,
} from "@/stores/settingsStore";

const PRESET_LABEL_KEYS: Record<string, MessageKey> = {
  default: "settings.font.preset.default",
  cascadia: "settings.font.preset.cascadia",
  consolas: "settings.font.preset.consolas",
  jetbrains: "settings.font.preset.jetbrains",
  fira: "settings.font.preset.fira",
};

export function FontSetting(): JSX.Element {
  const { t } = useI18n();
  const editorFontFamily = useSettingsStore((s) => s.editorFontFamily);
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
  const setEditorFontFamily = useSettingsStore((s) => s.setEditorFontFamily);
  const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize);

  const presetId = fontPresetIdForFamily(editorFontFamily);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="font-family-select">{t("settings.font.family")}</Label>
        <Select
          value={presetId}
          onValueChange={(value) => {
            const preset = EDITOR_FONT_PRESETS.find((p) => p.id === value);
            if (preset) setEditorFontFamily(preset.family);
          }}
        >
          <SelectTrigger id="font-family-select" className="w-full">
            <SelectValue>
              {t(PRESET_LABEL_KEYS[presetId] ?? "settings.font.preset.default")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EDITOR_FONT_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {t(
                  PRESET_LABEL_KEYS[preset.id] ??
                    "settings.font.preset.default",
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="font-size-select">{t("settings.font.size")}</Label>
        <Select
          value={String(editorFontSize)}
          onValueChange={(value) => {
            const size = Number(value);
            if (EDITOR_FONT_SIZES.includes(size as (typeof EDITOR_FONT_SIZES)[number])) {
              setEditorFontSize(size);
            }
          }}
        >
          <SelectTrigger id="font-size-select" className="w-full">
            <SelectValue>{String(editorFontSize)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EDITOR_FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {String(size)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
