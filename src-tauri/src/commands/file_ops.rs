use serde::Serialize;

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

    let content = String::from_utf8(bytes).map_err(|_| {
        "File is not valid UTF-8. GBK support is planned for a later release.".to_string()
    })?;

    let line_ending = detect_line_ending(&content);
    Ok(ReadFileResult {
        content,
        encoding: "UTF-8".to_string(),
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
    if enc != "UTF-8" {
        return Err("Only UTF-8 encoding is supported in this version.".to_string());
    }

    let validated = validate_path_for_write(&path)?;
    let normalized = normalize_line_endings(&content, line_ending.as_deref());

    tokio::fs::write(&validated, normalized.as_bytes())
        .await
        .map_err(|e| format!("Failed to write file: {e}"))?;

    Ok(())
}
