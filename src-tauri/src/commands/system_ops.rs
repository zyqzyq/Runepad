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
            return Ok("dark".to_string());
        }
        return Ok("light".to_string());
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("light".to_string())
    }
}
