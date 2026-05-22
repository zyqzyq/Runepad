#[tauri::command]
pub fn get_system_theme() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("reg")
            .args([
                "query",
                "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
                "/v",
                "AppsUseLightTheme",
            ])
            .output()
            .map_err(|e| format!("Failed to read system theme: {e}"))?;
        let stdout = String::from_utf8_lossy(&output.stdout);
        if stdout.contains("0x0") {
            Ok("dark".to_string())
        } else {
            Ok("light".to_string())
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("light".to_string())
    }
}

#[tauri::command]
pub fn get_launch_files() -> Result<Vec<String>, String> {
    let files = std::env::args_os()
        .skip(1)
        .filter(|arg| arg != "--open-with-runepad")
        .filter_map(|arg| {
            let path = std::path::PathBuf::from(arg);
            let canonical = path.canonicalize().ok()?;
            if canonical.is_file() {
                Some(canonical.to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect();

    Ok(files)
}
