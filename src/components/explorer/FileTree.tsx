import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useI18n, toastErrorMessage } from "@/i18n";
import { FileTreeNode } from "@/components/explorer/FileTreeNode";
import { flattenTree } from "@/components/explorer/flattenTree";
import { useExplorerActions } from "@/hooks/useExplorerActions";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";

const ROW_HEIGHT = 28;

export function FileTree(): JSX.Element {
  const { t } = useI18n();
  const parentRef = useRef<HTMLDivElement>(null);
  const rootPath = useExplorerStore((s) => s.rootPath);
  const activeFilepath = useTabStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeId);
    return tab?.filepath ?? null;
  });
  const expandedPaths = useExplorerStore((s) => s.expandedPaths);
  const childrenByPath = useExplorerStore((s) => s.childrenByPath);
  const toggleExpand = useExplorerStore((s) => s.toggleExpand);
  const isExpanded = useExplorerStore((s) => s.isExpanded);

  const { loadDirectory, openFileAtPath } = useExplorerActions();

  const rows = useMemo(() => {
    if (!rootPath) return [];
    return flattenTree(rootPath, expandedPaths, childrenByPath);
  }, [rootPath, expandedPaths, childrenByPath]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  useEffect(() => {
    if (!rootPath) return;
    if (childrenByPath[rootPath]) return;
    void loadDirectory(rootPath).catch((e) => {
      toast.error(toastErrorMessage(e));
      useExplorerStore.getState().closeRoot();
    });
  }, [rootPath, childrenByPath, loadDirectory]);

  const handleRowClick = useCallback(
    async (row: (typeof rows)[number]) => {
      if (row.isDirectory) {
        const expanded = isExpanded(row.path);
        if (!expanded) {
          toggleExpand(row.path);
          if (!useExplorerStore.getState().childrenByPath[row.path]) {
            try {
              await loadDirectory(row.path);
            } catch (e) {
              toast.error(toastErrorMessage(e));
              toggleExpand(row.path);
            }
          }
        } else {
          toggleExpand(row.path);
        }
        return;
      }

      try {
        await openFileAtPath(row.path);
      } catch (e) {
        toast.error(toastErrorMessage(e));
      }
    },
    [isExpanded, loadDirectory, openFileAtPath, toggleExpand],
  );

  if (!rootPath) {
    return <div className="flex-1" />;
  }

  if (rows.length === 0 && childrenByPath[rootPath]) {
    return (
      <div className="flex flex-1 items-center justify-center p-2 text-xs text-muted-foreground">
        {t("explorer.emptyFolder")}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          return (
            <div
              key={row.path}
              className="absolute left-0 top-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <FileTreeNode
                row={row}
                isExpanded={isExpanded(row.path)}
                isActiveFile={
                  !row.isDirectory &&
                  activeFilepath !== null &&
                  row.path === activeFilepath
                }
                onClick={() => void handleRowClick(row)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
