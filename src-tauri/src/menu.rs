// Runepad | Module: app_menu | Depends on: tauri::menu

#[cfg(target_os = "macos")]
use tauri::menu::AboutMetadata;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{App, AppHandle};

pub const MENU_FILE_NEW: &str = "file-new";
pub const MENU_FILE_OPEN: &str = "file-open";
pub const MENU_FILE_SAVE: &str = "file-save";
pub const MENU_FILE_CLOSE: &str = "file-close";

pub const MENU_FILE_ACTION_EVENT: &str = "menu-file-action";

pub fn init_app_menu(app: &App) -> tauri::Result<()> {
    let menu = build_app_menu(app.handle())?;
    app.set_menu(menu)?;
    Ok(())
}

fn build_app_menu<R: tauri::Runtime>(handle: &AppHandle<R>) -> tauri::Result<tauri::menu::Menu<R>> {
    const MOD: &str = "CmdOrCtrl";

    let file_new = MenuItemBuilder::with_id(MENU_FILE_NEW, "&New")
        .accelerator(format!("{MOD}+N"))
        .build(handle)?;
    let file_open = MenuItemBuilder::with_id(MENU_FILE_OPEN, "&Open...")
        .accelerator(format!("{MOD}+O"))
        .build(handle)?;
    let file_save = MenuItemBuilder::with_id(MENU_FILE_SAVE, "&Save")
        .accelerator(format!("{MOD}+S"))
        .build(handle)?;
    let file_close = MenuItemBuilder::with_id(MENU_FILE_CLOSE, "Close &Tab")
        .accelerator(format!("{MOD}+W"))
        .build(handle)?;

    let file_submenu = {
        let mut builder = SubmenuBuilder::new(handle, "&File")
            .item(&file_new)
            .item(&file_open)
            .item(&file_save)
            .separator()
            .item(&file_close);
        #[cfg(not(target_os = "macos"))]
        {
            builder = builder.separator().quit();
        }
        builder.build()?
    };

    let edit_submenu = SubmenuBuilder::new(handle, "&Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .separator()
        .select_all()
        .build()?;

    #[cfg(target_os = "macos")]
    {
        let app_submenu = SubmenuBuilder::new(handle, "Runepad")
            .about(Some(AboutMetadata {
                name: Some("Runepad".into()),
                version: Some(env!("CARGO_PKG_VERSION").into()),
                ..Default::default()
            }))
            .separator()
            .quit()
            .build()?;
        return MenuBuilder::new(handle)
            .item(&app_submenu)
            .item(&file_submenu)
            .item(&edit_submenu)
            .build();
    }

    #[cfg(not(target_os = "macos"))]
    {
        MenuBuilder::new(handle)
            .item(&file_submenu)
            .item(&edit_submenu)
            .build()
    }
}
