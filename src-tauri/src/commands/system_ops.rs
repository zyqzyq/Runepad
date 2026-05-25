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
