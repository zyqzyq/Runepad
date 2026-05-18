import { useEffect } from "react";
import { getSystemTheme } from "@/api/systemApi";
import { useUiStore, type ResolvedTheme, type ThemePreference } from "@/stores/uiStore";

async function resolveTheme(preference: ThemePreference): Promise<ResolvedTheme> {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return getSystemTheme();
}

export function useAppTheme(): void {
  const theme = useUiStore((s) => s.theme);
  const setResolvedTheme = useUiStore((s) => s.setResolvedTheme);

  useEffect(() => {
    let cancelled = false;

    const apply = async (): Promise<void> => {
      const resolved = await resolveTheme(theme);
      if (cancelled) return;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    void apply();

    if (theme !== "system") {
      return () => {
        cancelled = true;
      };
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => {
      void apply();
    };
    mq.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
    };
  }, [theme, setResolvedTheme]);
}
