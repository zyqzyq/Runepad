import { render } from "@testing-library/react";
import type { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { editorInstances } from "@/lib/editorInstances";
import { useTabStore } from "@/stores/tabStore";

const editorSearch = vi.hoisted(() => ({
  toggleFindPanel: vi.fn(),
  openFindPanel: vi.fn(),
  openReplacePanel: vi.fn(),
  toggleReplacePanel: vi.fn(),
}));

const fileActions = vi.hoisted(() => ({
  newFile: vi.fn(),
  openFile: vi.fn(),
  saveFile: vi.fn(),
  closeActiveTab: vi.fn(),
}));

const explorerActions = vi.hoisted(() => ({
  openFolder: vi.fn(),
}));

vi.mock("@/hooks/useFileActions", () => ({
  useFileActions: () => fileActions,
}));

vi.mock("@/hooks/useExplorerActions", () => ({
  useExplorerActions: () => explorerActions,
}));

vi.mock("@/lib/editorSearch", () => ({
  toggleFindPanel: editorSearch.toggleFindPanel,
  openFindPanel: editorSearch.openFindPanel,
  openReplacePanel: editorSearch.openReplacePanel,
  toggleReplacePanel: editorSearch.toggleReplacePanel,
}));

function ShortcutHost(): null {
  useEditorShortcuts();
  return null;
}

function dispatchCtrlF(target: EventTarget): KeyboardEvent {
  return dispatchModKey(target, "f");
}

function dispatchModKey(
  target: EventTarget,
  key: string,
  options: { shiftKey?: boolean } = {},
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    key,
    shiftKey: options.shiftKey ?? false,
  });
  target.dispatchEvent(event);
  return event;
}

describe("useEditorShortcuts", () => {
  afterEach(() => {
    editorInstances.clear();
    fileActions.newFile.mockReset();
    fileActions.openFile.mockReset();
    fileActions.saveFile.mockReset();
    fileActions.closeActiveTab.mockReset();
    explorerActions.openFolder.mockReset();
    editorSearch.toggleFindPanel.mockReset();
    editorSearch.openFindPanel.mockReset();
    editorSearch.openReplacePanel.mockReset();
    editorSearch.toggleReplacePanel.mockReset();
  });

  test("opens files with Ctrl+O", () => {
    render(<ShortcutHost />);

    const event = dispatchModKey(window, "o");

    expect(event.defaultPrevented).toBe(true);
    expect(fileActions.openFile).toHaveBeenCalledTimes(1);
    expect(explorerActions.openFolder).not.toHaveBeenCalled();
  });

  test("opens folders with Ctrl+Shift+O", () => {
    render(<ShortcutHost />);

    const event = dispatchModKey(window, "o", { shiftKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(explorerActions.openFolder).toHaveBeenCalledTimes(1);
    expect(fileActions.openFile).not.toHaveBeenCalled();
  });

  test("lets CodeMirror handle Ctrl+F events that originate in the editor", () => {
    const activeId = useTabStore.getState().activeId;
    expect(activeId).not.toBeNull();
    editorInstances.set(activeId ?? "", {} as EditorView);
    render(<ShortcutHost />);

    const editor = document.createElement("div");
    editor.className = "cm-editor";
    document.body.appendChild(editor);

    const event = dispatchCtrlF(editor);

    expect(event.defaultPrevented).toBe(false);
    expect(editorSearch.toggleFindPanel).not.toHaveBeenCalled();

    editor.remove();
  });

  test("handles Ctrl+F globally outside CodeMirror", () => {
    const activeId = useTabStore.getState().activeId;
    expect(activeId).not.toBeNull();
    const view = {} as EditorView;
    editorInstances.set(activeId ?? "", view);
    render(<ShortcutHost />);

    const event = dispatchCtrlF(window);

    expect(event.defaultPrevented).toBe(true);
    expect(editorSearch.toggleFindPanel).toHaveBeenCalledWith(view);
    expect(editorSearch.openFindPanel).not.toHaveBeenCalled();
  });

  test("toggles replace globally with Ctrl+R", () => {
    const activeId = useTabStore.getState().activeId;
    expect(activeId).not.toBeNull();
    const view = {} as EditorView;
    editorInstances.set(activeId ?? "", view);
    render(<ShortcutHost />);

    const event = dispatchModKey(window, "r");

    expect(event.defaultPrevented).toBe(true);
    expect(editorSearch.toggleReplacePanel).toHaveBeenCalledWith(view);
    expect(editorSearch.openReplacePanel).not.toHaveBeenCalled();
  });

  test("does not use Ctrl+H for replace", () => {
    const activeId = useTabStore.getState().activeId;
    expect(activeId).not.toBeNull();
    editorInstances.set(activeId ?? "", {} as EditorView);
    render(<ShortcutHost />);

    const event = dispatchModKey(window, "h");

    expect(event.defaultPrevented).toBe(false);
    expect(editorSearch.openReplacePanel).not.toHaveBeenCalled();
  });
});
