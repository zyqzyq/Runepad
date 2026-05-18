mod commands;
mod utils;

use commands::file_ops::{read_file, write_file};
use commands::system_ops::get_system_theme;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_file, write_file, get_system_theme])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
