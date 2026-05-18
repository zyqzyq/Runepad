import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";
import { useFileActions } from "@/hooks/useFileActions";

type MenuFileActionId =
  | "file-new"
  | "file-open"
  | "file-save"
  | "file-close";

function isMenuFileActionId(value: string): value is MenuFileActionId {
  return (
    value === "file-new" ||
    value === "file-open" ||
    value === "file-save" ||
    value === "file-close"
  );
}

/** Handles Tauri native menu clicks (see `src-tauri/src/menu.rs`). */
export function useAppMenu(): void {
  const actions = useFileActions();
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listen<string>("menu-file-action", (event) => {
      const id = event.payload;
      if (!isMenuFileActionId(id)) return;

      const current = actionsRef.current;
      switch (id) {
        case "file-new":
          current.newFile();
          break;
        case "file-open":
          void current.openFile();
          break;
        case "file-save":
          void current.saveFile();
          break;
        case "file-close":
          current.closeActiveTab();
          break;
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
