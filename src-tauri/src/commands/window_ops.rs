// Runepad | Module: window_ops | Depends on: tauri::WebviewWindow

use tauri::WebviewWindow;

pub const WINDOW_CLOSING_EVENT: &str = "runepad://window-closing";

trait WindowReveal {
    fn show_window(&self) -> Result<(), String>;
    fn unminimize_window(&self) -> Result<(), String>;
    fn focus_window(&self) -> Result<(), String>;
}

impl WindowReveal for WebviewWindow {
    fn show_window(&self) -> Result<(), String> {
        self.show()
            .map_err(|e| format!("Failed to show window: {e}"))
    }

    fn unminimize_window(&self) -> Result<(), String> {
        self.unminimize()
            .map_err(|e| format!("Failed to restore window: {e}"))
    }

    fn focus_window(&self) -> Result<(), String> {
        self.set_focus()
            .map_err(|e| format!("Failed to focus window: {e}"))
    }
}

fn reveal_window<W: WindowReveal>(window: &W) {
    let _ = window.show_window();
    let _ = window.unminimize_window();
    let _ = window.focus_window();
}

pub fn reveal_main_window(window: &WebviewWindow) {
    reveal_window(window);
}

#[tauri::command]
pub async fn finish_window_close(window: WebviewWindow) -> Result<(), String> {
    window
        .destroy()
        .map_err(|e| format!("Failed to close window: {e}"))
}

#[cfg(test)]
#[path = "tests/window_ops_tests.rs"]
mod tests;
