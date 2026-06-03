import { ChevronRight, File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlatTreeRow } from "@/components/explorer/flattenTree";

interface FileTreeNodeProps {
  row: FlatTreeRow;
  isExpanded: boolean;
  isActiveFile: boolean;
  onClick: () => void;
}

export function FileTreeNode({
  row,
  isExpanded,
  isActiveFile,
  onClick,
}: FileTreeNodeProps): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        "flex h-7 w-full items-center gap-1 rounded-sm px-2 text-left text-xs",
        "text-sidebar-foreground hover:bg-background/55 hover:text-sidebar-accent-foreground",
        isActiveFile && "bg-background/70 font-medium text-sidebar-accent-foreground",
      )}
      style={{ paddingLeft: `${8 + row.depth * 12}px` }}
      onClick={onClick}
    >
      {row.isDirectory ? (
        <>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
          />
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </>
      ) : (
        <>
          <span className="w-3.5 shrink-0" />
          <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </>
      )}
      <span className="truncate">{row.name}</span>
    </button>
  );
}
