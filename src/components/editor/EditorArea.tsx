import { lazy, Suspense, useEffect } from "react";
import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { loadTabContentFromDisk } from "@/lib/reloadTabFromDisk";
import { useTabStore } from "@/stores/tabStore";

const EditorPanel = lazy(() =>
  import("@/components/editor/EditorPanel").then((module) => ({
    default: module.EditorPanel,
  })),
);

function EditorAreaFallback(): JSX.Element {
  return <div className="h-full w-full bg-[var(--editor-background)]" />;
}

export function EditorArea(): JSX.Element {
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);
  const activeTab = tabs.find((tab) => tab.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    const view = editorInstances.get(activeId);
    view?.focus();
  }, [activeId]);

  useEffect(() => {
    if (!activeTab?.filepath) return;
    if (pendingInitialDocs.has(activeTab.id)) return;
    void loadTabContentFromDisk(activeTab);
  }, [activeTab]);

  return (
    <div
      data-editor-area
      className="relative min-h-0 flex-1 bg-[var(--editor-background)]"
    >
      <Suspense fallback={<EditorAreaFallback />}>
        {activeTab ? (
          <EditorPanel
            key={activeTab.id}
            docId={activeTab.id}
            language={activeTab.language}
            isActive
          />
        ) : null}
      </Suspense>
    </div>
  );
}
