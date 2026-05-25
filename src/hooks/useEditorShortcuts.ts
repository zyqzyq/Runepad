import { useEffect } from "react";
import { useFileActions } from "@/hooks/useFileActions";
import { editorInstances } from "@/lib/editorInstances";
import { openReplacePanel, toggleFindPanel } from "@/lib/editorSearch";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

function isModKey(e: KeyboardEvent): boolean {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  return isMac ? e.metaKey : e.ctrlKey;
}

export function useEditorShortcuts(): void {
  const { newFile, openFile, saveFile, closeActiveTab } = useFileActions();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (!isModKey(e)) return;

      const key = e.key.toLowerCase();
      if (key === "n") {
        e.preventDefault();
        newFile();
      } else if (key === "o") {
        e.preventDefault();
        void openFile();
      } else if (key === "s") {
        e.preventDefault();
        void saveFile();
      } else if (key === "w") {
        e.preventDefault();
        closeActiveTab();
      } else if (key === "f") {
        const activeId = useTabStore.getState().activeId;
        const view = activeId ? editorInstances.get(activeId) : undefined;
        if (!view) return;
        e.preventDefault();
        toggleFindPanel(view);
      } else if (key === "h") {
        const activeId = useTabStore.getState().activeId;
        const view = activeId ? editorInstances.get(activeId) : undefined;
        if (!view) return;
        e.preventDefault();
        openReplacePanel(view);
      } else if (key === ",") {
        e.preventDefault();
        useUiStore.getState().setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeActiveTab, newFile, openFile, saveFile]);
}
