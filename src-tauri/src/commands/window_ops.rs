// Runepad | Module: window_ops | Depends on: tauri::WebviewWindow

use tauri::WebviewWindow;

pub const WINDOW_CLOSING_EVENT: &str = "runepad://window-closing";

#[tauri::command]
pub async fn finish_window_close(window: WebviewWindow) -> Result<(), String> {
    window
        .destroy()
        .map_err(|e| format!("Failed to close window: {e}"))
}
