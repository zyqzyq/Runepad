import { useCallback } from "react";
import { toast } from "sonner";
import {
  getFileMetadata,
  openDialog,
  saveDialog,
  writeFile,
} from "@/api/fileApi";
import { getT, toastErrorMessage } from "@/i18n";
import { useCloseTab } from "@/hooks/useCloseTab";
import { getTextFileDialogFilters } from "@/lib/dialogFilters";
import { basename, languageFromFilename } from "@/lib/languageFromFilename";
import { editorInstances } from "@/lib/editorInstances";
import { openFileInTab } from "@/lib/openFileInTab";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { useTabStore } from "@/stores/tabStore";

export function useFileActions(): {
  newFile: () => void;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  saveTabById: (tabId: string) => Promise<boolean>;
  closeActiveTab: () => void;
} {
  const addNewTab = useTabStore((s) => s.addNewTab);
  const updateTab = useTabStore((s) => s.updateTab);
  const markDirty = useTabStore((s) => s.markDirty);
  const activeId = useTabStore((s) => s.activeId);
  const getActiveTab = useTabStore((s) => s.getActiveTab);
  const tabs = useTabStore((s) => s.tabs);
  const { requestCloseTab } = useCloseTab();

  const newFile = useCallback(() => {
    addNewTab();
  }, [addNewTab]);

  const openFile = useCallback(async () => {
    try {
      const selected = await openDialog({ filters: getTextFileDialogFilters() });
      if (!selected || Array.isArray(selected)) return;
      await openFileInTab(selected);
    } catch (e) {
      toast.error(toastErrorMessage(e));
    }
  }, []);

  const saveTabById = useCallback(
    async (tabId: string): Promise<boolean> => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return false;

      const view = editorInstances.get(tabId);
      if (!view) return false;

      const content = view.state.doc.toString();

      try {
        let path = tab.filepath;
        if (!path) {
          const selected = await saveDialog({
            defaultPath: tab.filename,
            filters: getTextFileDialogFilters(),
          });
          if (!selected) return false;
          path = selected;
        }

        await writeFile(path, content, {
          encoding: tab.encoding,
          lineEnding: tab.lineEnding,
        });
        const metadata = await getFileMetadata(path);

        const filename = basename(path);
        updateTab(tabId, {
          filepath: path,
          filename,
          isNew: false,
          isDirty: false,
          language: languageFromFilename(filename),
          diskModifiedMs: metadata.modifiedMs,
        });
        markDirty(tabId, false);
        useRecentFilesStore.getState().push(path);
        return true;
      } catch (e) {
        toast.error(toastErrorMessage(e));
        return false;
      }
    },
    [markDirty, tabs, updateTab],
  );

  const saveFile = useCallback(async () => {
    if (!activeId) return;
    const tab = getActiveTab();
    if (!tab) return;

    const saved = await saveTabById(activeId);
    if (saved) {
      toast.success(getT()("toast.saved", { filename: tab.filename }));
    }
  }, [activeId, getActiveTab, saveTabById]);

  const closeActiveTab = useCallback(() => {
    if (!activeId) return;
    requestCloseTab(activeId);
  }, [activeId, requestCloseTab]);

  return { newFile, openFile, saveFile, saveTabById, closeActiveTab };
}
