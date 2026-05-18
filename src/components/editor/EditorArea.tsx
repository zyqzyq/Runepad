import { EditorPanel } from "@/components/editor/EditorPanel";
import { useTabStore } from "@/stores/tabStore";

export function EditorArea(): JSX.Element {
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);

  return (
    <div className="relative min-h-0 flex-1 bg-background">
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
