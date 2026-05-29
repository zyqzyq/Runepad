import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import {
  EDITOR_SYNTAX_THEMES,
  type EditorSyntaxTheme,
} from "@/lib/editorSyntaxThemeIds";
import { isEditorSyntaxTheme } from "@/stores/settingsStore";

interface SyntaxThemeSettingProps {
  value: EditorSyntaxTheme;
  onChange: (value: EditorSyntaxTheme) => void;
}

export function SyntaxThemeSetting({
  value,
  onChange,
}: SyntaxThemeSettingProps): JSX.Element {
  const { t } = useI18n();
  const selected =
    EDITOR_SYNTAX_THEMES.find((theme) => theme.id === value) ??
    EDITOR_SYNTAX_THEMES[0]!;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="syntax-theme-select">
        {t("settings.syntaxTheme.label")}
      </Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (isEditorSyntaxTheme(nextValue)) onChange(nextValue);
        }}
      >
        <SelectTrigger id="syntax-theme-select" className="w-full">
          <SelectValue>{t(selected.labelKey)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {EDITOR_SYNTAX_THEMES.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {t(theme.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
