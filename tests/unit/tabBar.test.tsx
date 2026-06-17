import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabBar } from "@/components/layout/TabBar";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useTabStore } from "@/stores/tabStore";
import { makeTab, resetStores } from "../helpers/storeState";

describe("TabBar", () => {
  beforeEach(() => {
    resetStores([
      makeTab({ id: "clean-left", filename: "clean-left.txt", isDirty: false }),
      makeTab({ id: "dirty", filename: "dirty.txt", isDirty: true }),
      makeTab({ id: "clean-right", filename: "clean-right.txt", isDirty: false }),
    ]);

    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      value: class {
        observe(): void {}
        disconnect(): void {}
      },
    });
  });

  it("closes only saved tabs from the context menu", async () => {
    render(<TabBar />);

    fireEvent.contextMenu(screen.getByRole("tab", { name: /dirty\.txt/i }));
    await userEvent.click(await screen.findByText("Close saved tabs"));

    await waitFor(() => {
      expect(useTabStore.getState().tabs.map((tab) => tab.id)).toEqual([
        "dirty",
      ]);
    });
    expect(useCloseTabStore.getState().pendingTabId).toBeNull();
  });
});
