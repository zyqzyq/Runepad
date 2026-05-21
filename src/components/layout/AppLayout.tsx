import { lazy, Suspense, useEffect } from "react";
import { EditorArea } from "@/components/editor/EditorArea";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TabBar } from "@/components/layout/TabBar";
import { useAppMenu } from "@/hooks/useAppMenu";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsMenu } from "@/hooks/useSettingsMenu";
import { useEditMenu } from "@/hooks/useEditMenu";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useDirWatcher } from "@/hooks/useDirWatcher";
import { useSessionRestore } from "@/hooks/useSessionRestore";
import { useCloseTabStore } from "@/stores/closeTabStore";
import { useExplorerStore } from "@/stores/explorerStore";
import { useUiStore } from "@/stores/uiStore";
import { startupMeasure } from "@/lib/startupPerf";

const CloseTabHost = lazy(() =>
  import("@/components/layout/CloseTabHost").then((module) => ({
    default: module.CloseTabHost,
  })),
);
const RecentFilesHost = lazy(() =>
  import("@/components/layout/RecentFilesHost").then((module) => ({
    default: module.RecentFilesHost,
  })),
);
const SettingsHost = lazy(() =>
  import("@/components/layout/SettingsHost").then((module) => ({
    default: module.SettingsHost,
  })),
);

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
  const pendingTabId = useCloseTabStore((s) => s.pendingTabId);
  const recentFilesOpen = useUiStore((s) => s.recentFilesOpen);
  const settingsOpen = useUiStore((s) => s.settingsOpen);

  useEffect(() => {
    startupMeasure("app-layout-mounted", "start");
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Suspense fallback={null}>
        {pendingTabId !== null && <CloseTabHost />}
        {recentFilesOpen && <RecentFilesHost />}
        {settingsOpen && <SettingsHost />}
      </Suspense>
      {rootPath !== null && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TabBar />
        <EditorArea />
        <StatusBar />
      </div>
    </div>
  );
}

