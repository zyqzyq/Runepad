import { lazy, Suspense, useEffect } from "react";
import { EditorArea } from "@/components/editor/EditorArea";
import { AppHeader } from "@/components/layout/AppHeader";
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
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Suspense fallback={null}>
        {pendingTabId !== null && <CloseTabHost />}
        {recentFilesOpen && <RecentFilesHost />}
        {settingsOpen && <SettingsHost />}
      </Suspense>
      <AppHeader />
      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 bg-muted/80">
        {rootPath !== null && <Sidebar />}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-xl bg-background ring-1 ring-foreground/8 shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_12%,transparent)] dark:ring-foreground/10">
          <TabBar />
          <EditorArea />
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

