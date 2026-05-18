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
import { displayPath } from "@/lib/pathDisplay";
import { openFileInTab } from "@/lib/openFileInTab";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { useUiStore } from "@/stores/uiStore";

export function RecentFilesHost(): JSX.Element {
  const open = useUiStore((s) => s.recentFilesOpen);
  const setRecentFilesOpen = useUiStore((s) => s.setRecentFilesOpen);
  const paths = useRecentFilesStore((s) => s.paths);
  const remove = useRecentFilesStore((s) => s.remove);
  const clear = useRecentFilesStore((s) => s.clear);

  const handleOpenPath = useCallback(
    async (path: string) => {
      try {
        await openFileInTab(path);
        setRecentFilesOpen(false);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error(message);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Recent files</DialogTitle>
          <DialogDescription>
            {paths.length === 0
              ? "No recent files yet. Open or save a file to add it here."
              : "Select a file to open."}
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
            Clear list
          </Button>
          <Button type="button" onClick={() => setRecentFilesOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
