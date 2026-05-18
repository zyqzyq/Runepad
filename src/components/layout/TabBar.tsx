import type { MouseEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { disposeTabEditor } from "@/lib/editorInstances";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

export function TabBar(): JSX.Element {
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const removeMeta = useEditorStore((s) => s.removeMeta);

  const handleClose = (id: string, e: MouseEvent): void => {
    e.stopPropagation();
    disposeTabEditor(id);
    removeMeta(id);
    closeTab(id);
  };

  const handleMiddleClick = (id: string, e: MouseEvent): void => {
    if (e.button === 1) {
      e.preventDefault();
      handleClose(id, e);
    }
  };

  return (
    <div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-muted/20">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            className={cn(
              "group flex max-w-[200px] shrink-0 cursor-pointer items-center gap-1.5 border-r border-border px-3 text-xs",
              isActive
                ? "bg-background text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-accent/50",
            )}
            onClick={() => setActiveTab(tab.id)}
            onMouseUp={(e) => handleMiddleClick(tab.id, e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActiveTab(tab.id);
              }
            }}
          >
            {tab.isDirty && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-primary"
                title="Unsaved changes"
              />
            )}
            <span className="truncate">{tab.filename}</span>
            <button
              type="button"
              className="ml-1 rounded p-0.5 opacity-0 hover:bg-muted group-hover:opacity-100"
              onClick={(e) => handleClose(tab.id, e)}
              aria-label={`Close ${tab.filename}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
