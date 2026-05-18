// Runepad | Module: session_ops | Depends on: serde, tauri::Manager

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const SESSION_FILE: &str = "session.json";
const MAX_SESSION_BYTES: usize = 8 * 1024 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
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
}

fn session_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data directory: {e}"))?;
    Ok(dir.join(SESSION_FILE))
}

#[tauri::command]
pub async fn save_session(app: AppHandle, session: SessionSnapshot) -> Result<(), String> {
    let path = session_path(&app)?;
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Cannot create session directory: {e}"))?;
    }
    let json = serde_json::to_string_pretty(&session)
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
    Ok(())
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
    let session: SessionSnapshot = serde_json::from_slice(&bytes)
        .map_err(|e| format!("Failed to parse session: {e}"))?;
    Ok(Some(session))
}

#[tauri::command]
pub async fn clear_session(app: AppHandle) -> Result<(), String> {
    let path = session_path(&app)?;
    if path.exists() {
        tokio::fs::remove_file(&path)
            .await
            .map_err(|e| format!("Failed to remove session: {e}"))?;
    }
    Ok(())
}
