mod commands;
mod menu;
mod utils;

use commands::dir_ops::read_dir;
use commands::file_ops::{read_file, write_file};
use commands::session_ops::{clear_session, load_session, save_session};
use commands::system_ops::get_system_theme;
use commands::watch_ops::{sync_watched_dirs, unwatch_dir, WatchState};
use menu::{
    init_app_menu, MENU_EDIT_ACTION_EVENT, MENU_EDIT_FIND, MENU_EDIT_REPLACE,
    MENU_FILE_ACTION_EVENT, MENU_FILE_CLOSE, MENU_FILE_CLOSE_FOLDER, MENU_FILE_NEW,
    MENU_FILE_OPEN, MENU_FILE_OPEN_FOLDER, MENU_FILE_RECENT, MENU_FILE_SAVE,
};
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(WatchState::default())
        .setup(|app| {
            init_app_menu(app)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if matches!(
                id,
                MENU_FILE_NEW
                    | MENU_FILE_OPEN
                    | MENU_FILE_RECENT
                    | MENU_FILE_OPEN_FOLDER
                    | MENU_FILE_CLOSE_FOLDER
                    | MENU_FILE_SAVE
                    | MENU_FILE_CLOSE
            ) {
                let _ = app.emit(MENU_FILE_ACTION_EVENT, id);
            } else if matches!(id, MENU_EDIT_FIND | MENU_EDIT_REPLACE) {
                let _ = app.emit(MENU_EDIT_ACTION_EVENT, id);
            }
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            get_system_theme,
            save_session,
            load_session,
            clear_session,
            sync_watched_dirs,
            unwatch_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
