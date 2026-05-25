import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetStores } from "../helpers/storeState";
import { useTabStore } from "@/stores/tabStore";

describe("tabStore", () => {
  beforeEach(() => {
    resetStores();
  });

  it("adds a new editable tab and makes it active", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("tab-new");

    const id = useTabStore.getState().addNewTab();

    expect(id).toBe("tab-new");
    expect(useTabStore.getState().activeId).toBe("tab-new");
    expect(useTabStore.getState().tabs.at(-1)).toMatchObject({
      id: "tab-new",
      isDirty: false,
      isNew: true,
      language: "plaintext",
    });
  });

  it("marks and clears dirty state without storing document text", () => {
    useTabStore.getState().markDirty("tab-1");
    expect(useTabStore.getState().tabs[0]).toMatchObject({ isDirty: true });

    useTabStore.getState().markDirty("tab-1", false);
    expect(useTabStore.getState().tabs[0]).toMatchObject({ isDirty: false });
    expect("content" in useTabStore.getState().tabs[0]!).toBe(false);
  });

  it("keeps one fresh tab when closing the last tab", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("replacement");

    useTabStore.getState().closeTab("tab-1");

    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useTabStore.getState().activeId).toBe("replacement");
    expect(useTabStore.getState().tabs[0]).toMatchObject({
      id: "replacement",
      isNew: true,
    });
  });
});
