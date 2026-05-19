import { useI18n } from "@/i18n";
import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

export function StatusBar(): JSX.Element {
  const { t } = useI18n();
  const activeId = useTabStore((s) => s.activeId);
  const activeTab = useTabStore((s) =>
    s.tabs.find((tab) => tab.id === s.activeId),
  );
  const meta = useEditorStore((s) =>
    activeId ? s.metaByDocId[activeId] : undefined,
  );

  const line = meta?.cursorPos.line ?? 1;
  const col = meta?.cursorPos.col ?? 1;
  const wordCount = meta?.wordCount ?? 0;
  const encoding = activeTab?.encoding ?? "UTF-8";
  const lineEnding = activeTab?.lineEnding ?? "LF";

  return (
    <footer className="flex h-[22px] shrink-0 items-center justify-between border-t border-border bg-muted/30 px-2 text-[12px] text-muted-foreground">
      <span>{t("status.lineCol", { line: String(line), col: String(col) })}</span>
      <span>
        {encoding} · {lineEnding} ·{" "}
        {t("status.words", { count: String(wordCount) })}
      </span>
    </footer>
  );
}
