import { useCallback } from "react";
import { disposeTabEditor } from "@/lib/editorInstances";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

export function useCloseTab(): {
  requestCloseTab: (id: string) => void;
  requestCloseTabs: (ids: string[]) => void;
  forceCloseTab: (id: string) => void;
  cancelCloseTabs: () => void;
} {
  const setPendingTabId = useCloseTabStore((s) => s.setPendingTabId);
  const setPendingTabIds = useCloseTabStore((s) => s.setPendingTabIds);
  const clearPendingTabs = useCloseTabStore((s) => s.clearPendingTabs);
  const closeTab = useTabStore((s) => s.closeTab);
  const removeMeta = useEditorStore((s) => s.removeMeta);

  const closeTabNow = useCallback(
    (id: string) => {
      disposeTabEditor(id);
      removeMeta(id);
      closeTab(id);
    },
    [closeTab, removeMeta],
  );

  const requestCloseTabs = useCallback(
    (ids: string[]) => {
      const queue = [...new Set(ids)];

      while (queue.length > 0) {
        const id = queue.shift();
        if (!id) continue;

        const tab = useTabStore.getState().tabs.find((t) => t.id === id);
        if (!tab) continue;

        if (tab.isDirty) {
          setPendingTabId(id);
          setPendingTabIds(queue);
          return;
        }

        closeTabNow(id);
      }

      clearPendingTabs();
    },
    [clearPendingTabs, closeTabNow, setPendingTabId, setPendingTabIds],
  );

  const forceCloseTab = useCallback(
    (id: string) => {
      const closeState = useCloseTabStore.getState();
      const queuedIds =
        closeState.pendingTabId === id ? closeState.pendingTabIds : [];

      closeTabNow(id);
      clearPendingTabs();

      if (queuedIds.length > 0) {
        requestCloseTabs(queuedIds);
      }
    },
    [clearPendingTabs, closeTabNow, requestCloseTabs],
  );

  const requestCloseTab = useCallback(
    (id: string) => {
      requestCloseTabs([id]);
    },
    [requestCloseTabs],
  );

  return {
    requestCloseTab,
    requestCloseTabs,
    forceCloseTab,
    cancelCloseTabs: clearPendingTabs,
  };
}
