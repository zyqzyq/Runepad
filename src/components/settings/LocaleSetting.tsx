import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { useSettingsStore, type AppLocale } from "@/stores/settingsStore";

const LOCALE_OPTIONS: AppLocale[] = ["zh-CN", "en-US"];

export function LocaleSetting(): JSX.Element {
  const { t } = useI18n();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const localeLabel = (value: AppLocale): string =>
    value === "zh-CN" ? t("settings.locale.zh") : t("settings.locale.en");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="locale-select">{t("settings.locale.label")}</Label>
      <Select
        value={locale}
        onValueChange={(value) => {
          if (value === "zh-CN" || value === "en-US") {
            setLocale(value);
          }
        }}
      >
        <SelectTrigger id="locale-select" className="w-full">
          <SelectValue>{localeLabel(locale)}</SelectValue>
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
