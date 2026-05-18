import { useTabStore } from "@/stores/tabStore";

/** Commit 8 placeholder — full tab interactions in Commit 10. */
export function TabBar(): JSX.Element {
  const tabs = useTabStore((s) => s.tabs);
  const activeId = useTabStore((s) => s.activeId);

  return (
    <div className="flex h-9 shrink-0 items-center border-b border-border bg-muted/20 px-2 text-xs text-muted-foreground">
      {tabs.length === 0 ? (
        <span>No tabs</span>
      ) : (
        tabs.map((tab) => (
          <span
            key={tab.id}
            className={tab.id === activeId ? "text-foreground" : undefined}
          >
            {tab.filename}
            {tab.id !== tabs[tabs.length - 1]?.id ? " · " : ""}
          </span>
        ))
      )}
    </div>
  );
}
