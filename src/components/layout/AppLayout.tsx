import { EditorArea } from "@/components/editor/EditorArea";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TabBar } from "@/components/layout/TabBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAppMenu } from "@/hooks/useAppMenu";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";

export function AppLayout(): JSX.Element {
  useAppTheme();
  useAppMenu();
  useEditorShortcuts();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
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

