import { describe, expect, it } from "vitest";
import { getLanguagePresentationTheme } from "@/lib/codemirrorTheme";

describe("codemirrorTheme", () => {
  it("adds Markdown presentation styling only for Markdown documents", () => {
    expect(getLanguagePresentationTheme("markdown").length).toBeGreaterThan(0);
    expect(getLanguagePresentationTheme("plaintext")).toEqual([]);
    expect(getLanguagePresentationTheme("json")).toEqual([]);
  });
});
