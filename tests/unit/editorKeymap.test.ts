import { describe, expect, test, vi } from "vitest";
import { editorKeymap } from "@/lib/editorKeymap";

const editorSearch = vi.hoisted(() => ({
  toggleFindPanel: vi.fn(),
  openReplacePanel: vi.fn(),
  toggleReplacePanel: vi.fn(),
}));

vi.mock("@/lib/editorSearch", () => ({
  toggleFindPanel: editorSearch.toggleFindPanel,
  openReplacePanel: editorSearch.openReplacePanel,
  toggleReplacePanel: editorSearch.toggleReplacePanel,
}));

describe("editorKeymap", () => {
  test("uses Mod-r for replace instead of Mod-h", () => {
    const keys = editorKeymap.map((binding) => binding.key);

    expect(keys).toContain("Mod-r");
    expect(keys).not.toContain("Mod-h");
  });
});
