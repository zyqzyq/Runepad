import { useCallback } from "react";
import { disposeTabEditor } from "@/lib/editorInstances";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

export function useCloseTab(): {
  requestCloseTab: (id: string) => void;
  forceCloseTab: (id: string) => void;
} {
  const setPendingTabId = useCloseTabStore((s) => s.setPendingTabId);
  const closeTab = useTabStore((s) => s.closeTab);
  const removeMeta = useEditorStore((s) => s.removeMeta);
  const tabs = useTabStore((s) => s.tabs);

  const forceCloseTab = useCallback(
    (id: string) => {
      disposeTabEditor(id);
      removeMeta(id);
      closeTab(id);
      setPendingTabId(null);
    },
    [closeTab, removeMeta, setPendingTabId],
  );

  const requestCloseTab = useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;
      if (tab.isDirty) {
        setPendingTabId(id);
        return;
      }
      forceCloseTab(id);
    },
    [forceCloseTab, setPendingTabId, tabs],
  );

  return { requestCloseTab, forceCloseTab };
}
