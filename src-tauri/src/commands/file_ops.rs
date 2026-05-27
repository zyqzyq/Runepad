// Runepad | Module: file_ops | Depends on: serde, utils::encoding, utils::path

use serde::Serialize;
use std::time::UNIX_EPOCH;

use crate::utils::encoding::{decode_file_content, encode_file_content};
use crate::utils::path::{
    detect_line_ending, normalize_line_endings, validate_path_for_write, validate_user_path,
};

const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadFileResult {
    pub content: String,
    pub encoding: String,
    pub line_ending: String,
    pub modified_ms: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadataResult {
    pub modified_ms: u64,
}

fn modified_ms(metadata: &std::fs::Metadata) -> Result<u64, String> {
    let modified = metadata
        .modified()
        .map_err(|e| format!("Cannot read file modified time: {e}"))?;
    let duration = modified
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("Invalid file modified time: {e}"))?;
    Ok(duration.as_millis().min(u128::from(u64::MAX)) as u64)
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<ReadFileResult, String> {
    let validated = validate_user_path(&path)?;
    let metadata = tokio::fs::metadata(&validated)
        .await
        .map_err(|e| format!("Cannot read file metadata: {e}"))?;

    if metadata.len() > MAX_FILE_SIZE {
        return Err("File is larger than 10MB and cannot be opened.".to_string());
    }

    let bytes = tokio::fs::read(&validated)
        .await
        .map_err(|e| format!("Failed to read file: {e}"))?;

    let (content, encoding) = decode_file_content(&bytes)?;
    let line_ending = detect_line_ending(&content);
    Ok(ReadFileResult {
        content,
        encoding,
        line_ending,
        modified_ms: modified_ms(&metadata)?,
    })
}

#[tauri::command]
pub async fn get_file_metadata(path: String) -> Result<FileMetadataResult, String> {
    let validated = validate_user_path(&path)?;
    let metadata = tokio::fs::metadata(&validated)
        .await
        .map_err(|e| format!("Cannot read file metadata: {e}"))?;

    Ok(FileMetadataResult {
        modified_ms: modified_ms(&metadata)?,
    })
}

#[tauri::command]
pub async fn write_file(
    path: String,
    content: String,
    encoding: Option<String>,
    line_ending: Option<String>,
) -> Result<(), String> {
    let enc = encoding.unwrap_or_else(|| "UTF-8".to_string());
    let validated = validate_path_for_write(&path)?;
    let normalized = normalize_line_endings(&content, line_ending.as_deref());
    let bytes = encode_file_content(&normalized, &enc)?;

    tokio::fs::write(&validated, bytes)
        .await
        .map_err(|e| format!("Failed to write file: {e}"))?;

    Ok(())
}

#[cfg(test)]
#[path = "tests/file_ops_tests.rs"]
mod tests;
