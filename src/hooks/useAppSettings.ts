import { useEffect } from "react";
import { setAppMenuLocale } from "@/api/menuApi";
import { useSettingsStore } from "@/stores/settingsStore";

/** Applies persisted settings side effects (document lang, native menu). */
export function useAppSettings(): void {
  const locale = useSettingsStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    void setAppMenuLocale(locale).catch(() => {
      // Menu rebuild is best-effort; accelerators still work via JS shortcuts
    });
  }, [locale]);
}
