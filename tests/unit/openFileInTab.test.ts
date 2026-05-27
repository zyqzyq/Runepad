import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetStores, makeTab } from "../helpers/storeState";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { openFileInTab } from "@/lib/openFileInTab";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { useTabStore } from "@/stores/tabStore";

vi.mock("@/api/fileApi", () => ({
  readFile: vi.fn(async () => ({
    content: "hello",
    encoding: "UTF-8",
    lineEnding: "LF",
  })),
}));

vi.mock("@/hooks/useDirWatcher", () => ({
  syncFileWatchesNow: vi.fn(),
}));

describe("openFileInTab", () => {
  beforeEach(() => {
    resetStores([
      makeTab({
        id: "existing",
        filename: "a.txt",
        filepath: "C:/work/a.txt",
        isNew: false,
      }),
    ]);
  });

  it("activates an already-open path instead of duplicating it", async () => {
    useTabStore.getState().addTabFromFile({
      id: "other",
      filepath: "C:/work/other.txt",
      filename: "other.txt",
      encoding: "UTF-8",
      lineEnding: "LF",
      language: "plaintext",
    });

    await openFileInTab("c:/WORK/a.txt");

    expect(useTabStore.getState().activeId).toBe("existing");
    expect(useTabStore.getState().tabs).toHaveLength(2);
  });

  it("queues a reload decision when opening an already-open dirty file", async () => {
    useTabStore.getState().markDirty("existing", true);

    await openFileInTab("c:/WORK/a.txt");

    expect(useTabStore.getState().activeId).toBe("existing");
    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["existing"]);
  });

  it("opens a new file with pending content and recent file entry", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("new-file");

    await openFileInTab("C:/work/app.ts");

    expect(useTabStore.getState().activeId).toBe("new-file");
    expect(useTabStore.getState().tabs.at(-1)).toMatchObject({
      filepath: "C:/work/app.ts",
      filename: "app.ts",
      language: "javascript",
      isDirty: false,
    });
    expect(pendingInitialDocs.get("new-file")).toBe("hello");
    expect(useRecentFilesStore.getState().paths).toEqual(["C:/work/app.ts"]);
  });
});
