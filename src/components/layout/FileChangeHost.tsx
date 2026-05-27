import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { reloadTabFromDisk } from "@/lib/reloadTabFromDisk";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTabStore } from "@/stores/tabStore";

export function FileChangeHost(): JSX.Element | null {
  const pendingTabIds = useFileChangeStore((s) => s.pendingTabIds);
  const clear = useFileChangeStore((s) => s.clear);
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);
  const locale = useSettingsStore((s) => s.locale);
  const titleId = `file-change-title-${locale}`;
  const descriptionId = `file-change-description-${locale}`;
  const { t } = useI18n();

  const pendingTabId =
    activeId && pendingTabIds.includes(activeId) ? activeId : null;
  const tab = pendingTabId
    ? tabs.find((candidate) => candidate.id === pendingTabId)
    : undefined;

  useEffect(() => {
    const tabIds = new Set(tabs.map((candidate) => candidate.id));
    for (const id of pendingTabIds) {
      if (!tabIds.has(id)) {
        clear(id);
      }
    }
  }, [clear, pendingTabIds, tabs]);

  const handleKeepCurrent = useCallback(() => {
    if (!pendingTabId) return;
    clear(pendingTabId);
  }, [clear, pendingTabId]);

  const handleDiscardAndReload = useCallback(async () => {
    if (!pendingTabId) return;
    const currentTab = useTabStore
      .getState()
      .tabs.find((candidate) => candidate.id === pendingTabId);
    if (!currentTab) {
      clear(pendingTabId);
      return;
    }

    const reloaded = await reloadTabFromDisk(currentTab);
    if (reloaded) {
      clear(pendingTabId);
    }
  }, [clear, pendingTabId]);

  if (!pendingTabId || !tab) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 p-4 supports-backdrop-filter:backdrop-blur-xs"
      data-testid="file-change-backdrop"
    >
      <div className="absolute inset-0 bg-background/30 dark:bg-background/20" />
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="false"
        className="relative grid w-full max-w-sm gap-4 rounded-xl bg-popover/98 p-4 text-sm text-popover-foreground ring-1 ring-foreground/15 shadow-2xl"
        role="dialog"
      >
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-base leading-none font-medium">
            {t("fileChange.title")}
          </h2>
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {t("fileChange.description", { filename: tab.filename })}
          </p>
        </div>
        <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleKeepCurrent}>
            {t("fileChange.keep")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDiscardAndReload()}
          >
            {t("fileChange.discardReload")}
          </Button>
        </div>
      </div>
    </div>
  );
}
