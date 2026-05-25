import { FileTree } from "@/components/explorer/FileTree";
import { useI18n } from "@/i18n";
import { basename } from "@/lib/languageFromFilename";
import { useExplorerStore } from "@/stores/explorerStore";
import { useUiStore } from "@/stores/uiStore";

export function Sidebar(): JSX.Element | null {
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const rootPath = useExplorerStore((s) => s.rootPath);

  if (collapsed) return null;

  const title = rootPath ? basename(rootPath) : t("sidebar.explorer");

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-8 shrink-0 items-center border-b border-sidebar-border px-2">
        <span
          className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
          title={rootPath ?? undefined}
        >
          {title}
        </span>
      </div>
      <FileTree />
    </aside>
  );
}
