# Startup Performance

> Notes for release startup behavior and the session restore pipeline.

## Current Strategy

- The app renders a lightweight untitled tab immediately from `tabStore` initial state so the editor surface is visible before session IO finishes.
- `EditorPanel` stays lazy-loaded; `main.tsx` prefetches it after the first frame. This keeps CodeMirror out of the first paint path while making the real editor available shortly after.
- Session restore has two stages:
  - `load_session_preview` reads `session.preview.json`, which contains tab metadata, active index, explorer root/expanded paths, and theme, but no document content.
  - `load_session` reads the full `session.json` later to restore unsaved content.
- The explorer root and active tab content are prioritized after preview restore so the visible tree and active editor content appear before lower-priority session work.
- Settings/recent-files/dirty-close hosts are lazy-loaded and only mounted when opened.

## Important Constraints

- Do not call Rust IPC for system theme during startup. Use `window.matchMedia("(prefers-color-scheme: dark)")`; spawning `reg.exe` on Windows caused release startup to stall for about 6 seconds.
- Do not add synchronous startup logging on the IPC hot path. Temporary `startup.log` diagnostics helped locate the issue, but file writes and extra invokes can distort startup measurements.
- Keep `session.preview.json` small and free of document `content`. Full text belongs only in `session.json` when needed for dirty/new tabs.
- Avoid moving CodeMirror into the main startup bundle unless there is a measured reason; it increases the amount of JS parsed before the app shell can settle.

## Diagnostics

Use the browser Performance API helpers in `src/lib/startupPerf.ts` for ad-hoc investigation. In development they log to console. In release, enable console logging with:

```js
localStorage.setItem("runepad:startup-perf", "1")
```

Remove temporary file-based logging after diagnosis unless there is a product requirement for persistent telemetry.
