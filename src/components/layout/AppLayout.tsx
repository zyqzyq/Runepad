import { EditorArea } from "@/components/editor/EditorArea";
import { CloseTabHost } from "@/components/layout/CloseTabHost";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TabBar } from "@/components/layout/TabBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAppMenu } from "@/hooks/useAppMenu";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useEditMenu } from "@/hooks/useEditMenu";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useDirWatcher } from "@/hooks/useDirWatcher";
import { useSessionRestore } from "@/hooks/useSessionRestore";
import { RecentFilesHost } from "@/components/layout/RecentFilesHost";
import { useExplorerStore } from "@/stores/explorerStore";

export function AppLayout(): JSX.Element {
  useAppTheme();
  useAppMenu();
  useEditMenu();
  useEditorShortcuts();
  useSessionRestore();
  useDirWatcher();
  const rootPath = useExplorerStore((s) => s.rootPath);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <CloseTabHost />
      <RecentFilesHost />
      {rootPath !== null && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center justify-end border-b border-border px-2">
          <ThemeToggle />
        </div>
        <TabBar />
        <EditorArea />
        <StatusBar />
      </div>
    </div>
  );
}

