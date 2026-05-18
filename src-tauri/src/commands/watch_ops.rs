// Runepad | Module: watch_ops | Depends on: notify, utils::path, tauri

use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

use crate::utils::path::validate_user_path;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirChangedPayload {
    pub kind: String,
    pub path: String,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct WatchTarget {
    pub path: String,
    pub recursive: bool,
    #[serde(default)]
    pub is_file: bool,
}

#[derive(Clone, PartialEq, Eq, Hash)]
struct WatchSpec {
    path: PathBuf,
    is_file: bool,
    recursive: bool,
}

pub struct WatchState {
    inner: Mutex<WatchInner>,
}

struct WatchInner {
    watcher: Option<RecommendedWatcher>,
    active: Vec<WatchSpec>,
}

impl Default for WatchState {
    fn default() -> Self {
        Self {
            inner: Mutex::new(WatchInner {
                watcher: None,
                active: Vec::new(),
            }),
        }
    }
}

fn event_kind_label(kind: &EventKind) -> &'static str {
    match kind {
        EventKind::Create(_) => "create",
        EventKind::Modify(_) => "modify",
        EventKind::Remove(_) => "remove",
        EventKind::Any => "modify",
        EventKind::Access(_) => "modify",
        EventKind::Other => "rename",
    }
}

fn should_emit_event(kind: &EventKind) -> bool {
    !matches!(kind, EventKind::Access(_) | EventKind::Any)
}

fn stop_watching(inner: &mut WatchInner) {
    inner.watcher = None;
    inner.active.clear();
}

fn resolve_watch_spec(target: &WatchTarget) -> Result<WatchSpec, String> {
    let validated = validate_user_path(&target.path)?;
    let metadata = std::fs::metadata(&validated)
        .map_err(|e| format!("Cannot read path metadata: {e}"))?;

    if target.is_file {
        if !metadata.is_file() {
            return Err(format!("{} is not a file.", target.path));
        }
        return Ok(WatchSpec {
            path: validated,
            is_file: true,
            recursive: false,
        });
    }

    if metadata.is_file() {
        return Ok(WatchSpec {
            path: validated,
            is_file: true,
            recursive: false,
        });
    }

    if metadata.is_dir() {
        return Ok(WatchSpec {
            path: validated,
            is_file: false,
            recursive: target.recursive,
        });
    }

    Err(format!("{} is not a file or directory.", target.path))
}

fn start_watcher(
    specs: &[WatchSpec],
    app: &AppHandle,
) -> Result<RecommendedWatcher, String> {
    let app_handle = app.clone();
    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            let event = match res {
                Ok(e) => e,
                Err(_) => return,
            };
            if !should_emit_event(&event.kind) {
                return;
            }
            let kind = event_kind_label(&event.kind).to_string();
            for changed in event.paths {
                let path_str = changed.to_string_lossy().into_owned();
                let payload = DirChangedPayload {
                    kind: kind.clone(),
                    path: path_str,
                };
                let _ = app_handle.emit("dir-changed", payload);
            }
        },
        Config::default(),
    )
    .map_err(|e| format!("Failed to start directory watcher: {e}"))?;

    for spec in specs {
        let mode = if spec.is_file {
            RecursiveMode::NonRecursive
        } else if spec.recursive {
            RecursiveMode::Recursive
        } else {
            RecursiveMode::NonRecursive
        };
        watcher
            .watch(&spec.path, mode)
            .map_err(|e| format!("Failed to watch {}: {e}", spec.path.display()))?;
    }

    Ok(watcher)
}

#[tauri::command]
pub async fn sync_watched_dirs(
    targets: Vec<WatchTarget>,
    app: AppHandle,
    state: State<'_, WatchState>,
) -> Result<(), String> {
    let mut desired: Vec<WatchSpec> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for target in targets {
        let spec = resolve_watch_spec(&target)?;
        let key = (
            spec.path.to_string_lossy().into_owned(),
            spec.is_file,
            spec.recursive,
        );
        if seen.insert(key) {
            desired.push(spec);
        }
    }

    desired.sort_by(|a, b| a.path.cmp(&b.path));

    let mut inner = state
        .inner
        .lock()
        .map_err(|_| "Directory watcher is busy.".to_string())?;

    let mut current = inner.active.clone();
    current.sort_by(|a, b| a.path.cmp(&b.path));

    if desired == current {
        return Ok(());
    }

    stop_watching(&mut inner);

    if desired.is_empty() {
        return Ok(());
    }

    let watcher = start_watcher(&desired, &app)?;
    inner.active = desired;
    inner.watcher = Some(watcher);
    Ok(())
}

#[tauri::command]
pub async fn unwatch_dir(state: State<'_, WatchState>) -> Result<(), String> {
    let mut inner = state
        .inner
        .lock()
        .map_err(|_| "Directory watcher is busy.".to_string())?;
    stop_watching(&mut inner);
    Ok(())
}
