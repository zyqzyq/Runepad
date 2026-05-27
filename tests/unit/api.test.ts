import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readDir, syncWatchedDirs, unwatchDir } from "@/api/dirApi";
import {
  openDialog,
  openFolderDialog,
  getFileMetadata,
  readFile,
  saveDialog,
  writeFile,
} from "@/api/fileApi";
import { clearSession, loadSession, saveSession } from "@/api/sessionApi";
import type { SessionSnapshot } from "@/types/session";

const invokeMock = vi.mocked(invoke);
const openMock = vi.mocked(open);
const saveMock = vi.mocked(save);

describe("Tauri API wrappers", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    openMock.mockReset();
    saveMock.mockReset();
  });

  it("normalizes read_file line endings at the frontend boundary", async () => {
    invokeMock.mockResolvedValue({
      content: "hello",
      encoding: "UTF-8",
      lineEnding: "CRLF",
      modifiedMs: 1234,
    });

    await expect(readFile("C:/work/a.txt")).resolves.toEqual({
      content: "hello",
      encoding: "UTF-8",
      lineEnding: "CRLF",
      modifiedMs: 1234,
    });
    expect(invokeMock).toHaveBeenCalledWith("read_file", { path: "C:/work/a.txt" });
  });

  it("wraps file metadata", async () => {
    invokeMock.mockResolvedValue({ modifiedMs: 5678 });

    await expect(getFileMetadata("C:/work/a.txt")).resolves.toEqual({
      modifiedMs: 5678,
    });
    expect(invokeMock).toHaveBeenCalledWith("get_file_metadata", {
      path: "C:/work/a.txt",
    });
  });

  it("passes write_file encoding and line ending options", async () => {
    invokeMock.mockResolvedValue(undefined);

    await writeFile("C:/work/a.txt", "hello", {
      encoding: "GBK",
      lineEnding: "CRLF",
    });

    expect(invokeMock).toHaveBeenCalledWith("write_file", {
      path: "C:/work/a.txt",
      content: "hello",
      encoding: "GBK",
      lineEnding: "CRLF",
    });
  });

  it("wraps file and folder dialogs into string results", async () => {
    openMock.mockResolvedValueOnce(["C:/work/a.txt", "C:/work/b.txt"]);
    openMock.mockResolvedValueOnce("C:/work");
    saveMock.mockResolvedValue("C:/work/a.txt");

    await expect(openDialog({ multiple: true })).resolves.toEqual([
      "C:/work/a.txt",
      "C:/work/b.txt",
    ]);
    await expect(openFolderDialog()).resolves.toBe("C:/work");
    await expect(saveDialog({ defaultPath: "a.txt" })).resolves.toBe("C:/work/a.txt");
  });

  it("wraps directory and watch commands", async () => {
    invokeMock.mockResolvedValue([]);

    await readDir("C:/work");
    await syncWatchedDirs([{ path: "C:/work", recursive: true, isFile: false }]);
    await unwatchDir();

    expect(invokeMock).toHaveBeenNthCalledWith(1, "read_dir", { path: "C:/work" });
    expect(invokeMock).toHaveBeenNthCalledWith(2, "sync_watched_dirs", {
      targets: [{ path: "C:/work", recursive: true, isFile: false }],
    });
    expect(invokeMock).toHaveBeenNthCalledWith(3, "unwatch_dir");
  });

  it("wraps session persistence commands", async () => {
    const snapshot: SessionSnapshot = {
      version: 2,
      activeIndex: 0,
      tabs: [],
      explorerRoot: null,
      expandedPaths: [],
      theme: "system",
    };
    invokeMock.mockResolvedValueOnce(undefined);
    invokeMock.mockResolvedValueOnce(snapshot);
    invokeMock.mockResolvedValueOnce(undefined);

    await saveSession(snapshot);
    await expect(loadSession()).resolves.toBe(snapshot);
    await clearSession();

    expect(invokeMock).toHaveBeenNthCalledWith(1, "save_session", { session: snapshot });
    expect(invokeMock).toHaveBeenNthCalledWith(2, "load_session");
    expect(invokeMock).toHaveBeenNthCalledWith(3, "clear_session");
  });
});
