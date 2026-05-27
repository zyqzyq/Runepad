import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetStores, makeTab } from "../helpers/storeState";
import { FileChangeHost } from "@/components/layout/FileChangeHost";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import { useTabStore } from "@/stores/tabStore";

const reloadTabFromDisk = vi.fn(async () => true);

vi.mock("@/lib/reloadTabFromDisk", () => ({
  reloadTabFromDisk: (tab: unknown) => reloadTabFromDisk(tab),
}));

describe("FileChangeHost", () => {
  beforeEach(() => {
    resetStores([
      makeTab({
        id: "dirty",
        filename: "dirty.txt",
        filepath: "C:/work/dirty.txt",
        isDirty: true,
        isNew: false,
      }),
    ]);
    useFileChangeStore.setState({ pendingTabIds: ["dirty"] });
  });

  it("keeps current edits when cancelled", async () => {
    render(<FileChangeHost />);

    await userEvent.click(
      screen.getByRole("button", { name: "Keep current edits" }),
    );

    await waitFor(() => {
      expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
    });
    expect(reloadTabFromDisk).not.toHaveBeenCalled();
  });

  it("does not close when the editor-area backdrop is clicked", async () => {
    render(<FileChangeHost />);

    await userEvent.click(screen.getByTestId("file-change-backdrop"));

    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["dirty"]);
  });

  it("renders in place without a global dialog portal", () => {
    render(<FileChangeHost />);

    expect(document.querySelector("[data-base-ui-portal]")).toBeNull();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "false");
  });

  it("renders a visible editor-area mask behind the prompt", () => {
    render(<FileChangeHost />);

    expect(screen.getByTestId("file-change-backdrop")).toHaveClass(
      "bg-black/10",
    );
  });

  it("hides when the queued changed file is not the active tab", () => {
    resetStores([
      makeTab({
        id: "dirty",
        filename: "dirty.txt",
        filepath: "C:/work/dirty.txt",
        isDirty: true,
        isNew: false,
      }),
      makeTab({
        id: "other",
        filename: "other.txt",
        filepath: "C:/work/other.txt",
        isDirty: false,
        isNew: false,
      }),
    ]);
    useFileChangeStore.setState({ pendingTabIds: ["dirty"] });
    useTabStore.getState().setActiveTab("other");

    render(<FileChangeHost />);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useFileChangeStore.getState().pendingTabIds).toEqual(["dirty"]);
  });

  it("reloads from disk when discarding current edits", async () => {
    render(<FileChangeHost />);

    await userEvent.click(
      screen.getByRole("button", { name: "Discard and reload" }),
    );

    await waitFor(() => {
      expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
    });
    expect(reloadTabFromDisk).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dirty" }),
    );
  });

  it("skips a queued tab that was already closed", async () => {
    resetStores([]);
    useFileChangeStore.setState({ pendingTabIds: ["missing"] });

    render(<FileChangeHost />);

    await waitFor(() => {
      expect(useFileChangeStore.getState().pendingTabIds).toEqual([]);
    });
  });
});
