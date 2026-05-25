import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { resetStores, makeTab } from "../helpers/storeState";
import { useCloseTab } from "@/hooks/useCloseTab";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useTabStore } from "@/stores/tabStore";

describe("useCloseTab", () => {
  beforeEach(() => {
    resetStores([
      makeTab({ id: "clean", filename: "clean.txt", isDirty: false }),
      makeTab({ id: "dirty", filename: "dirty.txt", isDirty: true }),
    ]);
  });

  it("asks for confirmation before closing dirty tabs", () => {
    const { result } = renderHook(() => useCloseTab());

    result.current.requestCloseTab("dirty");

    expect(useCloseTabStore.getState().pendingTabId).toBe("dirty");
    expect(useTabStore.getState().tabs.map((tab) => tab.id)).toEqual(["clean", "dirty"]);
  });

  it("closes clean tabs immediately", () => {
    const { result } = renderHook(() => useCloseTab());

    result.current.requestCloseTab("clean");

    expect(useCloseTabStore.getState().pendingTabId).toBeNull();
    expect(useTabStore.getState().tabs.map((tab) => tab.id)).toEqual(["dirty"]);
  });
});
