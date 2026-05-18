/** Normalize paths for comparison (Windows-friendly). */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase();
}
