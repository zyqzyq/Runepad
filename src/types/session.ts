import type { LineEnding } from "@/types/tab";

export interface SessionTab {
  filepath: string | null;
  filename: string;
  isNew: boolean;
  encoding: string;
  lineEnding: LineEnding | string;
  language: string;
  content?: string;
  isDirty: boolean;
  diskModifiedMs?: number;
}

export interface SessionWindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

export interface SessionSnapshot {
  version: number;
  activeIndex: number;
  tabs: SessionTab[];
  explorerRoot: string | null;
  expandedPaths: string[];
  theme: string | null;
  sidebarCollapsed?: boolean;
  sidebarWidth?: number | null;
  windowState?: SessionWindowState | null;
}
