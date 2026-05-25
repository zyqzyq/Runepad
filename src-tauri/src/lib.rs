mod commands;
mod menu;
mod utils;

use commands::dir_ops::read_dir;
use commands::menu_ops::set_app_menu_locale;
use commands::file_ops::{read_file, write_file};
use commands::session_ops::{
    clear_session, flush_session_cache, load_session, load_session_preview, save_session,
    SessionCache,
};
use commands::system_ops::get_launch_files;
use commands::watch_ops::{sync_watched_dirs, unwatch_dir, WatchState};
use commands::window_ops::{finish_window_close, WINDOW_CLOSING_EVENT};
use menu::{
    MENU_APP_ACTION_EVENT, MENU_APP_SETTINGS, MENU_EDIT_ACTION_EVENT, MENU_EDIT_FIND,
    MENU_EDIT_REPLACE, MENU_FILE_ACTION_EVENT, MENU_FILE_CLOSE, MENU_FILE_CLOSE_FOLDER,
    MENU_FILE_NEW, MENU_FILE_OPEN, MENU_FILE_OPEN_FOLDER, MENU_FILE_RECENT, MENU_FILE_SAVE,
};
use tauri::{Emitter, Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(WatchState::default())
        .manage(SessionCache::default())
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.emit(WINDOW_CLOSING_EVENT, ());
            }
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
            } else if id == MENU_APP_SETTINGS {
                let _ = app.emit(MENU_APP_ACTION_EVENT, id);
            }
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            get_launch_files,
            save_session,
            load_session,
            load_session_preview,
            clear_session,
            sync_watched_dirs,
            unwatch_dir,
            finish_window_close,
            set_app_menu_locale
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(cache) = app_handle.try_state::<SessionCache>() {
                    let _ = flush_session_cache(app_handle, &cache);
                }
            }
        });
}
