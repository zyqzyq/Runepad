// Runepad | Module: fileChangeDecision | Depends on: reloadTabFromDisk, stores

import { reloadTabFromDisk } from "@/lib/reloadTabFromDisk";
import { useFileChangeStore } from "@/stores/fileChangeStore";
import type { Tab } from "@/types/tab";

export async function handleChangedTabFromDisk(tab: Tab): Promise<void> {
  if (tab.isDirty) {
    useFileChangeStore.getState().enqueue(tab.id);
    return;
  }

  await reloadTabFromDisk(tab);
}
