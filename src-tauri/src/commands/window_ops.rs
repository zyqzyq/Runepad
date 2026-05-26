// Runepad | Module: window_ops | Depends on: session_ops, tauri::WebviewWindow

use crate::commands::session_ops::{load_session_preview_window_state, SessionWindowState};
use tauri::{AppHandle, PhysicalPosition, PhysicalSize, WebviewWindow};

pub const WINDOW_CLOSING_EVENT: &str = "runepad://window-closing";

trait WindowReveal {
    fn show_window(&self) -> Result<(), String>;
    fn unminimize_window(&self) -> Result<(), String>;
    fn focus_window(&self) -> Result<(), String>;
    fn unmaximize_window(&self) -> Result<(), String>;
    fn maximize_window(&self) -> Result<(), String>;
    fn set_outer_position(&self, x: i32, y: i32) -> Result<(), String>;
    fn set_outer_size(&self, width: u32, height: u32) -> Result<(), String>;
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

    fn unmaximize_window(&self) -> Result<(), String> {
        self.unmaximize()
            .map_err(|e| format!("Failed to unmaximize window: {e}"))
    }

    fn maximize_window(&self) -> Result<(), String> {
        self.maximize()
            .map_err(|e| format!("Failed to maximize window: {e}"))
    }

    fn set_outer_position(&self, x: i32, y: i32) -> Result<(), String> {
        self.set_position(PhysicalPosition::new(x, y))
            .map_err(|e| format!("Failed to set window position: {e}"))
    }

    fn set_outer_size(&self, width: u32, height: u32) -> Result<(), String> {
        self.set_size(PhysicalSize::new(width, height))
            .map_err(|e| format!("Failed to set window size: {e}"))
    }
}

fn apply_window_state<W: WindowReveal>(window: &W, state: &SessionWindowState) {
    let _ = window.unmaximize_window();
    let _ = window.set_outer_size(state.width, state.height);
    let _ = window.set_outer_position(state.x, state.y);
    if state.maximized {
        let _ = window.maximize_window();
    }
}

fn reveal_window<W: WindowReveal>(window: &W) {
    let _ = window.show_window();
    let _ = window.unminimize_window();
    let _ = window.focus_window();
}

pub fn restore_main_window_before_show(app: &AppHandle, window: &WebviewWindow) {
    if let Some(state) = load_session_preview_window_state(app) {
        apply_window_state(window, &state);
    }
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
