import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { FileTree } from "@/components/explorer/FileTree";
import { useI18n } from "@/i18n";
import { basename } from "@/lib/languageFromFilename";
import { useExplorerStore } from "@/stores/explorerStore";
import { useUiStore } from "@/stores/uiStore";

export function Sidebar(): JSX.Element | null {
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useUiStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth);
  const rootPath = useExplorerStore((s) => s.rootPath);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      if (event.button !== 0) return;
      event.preventDefault();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onPointerMove = (moveEvent: PointerEvent): void => {
        setSidebarWidth(moveEvent.clientX);
      };
      const onPointerUp = (): void => {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp, { once: true });
    },
    [setSidebarWidth],
  );

  if (collapsed) return null;

  const title = rootPath ? basename(rootPath) : t("sidebar.explorer");

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="flex h-8 shrink-0 items-center border-b border-sidebar-border px-2">
        <span
          className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
          title={rootPath ?? undefined}
        >
          {title}
        </span>
      </div>
      <FileTree />
      <div
        role="separator"
        aria-orientation="vertical"
        className="absolute top-0 right-[-3px] z-20 h-full w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-ring/35"
        onPointerDown={startResize}
      />
    </aside>
  );
}
