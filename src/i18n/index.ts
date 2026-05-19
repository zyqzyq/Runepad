import { useSettingsStore, type AppLocale } from "@/stores/settingsStore";
import { t as translate, type MessageKey } from "@/i18n/messages";

export type { MessageKey } from "@/i18n/messages";
export { t } from "@/i18n/messages";

export function getLocale(): AppLocale {
  return useSettingsStore.getState().locale;
}

export function getT(
  locale?: AppLocale,
): (key: MessageKey, params?: Record<string, string>) => string {
  const resolved = locale ?? getLocale();
  return (key, params) => translate(key, resolved, params);
}

export function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function toastErrorMessage(error: unknown, locale?: AppLocale): string {
  return getT(locale)("toast.error", { message: formatErrorMessage(error) });
}

export function useI18n(): {
  locale: AppLocale;
  t: (key: MessageKey, params?: Record<string, string>) => string;
} {
  const locale = useSettingsStore((s) => s.locale);
  return {
    locale,
    t: (key, params) => translate(key, locale, params),
  };
}
