import { useCallback } from "react";
import { toast } from "sonner";
import { openDialog, readFile, saveDialog, writeFile } from "@/api/fileApi";
import { basename, languageFromFilename } from "@/lib/languageFromFilename";
import {
  destroyEditorInstance,
  editorInstances,
} from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

const TEXT_FILTERS = [
  {
    name: "Text files",
    extensions: [
      "txt",
      "md",
      "json",
      "js",
      "ts",
      "tsx",
      "jsx",
      "css",
      "html",
      "xml",
      "yaml",
      "yml",
      "rs",
      "toml",
    ],
  },
  { name: "All files", extensions: ["*"] },
];

export function useFileActions(): {
  newFile: () => void;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  closeActiveTab: () => void;
} {
  const addNewTab = useTabStore((s) => s.addNewTab);
  const addTabFromFile = useTabStore((s) => s.addTabFromFile);
  const closeTab = useTabStore((s) => s.closeTab);
  const removeMeta = useEditorStore((s) => s.removeMeta);
  const updateTab = useTabStore((s) => s.updateTab);
  const markDirty = useTabStore((s) => s.markDirty);
  const activeId = useTabStore((s) => s.activeId);
  const getActiveTab = useTabStore((s) => s.getActiveTab);

  const newFile = useCallback(() => {
    addNewTab();
  }, [addNewTab]);

  const openFile = useCallback(async () => {
    try {
      const selected = await openDialog({ filters: TEXT_FILTERS });
      if (!selected || Array.isArray(selected)) return;

      const { content, encoding, lineEnding } = await readFile(selected);
      const filename = basename(selected);
      const tabId = addTabFromFile({
        filepath: selected,
        filename,
        encoding,
        lineEnding,
        language: languageFromFilename(filename),
      });
      pendingInitialDocs.set(tabId, content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [addTabFromFile]);

  const saveFile = useCallback(async () => {
    const tab = getActiveTab();
    if (!tab || !activeId) return;

    const view = editorInstances.get(activeId);
    if (!view) return;

    const content = view.state.doc.toString();

    try {
      let path = tab.filepath;
      if (!path) {
        const selected = await saveDialog({
          defaultPath: tab.filename,
          filters: TEXT_FILTERS,
        });
        if (!selected) return;
        path = selected;
      }

      await writeFile(path, content, {
        encoding: tab.encoding,
        lineEnding: tab.lineEnding,
      });

      const filename = basename(path);
      updateTab(activeId, {
        filepath: path,
        filename,
        isNew: false,
        isDirty: false,
        language: languageFromFilename(filename),
      });
      markDirty(activeId, false);
      toast.success(`Saved ${filename}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  }, [activeId, getActiveTab, markDirty, updateTab]);

  const closeActiveTab = useCallback(() => {
    if (!activeId) return;
    destroyEditorInstance(activeId);
    removeMeta(activeId);
    closeTab(activeId);
  }, [activeId, closeTab, removeMeta]);

  return { newFile, openFile, saveFile, closeActiveTab };
}
