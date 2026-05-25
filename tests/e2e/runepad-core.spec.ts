import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __runepadInvokes: Array<{ cmd: string; args: unknown }>;
  }
}

async function installTauriMocks(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "runepad:settings",
      JSON.stringify({
        editorFontFamily: '"Cascadia Mono", Consolas, "Courier New", monospace',
        editorFontSize: 14,
        locale: "en-US",
      }),
    );
    window.__runepadInvokes = [];

    const invoke = async (cmd: string, args?: unknown): Promise<unknown> => {
      window.__runepadInvokes.push({ cmd, args });
      if (cmd === "load_session" || cmd === "load_session_preview") return null;
      if (cmd === "get_launch_files") return [];
      if (cmd === "read_file") {
        return {
          content: "console.log('from disk');",
          encoding: "UTF-8",
          lineEnding: "LF",
        };
      }
      if (cmd.includes("dialog") && cmd.includes("open")) return "C:\\work\\sample.ts";
      if (cmd.includes("dialog") && cmd.includes("save")) return "C:\\work\\saved.txt";
      return undefined;
    };

    const callbacks = new Map<number, (payload: unknown) => void>();
    let nextCallbackId = 1;
    window.__TAURI_INTERNALS__ = {
      invoke,
      transformCallback: (callback: (payload: unknown) => void, once = false) => {
        const id = nextCallbackId++;
        callbacks.set(id, (payload: unknown) => {
          callback(payload);
          if (once) callbacks.delete(id);
        });
        return id;
      },
    };
  });
}

test.beforeEach(async ({ page }) => {
  await installTauriMocks(page);
});

test("new file editing opens the unsaved close prompt", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("button", { name: /New file/ }).click();
  await expect(page.getByText("Untitled-")).toBeVisible();

  await page.locator(".cm-content").click();
  await page.keyboard.type("hello from e2e");

  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("button", { name: /Close tab/ }).click();

  await expect(page.getByRole("dialog")).toContainText("Unsaved changes");
  await page.getByRole("button", { name: "Don't save" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("open existing file once and save edits through mocked IPC", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("button", { name: /Open file/ }).click();
  await expect(page.getByText("sample.ts")).toBeVisible();

  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("button", { name: /Open file/ }).click();
  await expect(page.getByText("sample.ts")).toHaveCount(1);

  await page.locator(".cm-content").click();
  await page.keyboard.type("\nconsole.log('edited');");
  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("button", { name: /Save/ }).click();

  const writeCall = await page.evaluate(() =>
    window.__runepadInvokes.find((call) => call.cmd === "write_file"),
  );
  expect(writeCall).toMatchObject({
    cmd: "write_file",
    args: {
      path: "C:\\work\\sample.ts",
      encoding: "UTF-8",
      lineEnding: "LF",
    },
  });
});
