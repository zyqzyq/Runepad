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
import type { ThemePreference } from "@/stores/uiStore";

const THEME_OPTIONS: ThemePreference[] = ["light", "dark", "system"];

interface ThemeSettingProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}

export function ThemeSetting({
  value,
  onChange,
}: ThemeSettingProps): JSX.Element {
  const { t } = useI18n();

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
        value={value}
        onValueChange={(nextValue) => {
          if (
            nextValue === "light" ||
            nextValue === "dark" ||
            nextValue === "system"
          ) {
            onChange(nextValue);
          }
        }}
      >
        <SelectTrigger id="theme-select" className="w-full">
          <SelectValue>{themeLabel(value)}</SelectValue>
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
