// Runepad | Module: normalizePath | Depends on: none

/** Normalize paths for comparison (Windows-friendly, strips extended-length prefix). */
export function normalizePath(path: string): string {
  let p = path.trim();
  if (p.startsWith("\\\\?\\")) {
    p = p.slice(4);
  }
  p = p.replace(/\\/g, "/").toLowerCase();
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

export function pathsMatch(a: string, b: string): boolean {
  return normalizePath(a) === normalizePath(b);
}
