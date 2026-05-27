import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleChangedTabFromDisk } from "@/lib/fileChangeDecision";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import type { Tab } from "@/types/tab";

const reloadTabFromDisk = vi.fn(async () => true);

vi.mock("@/lib/reloadTabFromDisk", () => ({
  reloadTabFromDisk: (tab: Tab) => reloadTabFromDisk(tab),
}));

function tab(patch: Partial<Tab>): Tab {
  return {
    id: patch.id ?? "tab-a",
    filename: patch.filename ?? "a.txt",
    filepath: patch.filepath ?? "C:/work/a.txt",
    isDirty: patch.isDirty ?? false,
    isNew: patch.isNew ?? false,
    language: patch.language ?? "plaintext",
    encoding: patch.encoding ?? "UTF-8",
    lineEnding: patch.lineEnding ?? "LF",
    diskModifiedMs: patch.diskModifiedMs,
  };
}

describe("handleChangedTabFromDisk", () => {
  beforeEach(() => {
    useFileChangeStore.setState({ pendingTabIds: [] });
  });

  it("queues a reload decision for dirty tabs", async () => {
    await handleChangedTabFromDisk(tab({ id: "dirty", isDirty: true }));

    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["dirty"]);
    expect(reloadTabFromDisk).not.toHaveBeenCalled();
  });

  it("reloads clean tabs immediately", async () => {
    const cleanTab = tab({ id: "clean", isDirty: false });

    await handleChangedTabFromDisk(cleanTab);

    expect(reloadTabFromDisk).toHaveBeenCalledWith(cleanTab);
    expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
  });
});
