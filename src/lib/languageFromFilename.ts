export function languageFromFilename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "plaintext";
  switch (filename.slice(dot + 1).toLowerCase()) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return "javascript";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function basename(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? path;
}
