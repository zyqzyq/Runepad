// Runepad | Module: startupPerf | Depends on: none

const LOG_KEY = "runepad:startup-perf";

function shouldLog(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem(LOG_KEY) === "1";
  } catch {
    return false;
  }
}

/** Marks a startup milestone (Performance API; cheap in production). */
export function startupMark(name: string): void {
  try {
    performance.mark(`runepad:${name}`);
  } catch {
    // ignore
  }
}

export function startupEvent(name: string, detail?: string): void {
  if (shouldLog()) {
    console.info(`[startup] ${name}${detail ? ` ${detail}` : ""}`);
  }
}

/** Measures from `runepad:start` or a prior mark to `runepad:${name}`. */
export function startupMeasure(name: string, startMark = "start"): void {
  const end = `runepad:${name}`;
  const start = `runepad:${startMark}`;
  try {
    performance.mark(end);
    performance.measure(`runepad:${name}`, start, end);
    const entries = performance.getEntriesByName(`runepad:${name}`, "measure");
    const last = entries[entries.length - 1];
    if (last) {
      if (shouldLog()) {
        console.info(`[startup] ${name}: ${last.duration.toFixed(1)}ms`);
      }
    }
  } catch {
    // ignore missing marks
  }
}
