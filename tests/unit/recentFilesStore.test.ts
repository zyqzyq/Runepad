import { beforeEach, describe, expect, it } from "vitest";
import { resetStores } from "../helpers/storeState";
import { useRecentFilesStore } from "@/stores/recentFilesStore";

describe("recentFilesStore", () => {
  beforeEach(() => {
    resetStores();
  });

  it("deduplicates, trims, and persists recent paths", () => {
    const store = useRecentFilesStore.getState();

    store.push(" C:/work/a.txt ");
    store.push("C:/work/b.txt");
    store.push("C:/work/a.txt");

    expect(useRecentFilesStore.getState().paths).toEqual([
      "C:/work/a.txt",
      "C:/work/b.txt",
    ]);
    expect(JSON.parse(localStorage.getItem("runepad:recent-files") ?? "[]")).toEqual([
      "C:/work/a.txt",
      "C:/work/b.txt",
    ]);
  });

  it("caps the list to fifteen items", () => {
    for (let i = 0; i < 20; i++) {
      useRecentFilesStore.getState().push(`C:/work/${i}.txt`);
    }

    expect(useRecentFilesStore.getState().paths).toHaveLength(15);
    expect(useRecentFilesStore.getState().paths[0]).toBe("C:/work/19.txt");
  });
});
