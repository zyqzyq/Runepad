// Runepad | Module: file_ops | Depends on: serde, utils::encoding, utils::path

use serde::Serialize;

use crate::utils::encoding::{decode_file_content, encode_file_content};
use crate::utils::path::{
    detect_line_ending, normalize_line_endings, validate_path_for_write, validate_user_path,
};

const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadFileResult {
    pub content: String,
    pub encoding: String,
    pub line_ending: String,
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
