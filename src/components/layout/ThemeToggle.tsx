import { Button } from "@/components/ui/button";
import { useUiStore, type ThemePreference } from "@/stores/uiStore";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle(): JSX.Element {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div className="flex items-center gap-0.5">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={theme === opt.value ? "default" : "ghost"}
          onClick={() => setTheme(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
