import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dragFromRef = useRef<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const reorderTabsRef = useRef(reorderTabs);
  reorderTabsRef.current = reorderTabs;

  const refreshScrollState = (): void => {
    const el = tabBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

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

  useEffect(() => {
    if (!activeId) return;
    const activeTab = tabBarRef.current?.querySelector<HTMLElement>(
      "[data-active-tab='true']",
    );
    activeTab?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
    window.setTimeout(refreshScrollState, 160);
  }, [activeId, tabs.length]);

  useEffect(() => {
    refreshScrollState();
    const el = tabBarRef.current;
    if (!el) return;

    const onScroll = (): void => refreshScrollState();
    const onWheel = (event: WheelEvent): void => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollBy({ left: event.deltaY, behavior: "smooth" });
    };
    const resizeObserver = new ResizeObserver(refreshScrollState);

    el.addEventListener("scroll", onScroll);
    el.addEventListener("wheel", onWheel, { passive: false });
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      resizeObserver.disconnect();
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

  const handleTabPointerDown = (index: number, e: PointerEvent): void => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-tab-close]")) return;

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

  const scrollTabs = (direction: -1 | 1): void => {
    const el = tabBarRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(160, Math.floor(el.clientWidth * 0.7)),
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-8 shrink-0 border-b border-border/50 bg-background">
      {canScrollLeft && (
        <button
          type="button"
          className="flex w-7 shrink-0 items-center justify-center border-r border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={() => scrollTabs(-1)}
          aria-label={t("tab.scrollLeft")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        ref={tabBarRef}
        data-tab-bar
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              data-active-tab={isActive}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              className={cn(
                "group flex max-w-[200px] shrink-0 cursor-grab items-center gap-1.5 px-3 text-xs select-none touch-none active:cursor-grabbing",
                isActive
                  ? "border-b-2 border-primary bg-muted/50 text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:bg-muted/30",
                isDragging && isDraggingActive && "opacity-50",
                isDropTarget && "bg-muted/40",
              )}
              onClick={() => handleTabClick(tab.id)}
              onPointerDown={(e) => handleTabPointerDown(index, e)}
              onMouseUp={(e) => handleMiddleClick(tab.id, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveTab(tab.id);
                }
              }}
            >
              {tab.isDirty && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400"
                  title={t("tab.unsaved")}
                />
              )}
              <span className="min-w-0 flex-1 truncate">{tab.filename}</span>
              <button
                type="button"
                data-tab-close
                className={cn(
                  "shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive ? "opacity-70" : "opacity-0 group-hover:opacity-70",
                )}
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
      {canScrollRight && (
        <button
          type="button"
          className="flex w-7 shrink-0 items-center justify-center border-l border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={() => scrollTabs(1)}
          aria-label={t("tab.scrollRight")}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
