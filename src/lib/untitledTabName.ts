import { getT } from "@/i18n";

/** Display name for a new unsaved tab (1-based counter from tabStore). */
export function untitledTabName(counter: number): string {
  const tr = getT();
  if (counter === 1) {
    return tr("tab.untitled");
  }
  return tr("tab.untitledN", { n: String(counter - 1) });
}
