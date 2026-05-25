use super::*;
use std::cell::RefCell;

struct FakeWindow {
    calls: RefCell<Vec<&'static str>>,
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
        self.calls.borrow_mut().push("show");
        Ok(())
    }

    fn unminimize_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("unminimize");
        Ok(())
    }

    fn focus_window(&self) -> Result<(), String> {
        self.calls.borrow_mut().push("focus");
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
