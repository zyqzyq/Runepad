import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { editorInstances } from "@/lib/editorInstances";
import { openFindPanel, openReplacePanel } from "@/lib/editorSearch";
import { useTabStore } from "@/stores/tabStore";

type MenuEditActionId = "edit-find" | "edit-replace";

function isMenuEditActionId(value: string): value is MenuEditActionId {
  return value === "edit-find" || value === "edit-replace";
}

/** Handles Tauri native Edit menu search actions. */
export function useEditMenu(): void {
  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listen<string>("menu-edit-action", (event) => {
      const id = event.payload;
      if (!isMenuEditActionId(id)) return;

      const activeId = useTabStore.getState().activeId;
      const view = activeId ? editorInstances.get(activeId) : undefined;
      if (!view) return;

      if (id === "edit-find") {
        openFindPanel(view);
      } else {
        openReplacePanel(view);
      }
    }).then((fn) => {
      if (disposed) {
        fn();
      } else {
        unlisten = fn;
      }
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);
}
