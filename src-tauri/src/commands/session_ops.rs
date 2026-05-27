// Runepad | Module: session_ops | Depends on: serde, tauri::Manager

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

const SESSION_FILE: &str = "session.json";
const SESSION_PREVIEW_FILE: &str = "session.preview.json";
const MAX_SESSION_BYTES: usize = 8 * 1024 * 1024;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionTab {
    pub filepath: Option<String>,
    pub filename: String,
    pub is_new: bool,
    pub encoding: String,
    pub line_ending: String,
    pub language: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(default)]
    pub is_dirty: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub disk_modified_ms: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionWindowState {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub maximized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionSnapshot {
    pub version: u32,
    pub active_index: usize,
    pub tabs: Vec<SessionTab>,
    pub explorer_root: Option<String>,
    pub expanded_paths: Vec<String>,
    pub theme: Option<String>,
    #[serde(default)]
    pub sidebar_collapsed: bool,
    pub sidebar_width: Option<u32>,
    pub window_state: Option<SessionWindowState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionTabPreview {
    pub filepath: Option<String>,
    pub filename: String,
    pub is_new: bool,
    pub encoding: String,
    pub line_ending: String,
    pub language: String,
    #[serde(default)]
    pub is_dirty: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub disk_modified_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionPreview {
    pub version: u32,
    pub active_index: usize,
    pub tabs: Vec<SessionTabPreview>,
    pub explorer_root: Option<String>,
    pub expanded_paths: Vec<String>,
    pub theme: Option<String>,
    #[serde(default)]
    pub sidebar_collapsed: bool,
    pub sidebar_width: Option<u32>,
    pub window_state: Option<SessionWindowState>,
}

impl From<SessionTabPreview> for SessionTab {
    fn from(tab: SessionTabPreview) -> Self {
        Self {
            filepath: tab.filepath,
            filename: tab.filename,
            is_new: tab.is_new,
            encoding: tab.encoding,
            line_ending: tab.line_ending,
            language: tab.language,
            content: None,
            is_dirty: tab.is_dirty,
            disk_modified_ms: tab.disk_modified_ms,
        }
    }
}

impl From<SessionPreview> for SessionSnapshot {
    fn from(session: SessionPreview) -> Self {
        Self {
            version: session.version,
            active_index: session.active_index,
            tabs: session.tabs.into_iter().map(SessionTab::from).collect(),
            explorer_root: session.explorer_root,
            expanded_paths: session.expanded_paths,
            theme: session.theme,
            sidebar_collapsed: session.sidebar_collapsed,
            sidebar_width: session.sidebar_width,
            window_state: session.window_state,
        }
    }
}

impl From<&SessionTab> for SessionTabPreview {
    fn from(tab: &SessionTab) -> Self {
        Self {
            filepath: tab.filepath.clone(),
            filename: tab.filename.clone(),
            is_new: tab.is_new,
            encoding: tab.encoding.clone(),
            line_ending: tab.line_ending.clone(),
            language: tab.language.clone(),
            is_dirty: tab.is_dirty,
            disk_modified_ms: tab.disk_modified_ms,
        }
    }
}

impl From<&SessionSnapshot> for SessionPreview {
    fn from(session: &SessionSnapshot) -> Self {
        Self {
            version: session.version,
            active_index: session.active_index,
            tabs: session.tabs.iter().map(SessionTabPreview::from).collect(),
            explorer_root: session.explorer_root.clone(),
            expanded_paths: session.expanded_paths.clone(),
            theme: session.theme.clone(),
            sidebar_collapsed: session.sidebar_collapsed,
            sidebar_width: session.sidebar_width,
            window_state: session.window_state.clone(),
        }
    }
}

// In-memory staging for session snapshots; flushed on app exit.
pub struct SessionCache(pub Mutex<Option<SessionSnapshot>>);

impl Default for SessionCache {
    fn default() -> Self {
        Self(Mutex::new(None))
    }
}

fn session_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data directory: {e}"))?;
    Ok(dir.join(SESSION_FILE))
}

fn session_preview_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data directory: {e}"))?;
    Ok(dir.join(SESSION_PREVIEW_FILE))
}

pub fn load_session_preview_window_state(app: &AppHandle) -> Option<SessionWindowState> {
    let path = session_preview_path(app).ok()?;
    let bytes = std::fs::read(path).ok()?;
    let session: SessionPreview = serde_json::from_slice(&bytes).ok()?;
    session.window_state
}

fn stage_session(cache: &SessionCache, session: &SessionSnapshot) -> Result<(), String> {
    let mut guard = cache
        .0
        .lock()
        .map_err(|e| format!("Session cache lock failed: {e}"))?;
    *guard = Some(session.clone());
    Ok(())
}

async fn write_session_to_disk(app: &AppHandle, session: &SessionSnapshot) -> Result<(), String> {
    let path = session_path(app)?;
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Cannot create session directory: {e}"))?;
    }
    let json = serde_json::to_string_pretty(session)
        .map_err(|e| format!("Failed to serialize session: {e}"))?;
    if json.len() > MAX_SESSION_BYTES {
        return Err(format!(
            "Session data is too large ({} MB max). Save large unsaved files to disk first.",
            MAX_SESSION_BYTES / (1024 * 1024)
        ));
    }
    tokio::fs::write(&path, json)
        .await
        .map_err(|e| format!("Failed to write session: {e}"))?;
    write_session_preview_to_disk(app, session).await?;
    Ok(())
}

async fn write_session_preview_to_disk(
    app: &AppHandle,
    session: &SessionSnapshot,
) -> Result<(), String> {
    let path = session_preview_path(app)?;
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Cannot create session directory: {e}"))?;
    }
    let preview = SessionPreview::from(session);
    let json = serde_json::to_string(&preview)
        .map_err(|e| format!("Failed to serialize session preview: {e}"))?;
    tokio::fs::write(&path, json)
        .await
        .map_err(|e| format!("Failed to write session preview: {e}"))?;
    Ok(())
}

// Flush the latest staged snapshot to disk (used on app exit).
pub fn flush_session_cache(app: &AppHandle, cache: &SessionCache) -> Result<(), String> {
    let session = {
        let guard = cache
            .0
            .lock()
            .map_err(|e| format!("Session cache lock failed: {e}"))?;
        guard.clone()
    };
    match session {
        Some(snapshot) => tauri::async_runtime::block_on(write_session_to_disk(app, &snapshot)),
        None => Ok(()),
    }
}

#[tauri::command]
pub async fn save_session(
    app: AppHandle,
    cache: tauri::State<'_, SessionCache>,
    session: SessionSnapshot,
) -> Result<(), String> {
    stage_session(&cache, &session)?;
    write_session_to_disk(&app, &session).await
}

#[tauri::command]
pub async fn load_session(app: AppHandle) -> Result<Option<SessionSnapshot>, String> {
    let path = session_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let bytes = tokio::fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read session: {e}"))?;
    let session: SessionSnapshot =
        serde_json::from_slice(&bytes).map_err(|e| format!("Failed to parse session: {e}"))?;
    let _ = write_session_preview_to_disk(&app, &session).await;
    Ok(Some(session))
}

#[tauri::command]
pub async fn load_session_preview(app: AppHandle) -> Result<Option<SessionSnapshot>, String> {
    let path = session_preview_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let bytes = tokio::fs::read(&path)
        .await
        .map_err(|e| format!("Failed to read session: {e}"))?;
    let session: SessionPreview =
        serde_json::from_slice(&bytes).map_err(|e| format!("Failed to parse session: {e}"))?;
    Ok(Some(session.into()))
}

#[tauri::command]
pub async fn clear_session(
    app: AppHandle,
    cache: tauri::State<'_, SessionCache>,
) -> Result<(), String> {
    {
        let mut guard = cache
            .0
            .lock()
            .map_err(|e| format!("Session cache lock failed: {e}"))?;
        *guard = None;
    }
    let path = session_path(&app)?;
    if path.exists() {
        tokio::fs::remove_file(&path)
            .await
            .map_err(|e| format!("Failed to remove session: {e}"))?;
    }
    let preview_path = session_preview_path(&app)?;
    if preview_path.exists() {
        tokio::fs::remove_file(&preview_path)
            .await
            .map_err(|e| format!("Failed to remove session preview: {e}"))?;
    }
    Ok(())
}

#[cfg(test)]
#[path = "tests/session_ops_tests.rs"]
mod tests;
