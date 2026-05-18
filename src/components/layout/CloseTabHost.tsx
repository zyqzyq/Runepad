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
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useTabStore } from "@/stores/tabStore";

export function CloseTabHost(): JSX.Element {
  const pendingTabId = useCloseTabStore((s) => s.pendingTabId);
  const setPendingTabId = useCloseTabStore((s) => s.setPendingTabId);
  const tabs = useTabStore((s) => s.tabs);
  const { forceCloseTab } = useCloseTab();
  const { saveTabById } = useFileActions();

  const tab = pendingTabId
    ? tabs.find((t) => t.id === pendingTabId)
    : undefined;
  const open = pendingTabId !== null && tab !== undefined;

  const handleCancel = useCallback(() => {
    setPendingTabId(null);
  }, [setPendingTabId]);

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
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [forceCloseTab, pendingTabId, saveTabById]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Unsaved changes</DialogTitle>
          <DialogDescription>
            &apos;{tab?.filename}&apos; has unsaved changes. Close without saving?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDiscard}>
            Don&apos;t save
          </Button>
          <Button type="button" onClick={() => void handleSaveAndClose()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
