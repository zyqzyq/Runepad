import { useCallback } from "react";
import { toast } from "sonner";
import { toastErrorMessage } from "@/i18n";
import { readDir } from "@/api/dirApi";
import { openFolderDialog } from "@/api/fileApi";
import { openFileInTab } from "@/lib/openFileInTab";
import { useExplorerStore } from "@/stores/explorerStore";

export function useExplorerActions(): {
  openFolder: () => Promise<void>;
  closeFolder: () => void;
  openFileAtPath: (path: string) => Promise<void>;
  loadDirectory: (path: string) => Promise<void>;
} {
  const openRoot = useExplorerStore((s) => s.openRoot);
  const closeRoot = useExplorerStore((s) => s.closeRoot);
  const setChildren = useExplorerStore((s) => s.setChildren);
  const loadDirectory = useCallback(
    async (path: string) => {
      const entries = await readDir(path);
      setChildren(path, entries);
    },
    [setChildren],
  );

  const openFileAtPath = useCallback(async (path: string) => {
    await openFileInTab(path);
  }, []);

  const openFolder = useCallback(async () => {
    try {
      const selected = await openFolderDialog();
      if (!selected) return;

      openRoot(selected);
      await loadDirectory(selected);
    } catch (e) {
      useExplorerStore.getState().closeRoot();
      toast.error(toastErrorMessage(e));
    }
  }, [loadDirectory, openRoot]);

  const closeFolder = useCallback(() => {
    closeRoot();
  }, [closeRoot]);

  return { openFolder, closeFolder, openFileAtPath, loadDirectory };
}
