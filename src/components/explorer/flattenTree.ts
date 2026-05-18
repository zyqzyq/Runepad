import type { DirEntry } from "@/types/dir";

export interface FlatTreeRow {
  path: string;
  name: string;
  depth: number;
  isDirectory: boolean;
}

export function flattenTree(
  rootPath: string,
  expandedPaths: Record<string, true>,
  childrenByPath: Record<string, DirEntry[]>,
): FlatTreeRow[] {
  const rows: FlatTreeRow[] = [];

  function walk(dirPath: string, depth: number): void {
    const children = childrenByPath[dirPath];
    if (!children) return;

    for (const entry of children) {
      rows.push({
        path: entry.path,
        name: entry.name,
        depth,
        isDirectory: entry.isDirectory,
      });
      if (entry.isDirectory && expandedPaths[entry.path]) {
        walk(entry.path, depth + 1);
      }
    }
  }

  if (expandedPaths[rootPath] && childrenByPath[rootPath]) {
    walk(rootPath, 0);
  }

  return rows;
}
