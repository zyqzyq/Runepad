import { readFile } from "@/api/fileApi";
import { languageFromFilename } from "@/lib/languageFromFilename";
import { setEditorContent } from "@/lib/setEditorContent";
import { startupEvent, startupMark, startupMeasure } from "@/lib/startupPerf";
import { useTabStore } from "@/stores/tabStore";
import type { Tab } from "@/types/tab";
import { toast } from "sonner";
import { getT } from "@/i18n";

interface LoadTabContentOptions {
  showErrorToast?: boolean;
}

export async function loadTabContentFromDisk(
  tab: Tab,
  options: LoadTabContentOptions = {},
): Promise<boolean> {
  const { showErrorToast = true } = options;
  if (!tab.filepath) return false;
  const mark = `tab-content-load-start-${tab.id}`;
  startupMark(mark);
  startupEvent("tab-content-load-start", `filename=${tab.filename}`);
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
    startupMeasure(`tab-content-load:${tab.filename}`, mark);
    startupEvent(
      "tab-content-load-end",
      `filename=${tab.filename} chars=${content.length}`,
    );
    return true;
  } catch (e) {
    if (showErrorToast) {
      toast.error(
        getT()("toast.reloadFailed", {
          filename: tab.filename,
          message: e instanceof Error ? e.message : String(e),
        }),
      );
    }
    startupMeasure(`tab-content-load-failed:${tab.filename}`, mark);
    return false;
  }
}

export async function reloadTabFromDisk(tab: Tab): Promise<boolean> {
  return loadTabContentFromDisk(tab);
}
