mod commands;
mod menu;
mod utils;

use commands::file_ops::{read_file, write_file};
use commands::system_ops::get_system_theme;
use menu::{
    init_app_menu, MENU_FILE_ACTION_EVENT, MENU_FILE_CLOSE, MENU_FILE_NEW, MENU_FILE_OPEN,
    MENU_FILE_SAVE,
};
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            init_app_menu(app)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if matches!(
                id,
                MENU_FILE_NEW | MENU_FILE_OPEN | MENU_FILE_SAVE | MENU_FILE_CLOSE
            ) {
                let _ = app.emit(MENU_FILE_ACTION_EVENT, id);
            }
        })
        .invoke_handler(tauri::generate_handler![read_file, write_file, get_system_theme])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
