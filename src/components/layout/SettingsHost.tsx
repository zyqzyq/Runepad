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
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";

export function SettingsHost(): JSX.Element {
  const open = useUiStore((s) => s.settingsOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => setSettingsOpen(nextOpen)}
    >
      <DialogContent key={locale} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="appearance" className="w-full">
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
            <ThemeSetting />
          </TabsContent>
          <TabsContent value="editor" className="pt-4">
            <FontSetting />
          </TabsContent>
          <TabsContent value="language" className="pt-4">
            <LocaleSetting />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="button" onClick={() => setSettingsOpen(false)}>
            {t("settings.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
