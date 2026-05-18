use std::path::{Path, PathBuf};

fn is_blocked_path(path: &Path) -> bool {
    let lossy = path.to_string_lossy().to_lowercase();
    if lossy.contains("src-tauri") {
        return true;
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(exe_dir) = exe.parent() {
            if path.starts_with(exe_dir) {
                return true;
            }
        }
    }
    false
}

/// Validate path for reading an existing file.
pub fn validate_user_path(path: &str) -> Result<PathBuf, String> {
    if path.contains("..") {
        return Err("Path traversal is not allowed.".to_string());
    }

    let input = Path::new(path);
    let canonical = input
        .canonicalize()
        .map_err(|e| format!("Invalid path: {e}"))?;

    if is_blocked_path(&canonical) {
        return Err("Access to this path is not allowed.".to_string());
    }

    Ok(canonical)
}

/// Validate path for writing (file may not exist yet).
pub fn validate_path_for_write(path: &str) -> Result<PathBuf, String> {
    if path.contains("..") {
        return Err("Path traversal is not allowed.".to_string());
    }

    let input = Path::new(path);
    let resolved = if input.exists() {
        input
            .canonicalize()
            .map_err(|e| format!("Invalid path: {e}"))?
    } else {
        let parent = input.parent().filter(|p| !p.as_os_str().is_empty());
        let file_name = input
            .file_name()
            .ok_or_else(|| "Invalid file name.".to_string())?;
        let parent_canonical = match parent {
            Some(p) => p
                .canonicalize()
                .map_err(|e| format!("Parent directory is invalid: {e}"))?,
            None => std::env::current_dir().map_err(|e| format!("Cannot resolve path: {e}"))?,
        };
        parent_canonical.join(file_name)
    };

    if is_blocked_path(&resolved) {
        return Err("Access to this path is not allowed.".to_string());
    }

    Ok(resolved)
}

pub fn detect_line_ending(content: &str) -> String {
    if content.contains("\r\n") {
        "CRLF".to_string()
    } else {
        "LF".to_string()
    }
}

pub fn normalize_line_endings(content: &str, line_ending: Option<&str>) -> String {
    match line_ending {
        Some("CRLF") => content.replace("\r\n", "\n").replace('\n', "\r\n"),
        _ => content.replace("\r\n", "\n"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;

    #[test]
    fn rejects_parent_traversal() {
        assert!(validate_user_path("../secret.txt").is_err());
    }

    #[test]
    fn detect_crlf() {
        assert_eq!(detect_line_ending("a\r\nb"), "CRLF");
        assert_eq!(detect_line_ending("a\nb"), "LF");
    }

    #[test]
    fn temp_file_roundtrip() {
        let dir = std::env::temp_dir();
        let file_path = dir.join(format!("runepad_test_{}.txt", std::process::id()));
        {
            let mut f = fs::File::create(&file_path).expect("create");
            writeln!(f, "hello").expect("write");
        }
        let read = validate_user_path(file_path.to_str().expect("utf8"));
        assert!(read.is_ok());
        let _ = fs::remove_file(file_path);
    }
}
