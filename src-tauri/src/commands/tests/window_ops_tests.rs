use super::*;
use std::cell::RefCell;

struct FakeWindow {
    calls: RefCell<Vec<String>>,
}

impl FakeWindow {
    fn new() -> Self {
        Self {
            calls: RefCell::new(Vec::new()),
        }
    }
}

impl WindowReveal for FakeWindow {
    fn show_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("show".to_string());
        Ok(())
    }

    fn unminimize_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("unminimize".to_string());
        Ok(())
    }

    fn focus_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("focus".to_string());
        Ok(())
    }

    fn unmaximize_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("unmaximize".to_string());
        Ok(())
    }

    fn maximize_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("maximize".to_string());
        Ok(())
    }

    fn set_outer_position(&self, x: i32, y: i32) -> Result<(), String> {
        self.calls.borrow_mut().push(format!("position:{x},{y}"));
        Ok(())
    }

    fn set_outer_size(&self, width: u32, height: u32) -> Result<(), String> {
        self.calls.borrow_mut().push(format!("size:{width},{height}"));
        Ok(())
    }
}

#[test]
fn reveal_window_restores_minimized_window_before_focus() {
    let window = FakeWindow::new();

    reveal_window(&window);

    assert_eq!(
        window.calls.borrow().as_slice(),
        ["show", "unminimize", "focus"]
    );
}

#[test]
fn apply_window_state_sets_bounds_before_reveal() {
    let window = FakeWindow::new();
    let state = SessionWindowState {
        x: 80,
        y: 60,
        width: 1200,
        height: 820,
        maximized: true,
    };

    apply_window_state(&window, &state);
    reveal_window(&window);

    assert_eq!(
        window.calls.borrow().as_slice(),
        [
            "unmaximize",
            "size:1200,820",
            "position:80,60",
            "maximize",
            "show",
            "unminimize",
            "focus"
        ]
    );
}
