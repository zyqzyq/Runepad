import { useEffect } from "react";
import { useFileActions } from "@/hooks/useFileActions";

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
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeActiveTab, newFile, openFile, saveFile]);
}
