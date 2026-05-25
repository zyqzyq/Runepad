import { describe, expect, it } from "vitest";
import { basename, languageFromFilename } from "@/lib/languageFromFilename";
import { normalizePath, pathsMatch } from "@/lib/normalizePath";
import { displayPath } from "@/lib/pathDisplay";

describe("path and filename helpers", () => {
  it("detects supported editor languages by extension", () => {
    expect(languageFromFilename("app.tsx")).toBe("javascript");
    expect(languageFromFilename("package.json")).toBe("json");
    expect(languageFromFilename("README.md")).toBe("markdown");
    expect(languageFromFilename("notes.txt")).toBe("plaintext");
  });

  it("normalizes paths for Windows-friendly comparisons", () => {
    expect(normalizePath("\\\\?\\C:\\Work\\Runepad\\")).toBe("c:/work/runepad");
    expect(pathsMatch("C:\\Work\\a.txt", "c:/work/a.txt")).toBe(true);
    expect(basename("C:\\Work\\a.txt")).toBe("a.txt");
  });

  it("uses native separators for display on Windows", () => {
    Object.defineProperty(navigator, "platform", {
      configurable: true,
      value: "Win32",
    });

    expect(displayPath("C:/Work/a.txt")).toBe("C:\\Work\\a.txt");
  });
});
