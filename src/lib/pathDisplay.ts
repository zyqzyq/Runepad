// Runepad | Module: pathDisplay | Depends on: none

/** Display path with native separators on Windows. */
export function displayPath(path: string): string {
  const isWindows =
    typeof navigator !== "undefined" &&
    /win/i.test(navigator.platform);
  if (isWindows) {
    return path.replace(/\//g, "\\");
  }
  return path;
}
