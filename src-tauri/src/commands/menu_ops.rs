// Runepad | Module: menu_ops | Depends on: tauri::AppHandle

use tauri::AppHandle;

#[tauri::command]
pub fn set_app_menu_locale(_app: AppHandle, _locale: String) -> Result<(), String> {
    Ok(())
}
