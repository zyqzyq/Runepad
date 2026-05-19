import { EditorArea } from "@/components/editor/EditorArea";
import { CloseTabHost } from "@/components/layout/CloseTabHost";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TabBar } from "@/components/layout/TabBar";
import { SettingsHost } from "@/components/layout/SettingsHost";
import { useAppMenu } from "@/hooks/useAppMenu";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsMenu } from "@/hooks/useSettingsMenu";
import { useEditMenu } from "@/hooks/useEditMenu";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useDirWatcher } from "@/hooks/useDirWatcher";
import { useSessionRestore } from "@/hooks/useSessionRestore";
import { RecentFilesHost } from "@/components/layout/RecentFilesHost";
import { useExplorerStore } from "@/stores/explorerStore";

export function AppLayout(): JSX.Element {
  useAppTheme();
  useAppSettings();
  useAppMenu();
  useSettingsMenu();
  useEditMenu();
  useEditorShortcuts();
  useSessionRestore();
  useDirWatcher();
  const rootPath = useExplorerStore((s) => s.rootPath);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <CloseTabHost />
      <RecentFilesHost />
      <SettingsHost />
      {rootPath !== null && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TabBar />
        <EditorArea />
        <StatusBar />
      </div>
    </div>
  );
}

