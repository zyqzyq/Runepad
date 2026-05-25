// Runepad | Module: editor_keymap | Depends on: @codemirror/commands, @codemirror/view
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import type { KeyBinding } from "@codemirror/view";

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

export const editorKeymap: readonly KeyBinding[] = [
  ...nativeEditKeymap,
  indentWithTab,
  ...defaultKeymap,
  ...historyKeymap,
];
