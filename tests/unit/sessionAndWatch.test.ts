import { beforeEach, describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { resetStores, makeTab } from "../helpers/storeState";
import { buildSessionSnapshot } from "@/lib/buildSessionSnapshot";
import { collectWatchTargets } from "@/lib/collectWatchTargets";
import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { restoreSession } from "@/lib/restoreSession";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";
import type { SessionSnapshot } from "@/types/session";

function fakeEditorView(content: string): EditorView {
  return {
    state: EditorState.create({ doc: content }),
  } as unknown as EditorView;
}

describe("session and watch helpers", () => {
  beforeEach(() => {
    resetStores([
      makeTab({
        id: "tab-a",
        filename: "a.txt",
        filepath: "C:/work/a.txt",
        isDirty: true,
        isNew: false,
      }),
      makeTab({
        id: "tab-b",
        filename: "b.ts",
        filepath: "C:/work/b.ts",
        isDirty: false,
        isNew: false,
        language: "javascript",
      }),
    ]);
  });

  it("builds snapshots with cached content only when needed", () => {
    useTabStore.getState().setActiveTab("tab-b");
    useExplorerStore.getState().restoreExplorer("C:/work", ["C:/work/src"]);
    useUiStore.getState().setTheme("dark");
    useUiStore.getState().setSidebarCollapsed(true);
    useUiStore.getState().setSidebarWidth(320);
    editorInstances.set("tab-a", fakeEditorView("dirty text"));
    editorInstances.set("tab-b", fakeEditorView("clean text"));

    expect(
      buildSessionSnapshot({
        windowState: {
          x: 80,
          y: 60,
          width: 1200,
          height: 820,
          maximized: false,
        },
      }),
    ).toMatchObject({
      version: 2,
      activeIndex: 1,
      explorerRoot: "C:/work",
      expandedPaths: ["C:/work", "C:/work/src"],
      theme: "dark",
      sidebarCollapsed: true,
      sidebarWidth: 320,
      windowState: {
        x: 80,
        y: 60,
        width: 1200,
        height: 820,
        maximized: false,
      },
      tabs: [
        { filename: "a.txt", content: "dirty text", isDirty: true },
        { filename: "b.ts", content: undefined, isDirty: false },
      ],
    });
  });

  it("restores tabs, active tab, explorer, theme, and cached content", async () => {
    const snapshot: SessionSnapshot = {
      version: 2,
      activeIndex: 1,
      explorerRoot: "C:/project",
      expandedPaths: ["C:/project/src"],
      theme: "light",
      sidebarCollapsed: true,
      sidebarWidth: 340,
      windowState: {
        x: 40,
        y: 50,
        width: 1024,
        height: 768,
        maximized: true,
      },
      tabs: [
        {
          filepath: null,
          filename: "scratch.md",
          isNew: true,
          encoding: "UTF-8",
          lineEnding: "LF",
          language: "markdown",
          content: "# Draft",
          isDirty: true,
        },
        {
          filepath: "C:/project/app.ts",
          filename: "app.ts",
          isNew: false,
          encoding: "UTF-8",
          lineEnding: "LF",
          language: "plaintext",
          isDirty: false,
        },
      ],
    };

    await restoreSession(snapshot, {
      awaitActiveTabLoad: false,
      awaitExplorerRootLoad: false,
    });

    const state = useTabStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.activeId).toBe(state.tabs[1]?.id);
    expect(state.tabs[1]).toMatchObject({ language: "javascript" });
    expect(useExplorerStore.getState().rootPath).toBe("C:/project");
    expect(useExplorerStore.getState().isExpanded("C:/project/src")).toBe(true);
    expect(useUiStore.getState().theme).toBe("light");
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    expect(useUiStore.getState().sidebarWidth).toBe(340);
    expect(pendingInitialDocs.get(state.tabs[0]!.id)).toBe("# Draft");
  });

  it("restores session UI state even when no tabs were saved", async () => {
    const snapshot: SessionSnapshot = {
      version: 2,
      activeIndex: 0,
      explorerRoot: null,
      expandedPaths: [],
      theme: "dark",
      sidebarCollapsed: true,
      sidebarWidth: 300,
      windowState: {
        x: 20,
        y: 30,
        width: 900,
        height: 700,
        maximized: false,
      },
      tabs: [],
    };

    await restoreSession(snapshot, {
      awaitActiveTabLoad: false,
      awaitExplorerRootLoad: false,
    });

    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useUiStore.getState().theme).toBe("dark");
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    expect(useUiStore.getState().sidebarWidth).toBe(300);
  });

  it("collects explorer root and open file watches without duplicates", () => {
    useExplorerStore.getState().openRoot("C:/work");
    useTabStore.getState().addTabFromFile({
      id: "duplicate",
      filepath: "c:/WORK/a.txt",
      filename: "a.txt",
      encoding: "UTF-8",
      lineEnding: "LF",
      language: "plaintext",
    });

    expect(collectWatchTargets()).toEqual([
      { path: "C:/work", recursive: true, isFile: false },
      { path: "C:/work/a.txt", recursive: false, isFile: true },
      { path: "C:/work/b.ts", recursive: false, isFile: true },
    ]);
  });
});
