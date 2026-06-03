// Runepad | Module: pathDisplay | Depends on: none

/** Display path with native separators on Windows. */
export function displayPath(path: string): string {
  let shown = path.trim();
  if (shown.startsWith("\\\\?\\")) {
    shown = shown.slice(4);
  }
  const isWindows =
    typeof navigator !== "undefined" &&
    /win/i.test(navigator.platform);
  if (isWindows) {
    return shown.replace(/\//g, "\\");
  }
  return shown;
}
