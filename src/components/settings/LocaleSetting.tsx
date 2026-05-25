import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import type { AppLocale } from "@/stores/settingsStore";

const LOCALE_OPTIONS: AppLocale[] = ["zh-CN", "en-US"];

interface LocaleSettingProps {
  value: AppLocale;
  onChange: (value: AppLocale) => void;
}

export function LocaleSetting({
  value,
  onChange,
}: LocaleSettingProps): JSX.Element {
  const { t } = useI18n();

  const localeLabel = (value: AppLocale): string =>
    value === "zh-CN" ? t("settings.locale.zh") : t("settings.locale.en");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="locale-select">{t("settings.locale.label")}</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue === "zh-CN" || nextValue === "en-US") {
            onChange(nextValue);
          }
        }}
      >
        <SelectTrigger id="locale-select" className="w-full">
          <SelectValue>{localeLabel(value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LOCALE_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {localeLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
