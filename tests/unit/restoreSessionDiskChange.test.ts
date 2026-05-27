import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetStores } from "../helpers/storeState";
import { restoreSession } from "@/lib/restoreSession";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import { useTabStore } from "@/stores/tabStore";
import type { SessionSnapshot } from "@/types/session";

const getFileMetadata = vi.fn(async () => ({ modifiedMs: 2000 }));

vi.mock("@/api/fileApi", () => ({
  getFileMetadata: (path: string) => getFileMetadata(path),
  readFile: vi.fn(async () => ({
    content: "disk",
    encoding: "UTF-8",
    lineEnding: "LF",
    modifiedMs: 2000,
  })),
}));

function dirtySnapshot(): SessionSnapshot {
  return {
    version: 2,
    activeIndex: 0,
    explorerRoot: null,
    expandedPaths: [],
    theme: "system",
    tabs: [
      {
        filepath: "C:/work/a.txt",
        filename: "a.txt",
        isNew: false,
        encoding: "UTF-8",
        lineEnding: "LF",
        language: "plaintext",
        content: "cached dirty",
        isDirty: true,
        diskModifiedMs: 1000,
      },
    ],
  };
}

describe("restoreSession disk change detection", () => {
  beforeEach(() => {
    resetStores([]);
    getFileMetadata.mockClear();
    getFileMetadata.mockResolvedValue({ modifiedMs: 2000 });
  });

  it("queues a reload decision when a restored dirty file changed on disk", async () => {
    await restoreSession(dirtySnapshot(), { awaitActiveTabLoad: true });

    const tab = useTabStore.getState().tabs[0];
    expect(tab?.isDirty).toBe(true);
    expect(useFileChangeStore.getState().pendingTabIds).toEqual([tab?.id]);
    expect(getFileMetadata).toHaveBeenCalledWith("C:/work/a.txt");
  });

  it("does not queue when the restored dirty file mtime is unchanged", async () => {
    getFileMetadata.mockResolvedValue({ modifiedMs: 1000 });

    await restoreSession(dirtySnapshot(), { awaitActiveTabLoad: true });

    expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
  });
});
