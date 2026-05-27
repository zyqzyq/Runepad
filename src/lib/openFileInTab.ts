// Runepad | Module: openFileInTab | Depends on: fileApi, stores, editor helpers

import { readFile } from "@/api/fileApi";
import { syncFileWatchesNow } from "@/hooks/useDirWatcher";
import { basename, languageFromFilename } from "@/lib/languageFromFilename";
import { normalizePath } from "@/lib/normalizePath";
import { pendingInitialDocs } from "@/lib/pendingDocs";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import { useRecentFilesStore } from "@/stores/recentFilesStore";
import { useTabStore } from "@/stores/tabStore";

export async function openFileInTab(path: string): Promise<void> {
  const { tabs, setActiveTab, addTabFromFile } = useTabStore.getState();
  const normalized = normalizePath(path);
  const existing = tabs.find(
    (t) => t.filepath && normalizePath(t.filepath) === normalized,
  );
  if (existing) {
    setActiveTab(existing.id);
    if (existing.isDirty) {
      useFileChangeStore.getState().enqueue(existing.id);
    }
    return;
  }

  const { content, encoding, lineEnding, modifiedMs } = await readFile(path);
  const filename = basename(path);
  const language = languageFromFilename(filename);
  const tabId = crypto.randomUUID();
  pendingInitialDocs.set(tabId, content);
  addTabFromFile({
    id: tabId,
    filepath: path,
    filename,
    encoding,
    lineEnding,
    language,
    diskModifiedMs: modifiedMs,
  });
  useRecentFilesStore.getState().push(path);
  syncFileWatchesNow();
}
