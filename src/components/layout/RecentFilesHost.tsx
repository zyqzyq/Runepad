import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/i18n";
import { displayPath } from "@/lib/pathDisplay";
import { openFileInTab } from "@/lib/openFileInTab";
import { toastErrorMessage } from "@/i18n";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";

export function RecentFilesHost(): JSX.Element {
  const open = useUiStore((s) => s.recentFilesOpen);
  const setRecentFilesOpen = useUiStore((s) => s.setRecentFilesOpen);
  const paths = useRecentFilesStore((s) => s.paths);
  const remove = useRecentFilesStore((s) => s.remove);
  const clear = useRecentFilesStore((s) => s.clear);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useI18n();

  const handleOpenPath = useCallback(
    async (path: string) => {
      try {
        await openFileInTab(path);
        setRecentFilesOpen(false);
      } catch (e) {
        toast.error(toastErrorMessage(e));
        remove(path);
      }
    },
    [remove, setRecentFilesOpen],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => setRecentFilesOpen(nextOpen)}
    >
      <DialogContent key={locale} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("recent.title")}</DialogTitle>
          <DialogDescription>
            {paths.length === 0
              ? t("recent.description.empty")
              : t("recent.description.list")}
          </DialogDescription>
        </DialogHeader>
        {paths.length > 0 && (
          <ScrollArea className="max-h-64 rounded-md border border-border">
            <ul className="p-1">
              {paths.map((path) => {
                const shown = displayPath(path);
                return (
                  <li key={path}>
                    <button
                      type="button"
                      className="flex w-full min-w-0 rounded-md px-3 py-2 text-left text-sm hover:bg-accent/60"
                      title={shown}
                      onClick={() => void handleOpenPath(path)}
                    >
                      <span className="truncate font-medium" dir="ltr">
                        {shown}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={paths.length === 0}
            onClick={clear}
          >
            {t("recent.clear")}
          </Button>
          <Button type="button" onClick={() => setRecentFilesOpen(false)}>
            {t("recent.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
