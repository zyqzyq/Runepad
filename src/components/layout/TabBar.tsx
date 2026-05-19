import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { GripVertical, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useCloseTab } from "@/hooks/useCloseTab";
import { useTabStore } from "@/stores/tabStore";

const DRAG_THRESHOLD_PX = 6;

function resolveTabIndexFromPoint(clientX: number, clientY: number): number | null {
  const el = document.elementFromPoint(clientX, clientY);
  const tabEl = el?.closest<HTMLElement>("[data-tab-index]");
  if (!tabEl) return null;
  const raw = tabEl.dataset.tabIndex;
  if (raw === undefined) return null;
  const index = Number.parseInt(raw, 10);
  return Number.isNaN(index) ? null : index;
}

function isOverEditorSurface(clientX: number, clientY: number): boolean {
  const el = document.elementFromPoint(clientX, clientY);
  return Boolean(el?.closest(".cm-editor, [data-editor-area]"));
}

export function TabBar(): JSX.Element {
  const { t } = useI18n();
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const reorderTabs = useTabStore((s) => s.reorderTabs);
  const { requestCloseTab } = useCloseTab();
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const dragFromRef = useRef<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const reorderTabsRef = useRef(reorderTabs);
  reorderTabsRef.current = reorderTabs;

  useEffect(() => {
    const cancelDrag = (): void => {
      dragFromRef.current = null;
      dropIndexRef.current = null;
      draggingRef.current = false;
      setIsDraggingActive(false);
      setDragFromIndex(null);
      setDropIndex(null);
    };

    const onPointerMove = (e: globalThis.PointerEvent): void => {
      if (dragFromRef.current === null) return;

      if (isOverEditorSurface(e.clientX, e.clientY)) {
        cancelDrag();
        return;
      }

      if (
        !draggingRef.current &&
        Math.abs(e.clientX - pointerStartXRef.current) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      if (!draggingRef.current) {
        draggingRef.current = true;
        setIsDraggingActive(true);
      }

      const over = resolveTabIndexFromPoint(e.clientX, e.clientY);
      if (over !== null) {
        dropIndexRef.current = over;
        setDropIndex(over);
      }
    };

    const finishDrag = (): void => {
      const from = dragFromRef.current;
      const to = dropIndexRef.current;
      if (
        draggingRef.current &&
        from !== null &&
        to !== null &&
        from !== to
      ) {
        reorderTabsRef.current(from, to);
        suppressClickRef.current = true;
      }
      cancelDrag();
    };

    const onPointerUp = (): void => {
      if (dragFromRef.current === null) return;
      finishDrag();
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const handleClose = (id: string, e: MouseEvent): void => {
    e.stopPropagation();
    requestCloseTab(id);
  };

  const handleMiddleClick = (id: string, e: MouseEvent): void => {
    if (e.button === 1) {
      e.preventDefault();
      handleClose(id, e);
    }
  };

  const handleDragHandlePointerDown = (
    index: number,
    e: PointerEvent,
  ): void => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    dragFromRef.current = index;
    dropIndexRef.current = index;
    pointerStartXRef.current = e.clientX;
    draggingRef.current = false;
    setDragFromIndex(index);
    setDropIndex(index);
  };

  const handleTabClick = (id: string): void => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setActiveTab(id);
  };

  return (
    <div
      data-tab-bar
      className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-muted/20"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;
        const isDragging = dragFromIndex === index;
        const isDropTarget =
          dropIndex === index &&
          dragFromIndex !== null &&
          dragFromIndex !== index;
        return (
          <div
            key={tab.id}
            data-tab-index={index}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            className={cn(
              "group flex max-w-[200px] shrink-0 items-center gap-0.5 border-r border-border pr-2 pl-1 text-xs select-none",
              isActive
                ? "bg-background text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-accent/50",
              isDragging && isDraggingActive && "opacity-50",
              isDropTarget && "ring-1 ring-inset ring-primary",
            )}
            onClick={() => handleTabClick(tab.id)}
            onMouseUp={(e) => handleMiddleClick(tab.id, e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActiveTab(tab.id);
              }
            }}
          >
            <button
              type="button"
              data-tab-drag-handle
              className={cn(
                "flex h-7 w-5 shrink-0 cursor-grab items-center justify-center rounded touch-none active:cursor-grabbing",
                "text-muted-foreground/50 hover:text-muted-foreground",
              )}
              aria-label={t("tab.dragReorder", { filename: tab.filename })}
              onPointerDown={(e) => handleDragHandlePointerDown(index, e)}
            >
              <GripVertical className="h-3 w-3" />
            </button>
            {tab.isDirty && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-primary"
                title={t("tab.unsaved")}
              />
            )}
            <span className="min-w-0 flex-1 truncate px-1">{tab.filename}</span>
            <button
              type="button"
              className="shrink-0 cursor-pointer rounded p-0.5 opacity-0 hover:bg-muted group-hover:opacity-100"
              onClick={(e) => handleClose(tab.id, e)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={t("tab.close", { filename: tab.filename })}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
