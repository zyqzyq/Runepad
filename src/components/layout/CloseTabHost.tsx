import { useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCloseTab } from "@/hooks/useCloseTab";
import { useFileActions } from "@/hooks/useFileActions";
import { toastErrorMessage, useI18n } from "@/i18n";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTabStore } from "@/stores/tabStore";

export function CloseTabHost(): JSX.Element {
  const pendingTabId = useCloseTabStore((s) => s.pendingTabId);
  const tabs = useTabStore((s) => s.tabs);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useI18n();
  const { cancelCloseTabs, forceCloseTab } = useCloseTab();
  const { saveTabById } = useFileActions();

  const tab = pendingTabId
    ? tabs.find((t) => t.id === pendingTabId)
    : undefined;
  const open = pendingTabId !== null && tab !== undefined;

  const handleCancel = useCallback(() => {
    cancelCloseTabs();
  }, [cancelCloseTabs]);

  const handleDiscard = useCallback(() => {
    if (!pendingTabId) return;
    forceCloseTab(pendingTabId);
  }, [forceCloseTab, pendingTabId]);

  const handleSaveAndClose = useCallback(async () => {
    if (!pendingTabId) return;
    try {
      const saved = await saveTabById(pendingTabId);
      if (saved) {
        forceCloseTab(pendingTabId);
      }
    } catch (e) {
      toast.error(toastErrorMessage(e));
    }
  }, [forceCloseTab, pendingTabId, saveTabById]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCancel();
      }}
    >
      <DialogContent key={locale} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("closeTab.title")}</DialogTitle>
          <DialogDescription>
            {t("closeTab.description", {
              filename: tab?.filename ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("closeTab.cancel")}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDiscard}>
            {t("closeTab.discard")}
          </Button>
          <Button type="button" onClick={() => void handleSaveAndClose()}>
            {t("closeTab.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
