import { useEffect } from "react";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { editorInstances } from "@/lib/editorInstances";
import { useTabStore } from "@/stores/tabStore";

export function EditorArea(): JSX.Element {
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);

  useEffect(() => {
    if (!activeId) return;
    const view = editorInstances.get(activeId);
    view?.focus();
  }, [activeId]);

  return (
    <div
      data-editor-area
      className="relative min-h-0 flex-1 bg-[var(--editor-background)]"
    >
      {tabs.map((tab) => (
        <EditorPanel
          key={tab.id}
          docId={tab.id}
          language={tab.language}
          isActive={tab.id === activeId}
        />
      ))}
    </div>
  );
}
