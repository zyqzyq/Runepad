import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Minus,
  PanelLeft,
  Settings,
  Square,
  SquareStack,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useExplorerActions } from "@/hooks/useExplorerActions";
import { useFileActions } from "@/hooks/useFileActions";
import { useI18n } from "@/i18n";
import { openFindPanel, openReplacePanel } from "@/lib/editorSearch";
import { cn } from "@/lib/utils";
import { editorInstances } from "@/lib/editorInstances";
import { useExplorerStore } from "@/stores/explorerStore";
import { useTabStore } from "@/stores/tabStore";
import { useUiStore } from "@/stores/uiStore";

type AppMenuId = "file" | "edit";

interface MenuAction {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface HeaderIconButtonProps {
  label: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function HeaderIconButton({
  label,
  className,
  disabled = false,
  onClick,
  children,
}: HeaderIconButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-8 rounded-none text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children}
    </Button>
  );
}

function MenuDropdown({
  label,
  menuId,
  activeMenu,
  actions,
  onOpen,
  onClose,
}: {
  label: string;
  menuId: AppMenuId;
  activeMenu: AppMenuId | null;
  actions: readonly MenuAction[];
  onOpen: (menuId: AppMenuId) => void;
  onClose: () => void;
}): JSX.Element {
  const isOpen = activeMenu === menuId;

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "h-8 rounded px-3 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground",
        )}
        onClick={() => (isOpen ? onClose() : onOpen(menuId))}
        onMouseEnter={() => {
          if (activeMenu !== null) onOpen(menuId);
        }}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-[1000] mt-1 min-w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-foreground/5">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              className="flex h-8 w-full items-center justify-between gap-6 rounded px-2 text-left text-xs hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-45"
              onClick={() => {
                action.onSelect();
                onClose();
              }}
            >
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="text-[11px] text-muted-foreground">
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function runWindowAction(action: () => Promise<void>): void {
  void action().catch(() => {
    // Browser preview cannot access Tauri window APIs.
  });
}

function isMacPlatform(): boolean {
  return navigator.platform.toUpperCase().includes("MAC");
}

export function AppHeader(): JSX.Element {
  const { t } = useI18n();
  const headerRef = useRef<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState<AppMenuId | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const isMac = isMacPlatform();
  const fileActions = useFileActions();
  const explorerActions = useExplorerActions();
  const rootPath = useExplorerStore((s) => s.rootPath);
  const activeId = useTabStore((s) => s.activeId);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setRecentFilesOpen = useUiStore((s) => s.setRecentFilesOpen);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const refreshMaximizedState = useCallback((): void => {
    void getCurrentWindow()
      .isMaximized()
      .then(setIsMaximized)
      .catch(() => {
        // Browser preview cannot access Tauri window APIs.
      });
  }, []);

  useEffect(() => {
    let disposed = false;
    let unlistenMoved: (() => void) | undefined;
    let unlistenResized: (() => void) | undefined;
    const win = getCurrentWindow();
    const refresh = (): void => {
      void win
        .isMaximized()
        .then((nextMaximized) => {
          if (!disposed) setIsMaximized(nextMaximized);
        })
        .catch(() => {
          // Browser preview cannot access Tauri window APIs.
        });
    };

    refresh();
    void win
      .onMoved(refresh)
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          unlistenMoved = unlisten;
        }
      })
      .catch(() => {
        // Browser preview cannot access Tauri window APIs.
      });
    void win
      .onResized(refresh)
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          unlistenResized = unlisten;
        }
      })
      .catch(() => {
        // Browser preview cannot access Tauri window APIs.
      });

    return () => {
      disposed = true;
      unlistenMoved?.();
      unlistenResized?.();
    };
  }, []);

  const toggleMaximized = useCallback((): void => {
    void getCurrentWindow()
      .toggleMaximize()
      .then(refreshMaximizedState)
      .catch(() => {
        // Browser preview cannot access Tauri window APIs.
      });
  }, [refreshMaximizedState]);

  const openFind = (): void => {
    const view = activeId ? editorInstances.get(activeId) : undefined;
    if (view) openFindPanel(view);
  };

  const openReplace = (): void => {
    const view = activeId ? editorInstances.get(activeId) : undefined;
    if (view) openReplacePanel(view);
  };

  const menus: Record<AppMenuId, readonly MenuAction[]> = {
    file: [
      { label: t("header.newFile"), shortcut: "Ctrl+N", onSelect: fileActions.newFile },
      {
        label: t("header.openFile"),
        shortcut: "Ctrl+O",
        onSelect: () => {
          void fileActions.openFile();
        },
      },
      {
        label: t("header.recentFiles"),
        onSelect: () => setRecentFilesOpen(true),
      },
      {
        label: t("header.openFolder"),
        shortcut: "Ctrl+Shift+O",
        onSelect: () => {
          void explorerActions.openFolder();
        },
      },
      {
        label: t("header.saveFile"),
        shortcut: "Ctrl+S",
        disabled: activeId === null,
        onSelect: () => {
          void fileActions.saveFile();
        },
      },
      {
        label: t("header.closeTab"),
        shortcut: "Ctrl+W",
        disabled: activeId === null,
        onSelect: fileActions.closeActiveTab,
      },
      {
        label: t("header.closeFolder"),
        disabled: rootPath === null,
        onSelect: explorerActions.closeFolder,
      },
    ],
    edit: [
      {
        label: t("header.find"),
        shortcut: "Ctrl+F",
        disabled: activeId === null,
        onSelect: openFind,
      },
      {
        label: t("header.replace"),
        shortcut: "Ctrl+R",
        disabled: activeId === null,
        onSelect: openReplace,
      },
    ],
  };

  return (
    <header
      ref={headerRef}
      className="relative z-[1000] flex h-9 shrink-0 items-center justify-between bg-muted/70"
    >
      <div className={cn("flex min-w-0 items-center", isMac && "pl-[76px]")}>
        {rootPath !== null && (
          <HeaderIconButton
            label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </HeaderIconButton>
        )}

        <nav className="ml-1 flex min-w-0 items-center">
          <MenuDropdown
            label={t("header.menu.file")}
            menuId="file"
            activeMenu={activeMenu}
            actions={menus.file}
            onOpen={setActiveMenu}
            onClose={() => setActiveMenu(null)}
          />
          <MenuDropdown
            label={t("header.menu.edit")}
            menuId="edit"
            activeMenu={activeMenu}
            actions={menus.edit}
            onOpen={setActiveMenu}
            onClose={() => setActiveMenu(null)}
          />
        </nav>
      </div>

      <div
        className="h-full min-w-8 flex-1"
        onMouseDown={(event) => {
          if (event.button !== 0) return;

          if (event.detail === 2) {
            toggleMaximized();
          } else if (event.detail === 1) {
            runWindowAction(() => getCurrentWindow().startDragging());
          }
        }}
      />

      <div className="flex h-full shrink-0 items-center">
        <HeaderIconButton
          label={t("header.settings")}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </HeaderIconButton>
        {!isMac && (
          <>
            <HeaderIconButton
              label={t("header.minimize")}
              onClick={() => runWindowAction(() => getCurrentWindow().minimize())}
            >
              <Minus className="h-4 w-4" />
            </HeaderIconButton>
            <HeaderIconButton
              label={isMaximized ? t("header.restore") : t("header.maximize")}
              onClick={toggleMaximized}
            >
              {isMaximized ? (
                <SquareStack className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </HeaderIconButton>
            <HeaderIconButton
              label={t("header.closeWindow")}
              className="hover:bg-destructive hover:text-white"
              onClick={() => runWindowAction(() => getCurrentWindow().close())}
            >
              <X className="h-4 w-4" />
            </HeaderIconButton>
          </>
        )}
      </div>
    </header>
  );
}
