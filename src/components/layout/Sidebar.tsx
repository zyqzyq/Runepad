import { PanelLeft, PanelLeftClose } from "lucide-react";
import { FileTree } from "@/components/explorer/FileTree";
import { Button } from "@/components/ui/button";
import { basename } from "@/lib/languageFromFilename";
import { cn } from "@/lib/utils";
import { useExplorerStore } from "@/stores/explorerStore";
import { useUiStore } from "@/stores/uiStore";

export function Sidebar(): JSX.Element {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const rootPath = useExplorerStore((s) => s.rootPath);

  const title = rootPath ? basename(rootPath) : "Explorer";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-muted/30 transition-[width]",
        collapsed ? "w-10" : "w-[250px]",
      )}
    >
      <div className="flex h-9 shrink-0 items-center border-b border-border px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        {!collapsed && (
          <span className="ml-1 truncate text-xs text-muted-foreground" title={rootPath ?? undefined}>
            {title}
          </span>
        )}
      </div>
      {!collapsed && <FileTree />}
    </aside>
  );
}
