// Runepad | Module: editor_keymap | Depends on: @codemirror/commands, @codemirror/view
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
  toggleComment,
} from "@codemirror/commands";
import type { KeyBinding } from "@codemirror/view";
import { toggleFindPanel, toggleReplacePanel } from "@/lib/editorSearch";

type NativeEditCommand = "copy" | "cut" | "paste";

function runNativeEditCommand(command: NativeEditCommand): boolean {
  try {
    return document.execCommand(command);
  } catch {
    return false;
  }
}

const nativeEditKeymap: readonly KeyBinding[] = [
  { key: "Mod-x", run: () => runNativeEditCommand("cut") },
  { key: "Mod-c", run: () => runNativeEditCommand("copy") },
  { key: "Mod-v", run: () => runNativeEditCommand("paste") },
];

const searchKeymap: readonly KeyBinding[] = [
  { key: "Mod-f", run: toggleFindPanel },
  {
    key: "Mod-r",
    run: toggleReplacePanel,
  },
];

const commentKeymap: readonly KeyBinding[] = [
  { key: "Mod-/", run: toggleComment },
];

export const editorKeymap: readonly KeyBinding[] = [
  ...searchKeymap,
  ...commentKeymap,
  ...nativeEditKeymap,
  indentWithTab,
  ...defaultKeymap,
  ...historyKeymap,
];
