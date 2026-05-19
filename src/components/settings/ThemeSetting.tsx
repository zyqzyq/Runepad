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
import { useUiStore, type ThemePreference } from "@/stores/uiStore";

const THEME_OPTIONS: ThemePreference[] = ["light", "dark", "system"];

export function ThemeSetting(): JSX.Element {
  const { t } = useI18n();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  const themeLabel = (value: ThemePreference): string => {
    const key: MessageKey =
      value === "light"
        ? "settings.theme.light"
        : value === "dark"
          ? "settings.theme.dark"
          : "settings.theme.system";
    return t(key);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="theme-select">{t("settings.theme.label")}</Label>
      <Select
        value={theme}
        onValueChange={(value) => {
          if (
            value === "light" ||
            value === "dark" ||
            value === "system"
          ) {
            setTheme(value);
          }
        }}
      >
        <SelectTrigger id="theme-select" className="w-full">
          <SelectValue>{themeLabel(theme)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {THEME_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {themeLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
