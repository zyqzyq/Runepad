// Runepad | Module: editor_keymap | Depends on: @codemirror/commands, @codemirror/view
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import type { KeyBinding } from "@codemirror/view";
import { openReplacePanel, toggleFindPanel } from "@/lib/editorSearch";

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
    key: "Mod-h",
    run: (view) => {
      openReplacePanel(view);
      return true;
    },
  },
];

export const editorKeymap: readonly KeyBinding[] = [
  ...searchKeymap,
  ...nativeEditKeymap,
  indentWithTab,
  ...defaultKeymap,
  ...historyKeymap,
];
