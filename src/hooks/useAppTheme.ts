import { useEffect } from "react";
import { useUiStore, type ResolvedTheme, type ThemePreference } from "@/stores/uiStore";

function getBrowserSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return getBrowserSystemTheme();
}

export function useAppTheme(): void {
  const theme = useUiStore((s) => s.theme);
  const setResolvedTheme = useUiStore((s) => s.setResolvedTheme);

  useEffect(() => {
    let cancelled = false;

    const apply = (): void => {
      const resolved = resolveTheme(theme);
      if (cancelled) return;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    apply();

    if (theme !== "system") {
      return () => {
        cancelled = true;
      };
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => {
      apply();
    };
    mq.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
    };
  }, [theme, setResolvedTheme]);
}
