// Runepad | Module: fileApi | Depends on: @tauri-apps/api, plugin-dialog

import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { LineEnding } from "@/types/tab";

export interface ReadFileResponse {
  content: string;
  encoding: string;
  lineEnding: LineEnding;
}

export async function readFile(path: string): Promise<ReadFileResponse> {
  const result = await invoke<{
    content: string;
    encoding: string;
    lineEnding: string;
  }>("read_file", { path });

  return {
    content: result.content,
    encoding: result.encoding,
    lineEnding: result.lineEnding === "CRLF" ? "CRLF" : "LF",
  };
}

export async function writeFile(
  path: string,
  content: string,
  options?: { encoding?: string; lineEnding?: LineEnding },
): Promise<void> {
  await invoke("write_file", {
    path,
    content,
    encoding: options?.encoding ?? "UTF-8",
    lineEnding: options?.lineEnding,
  });
}

export async function openDialog(options?: {
  multiple?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | string[] | null> {
  const selected = await open({
    multiple: options?.multiple ?? false,
    filters: options?.filters,
  });
  if (selected === null) return null;
  if (Array.isArray(selected)) return selected.map(String);
  return String(selected);
}

export async function saveDialog(options?: {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | null> {
  const selected = await save({
    defaultPath: options?.defaultPath,
    filters: options?.filters,
  });
  if (selected === null) return null;
  return String(selected);
}
