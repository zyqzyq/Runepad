import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/layout/AppHeader";
import { resetStores } from "../helpers/storeState";

type WindowMock = {
  toggleMaximize: ReturnType<typeof vi.fn>;
  isMaximized: ReturnType<typeof vi.fn>;
};

function currentWindowMock(): WindowMock {
  return getCurrentWindow() as unknown as WindowMock;
}

describe("AppHeader", () => {
  beforeEach(() => {
    resetStores([]);
    currentWindowMock().isMaximized.mockResolvedValue(false);
    currentWindowMock().toggleMaximize.mockResolvedValue(undefined);
  });

  it("uses a restore control when the window is maximized", async () => {
    let maximized = true;
    const win = currentWindowMock();
    win.isMaximized.mockImplementation(async () => maximized);
    win.toggleMaximize.mockImplementation(async () => {
      maximized = !maximized;
    });

    render(<AppHeader />);

    expect(
      await screen.findByRole("button", { name: "Restore" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Restore" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Maximize" })).toBeInTheDocument();
    });
    expect(win.toggleMaximize).toHaveBeenCalledTimes(1);
  });

  it("exposes menu open state to assistive technology", async () => {
    render(<AppHeader />);

    const fileMenu = screen.getByRole("button", { name: "File" });
    expect(fileMenu).toHaveAttribute("aria-haspopup", "menu");
    expect(fileMenu).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(fileMenu);

    expect(fileMenu).toHaveAttribute("aria-expanded", "true");
  });
});
