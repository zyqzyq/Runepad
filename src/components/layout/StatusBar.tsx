import { useEditorStore } from "@/stores/editorStore";
import { useTabStore } from "@/stores/tabStore";

export function StatusBar(): JSX.Element {
  const activeId = useTabStore((s) => s.activeId);
  const activeTab = useTabStore((s) =>
    s.tabs.find((t) => t.id === s.activeId),
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
      <span>
        Ln {line}, Col {col}
      </span>
      <span>
        {encoding} · {lineEnding} · {wordCount} words
      </span>
    </footer>
  );
}
