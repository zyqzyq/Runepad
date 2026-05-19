import { PanelLeft, PanelLeftClose } from "lucide-react";
import { FileTree } from "@/components/explorer/FileTree";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { basename } from "@/lib/languageFromFilename";
import { cn } from "@/lib/utils";
import { useExplorerStore } from "@/stores/explorerStore";
import { useUiStore } from "@/stores/uiStore";

export function Sidebar(): JSX.Element {
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const rootPath = useExplorerStore((s) => s.rootPath);

  const title = rootPath ? basename(rootPath) : t("sidebar.explorer");

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width]",
        collapsed ? "w-10" : "w-[250px]",
      )}
    >
      <div className="flex h-8 shrink-0 items-center border-b border-sidebar-border px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        {!collapsed && (
          <span
            className="ml-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            title={rootPath ?? undefined}
          >
            {title}
          </span>
        )}
      </div>
      {!collapsed && <FileTree />}
    </aside>
  );
}
