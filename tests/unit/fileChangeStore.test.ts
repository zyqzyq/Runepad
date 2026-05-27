import { beforeEach, describe, expect, it } from "vitest";
import { useFileChangeStore } from "@/stores/fileChangeStore";

describe("fileChangeStore", () => {
  beforeEach(() => {
    useFileChangeStore.setState({ pendingTabIds: [] });
  });

  it("queues file-change prompts in order", () => {
    useFileChangeStore.getState().enqueue("tab-a");
    useFileChangeStore.getState().enqueue("tab-b");

    expect(useFileChangeStore.getState().pendingTabIds).toEqual([
      "tab-a",
      "tab-b",
    ]);
  });

  it("dedupes repeated prompts for the same tab", () => {
    useFileChangeStore.getState().enqueue("tab-a");
    useFileChangeStore.getState().enqueue("tab-a");

    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["tab-a"]);
  });

  it("clears and advances pending prompts", () => {
    useFileChangeStore.getState().enqueue("tab-a");
    useFileChangeStore.getState().enqueue("tab-b");

    useFileChangeStore.getState().clear("tab-a");

    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["tab-b"]);

    useFileChangeStore.getState().advance();

    expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
  });
});
