// Runepad | Module: dir_ops | Depends on: utils::path

use serde::Serialize;
use std::path::PathBuf;

use crate::utils::path::validate_user_path;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub is_file: bool,
    pub size: u64,
    pub modified_at: u64,
}

fn modified_at_unix(metadata: &std::fs::Metadata) -> u64 {
    metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn sort_entries(entries: &mut [DirEntry]) {
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
}

async fn read_dir_entries(dir: &PathBuf) -> Result<Vec<DirEntry>, String> {
    let mut entries: Vec<DirEntry> = Vec::new();
    let mut read_dir = tokio::fs::read_dir(dir)
        .await
        .map_err(|e| format!("Failed to read directory: {e}"))?;

    while let Ok(Some(entry)) = read_dir.next_entry().await {
        let path = entry.path();
        let metadata = match entry.metadata().await {
            Ok(m) => m,
            Err(_) => continue,
        };

        let name = entry
            .file_name()
            .to_string_lossy()
            .into_owned();

        let is_directory = metadata.is_dir();
        let is_file = metadata.is_file();
        let size = if is_file { metadata.len() } else { 0 };
        let modified_at = modified_at_unix(&metadata);

        entries.push(DirEntry {
            name,
            path: path.to_string_lossy().into_owned(),
            is_directory,
            is_file,
            size,
            modified_at,
        });
    }

    sort_entries(&mut entries);
    Ok(entries)
}

#[tauri::command]
pub async fn read_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let validated = validate_user_path(&path)?;
    let metadata = tokio::fs::metadata(&validated)
        .await
        .map_err(|e| format!("Cannot read directory metadata: {e}"))?;

    if !metadata.is_dir() {
        return Err("Path is not a directory.".to_string());
    }

    read_dir_entries(&validated).await
}
