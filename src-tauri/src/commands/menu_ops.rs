// Runepad | Module: menu_ops | Depends on: crate::menu

use crate::menu;
use tauri::AppHandle;

#[tauri::command]
pub fn set_app_menu_locale(app: AppHandle, locale: String) -> Result<(), String> {
    let menu = menu::build_app_menu(&app, &locale).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}
