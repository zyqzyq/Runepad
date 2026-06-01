import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(async () => vi.fn()),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

const mockCurrentWindow = {
  startDragging: vi.fn(async () => undefined),
  minimize: vi.fn(async () => undefined),
  toggleMaximize: vi.fn(async () => undefined),
  close: vi.fn(async () => undefined),
  isMaximized: vi.fn(async () => false),
  onMoved: vi.fn(async () => vi.fn()),
  onResized: vi.fn(async () => vi.fn()),
};

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => mockCurrentWindow,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
