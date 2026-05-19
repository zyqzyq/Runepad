import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";

const MENU_APP_ACTION_EVENT = "menu-app-action";
const MENU_APP_SETTINGS = "app-settings";

export function useSettingsMenu(): void {
  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listen<string>(MENU_APP_ACTION_EVENT, (event) => {
      if (event.payload === MENU_APP_SETTINGS) {
        useUiStore.getState().setSettingsOpen(true);
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
