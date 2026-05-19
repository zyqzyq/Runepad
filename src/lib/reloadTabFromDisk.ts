import { readFile } from "@/api/fileApi";
import { languageFromFilename } from "@/lib/languageFromFilename";
import { setEditorContent } from "@/lib/setEditorContent";
import { useTabStore } from "@/stores/tabStore";
import type { Tab } from "@/types/tab";
import { toast } from "sonner";
import { getT } from "@/i18n";

export async function reloadTabFromDisk(tab: Tab): Promise<boolean> {
  if (!tab.filepath) return false;
  try {
    const { content, encoding, lineEnding } = await readFile(tab.filepath);
    useTabStore.getState().updateTab(tab.id, {
      encoding,
      lineEnding,
      language: languageFromFilename(tab.filename),
      isDirty: false,
    });
    setEditorContent(tab.id, content);
    useTabStore.getState().markDirty(tab.id, false);
    return true;
  } catch (e) {
    toast.error(
      getT()("toast.reloadFailed", {
        filename: tab.filename,
        message: e instanceof Error ? e.message : String(e),
      }),
    );
    return false;
  }
}
