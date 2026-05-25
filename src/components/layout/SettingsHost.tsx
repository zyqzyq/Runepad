import { useEffect, useState } from "react";
import { FontSetting } from "@/components/settings/FontSetting";
import { LocaleSetting } from "@/components/settings/LocaleSetting";
import { ThemeSetting } from "@/components/settings/ThemeSetting";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
  type PersistedSettings,
} from "@/stores/settingsStore";
import { useUiStore, type ThemePreference } from "@/stores/uiStore";

interface SettingsDraft extends PersistedSettings {
  theme: ThemePreference;
}

export function SettingsHost(): JSX.Element {
  const open = useUiStore((s) => s.settingsOpen);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const applySettings = useSettingsStore((s) => s.applySettings);
  const editorFontFamily = useSettingsStore((s) => s.editorFontFamily);
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useI18n();
  const [draft, setDraft] = useState<SettingsDraft>({
    ...DEFAULT_SETTINGS,
    theme: "system",
  });

  useEffect(() => {
    if (!open) return;
    setDraft({
      editorFontFamily,
      editorFontSize,
      locale,
      theme,
    });
  }, [editorFontFamily, editorFontSize, locale, open, theme]);

  const commitDraft = (): void => {
    setTheme(draft.theme);
    applySettings({
      editorFontFamily: draft.editorFontFamily,
      editorFontSize: draft.editorFontSize,
      locale: draft.locale,
    });
  };

  const resetDraft = (): void => {
    setDraft({
      ...DEFAULT_SETTINGS,
      theme: "system",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => setSettingsOpen(nextOpen)}
    >
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="appearance" className="w-full space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="appearance" className="flex-1">
              {t("settings.tab.appearance")}
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex-1">
              {t("settings.tab.editor")}
            </TabsTrigger>
            <TabsTrigger value="language" className="flex-1">
              {t("settings.tab.language")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="appearance" className="pt-4">
            <ThemeSetting
              value={draft.theme}
              onChange={(nextTheme) =>
                setDraft((current) => ({ ...current, theme: nextTheme }))
              }
            />
          </TabsContent>
          <TabsContent value="editor" className="pt-4">
            <FontSetting
              editorFontFamily={draft.editorFontFamily}
              editorFontSize={draft.editorFontSize}
              onEditorFontFamilyChange={(nextEditorFontFamily) =>
                setDraft((current) => ({
                  ...current,
                  editorFontFamily: nextEditorFontFamily,
                }))
              }
              onEditorFontSizeChange={(nextEditorFontSize) =>
                setDraft((current) => ({
                  ...current,
                  editorFontSize: nextEditorFontSize,
                }))
              }
            />
          </TabsContent>
          <TabsContent value="language" className="pt-4">
            <LocaleSetting
              value={draft.locale}
              onChange={(nextLocale) =>
                setDraft((current) => ({ ...current, locale: nextLocale }))
              }
            />
          </TabsContent>
        </Tabs>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={resetDraft}>
            {t("settings.resetDefault")}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettingsOpen(false)}
            >
              {t("settings.close")}
            </Button>
            <Button type="button" variant="secondary" onClick={commitDraft}>
              {t("settings.apply")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                commitDraft();
                setSettingsOpen(false);
              }}
            >
              {t("settings.confirm")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
