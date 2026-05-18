// Runepad | Module: app_menu | Depends on: tauri::menu

#[cfg(target_os = "macos")]
use tauri::menu::AboutMetadata;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{App, AppHandle};

pub const MENU_FILE_NEW: &str = "file-new";
pub const MENU_FILE_OPEN: &str = "file-open";
pub const MENU_FILE_RECENT: &str = "file-recent";
pub const MENU_FILE_SAVE: &str = "file-save";
pub const MENU_FILE_CLOSE: &str = "file-close";
pub const MENU_FILE_OPEN_FOLDER: &str = "file-open-folder";
pub const MENU_FILE_CLOSE_FOLDER: &str = "file-close-folder";

pub const MENU_EDIT_FIND: &str = "edit-find";
pub const MENU_EDIT_REPLACE: &str = "edit-replace";

pub const MENU_FILE_ACTION_EVENT: &str = "menu-file-action";
pub const MENU_EDIT_ACTION_EVENT: &str = "menu-edit-action";

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
    let file_recent = MenuItemBuilder::with_id(MENU_FILE_RECENT, "Open &Recent...")
        .build(handle)?;
    let file_save = MenuItemBuilder::with_id(MENU_FILE_SAVE, "&Save")
        .accelerator(format!("{MOD}+S"))
        .build(handle)?;
    let file_close = MenuItemBuilder::with_id(MENU_FILE_CLOSE, "Close &Tab")
        .accelerator(format!("{MOD}+W"))
        .build(handle)?;
    let file_open_folder = MenuItemBuilder::with_id(MENU_FILE_OPEN_FOLDER, "Open &Folder...")
        .accelerator(format!("{MOD}+Shift+O"))
        .build(handle)?;
    let file_close_folder =
        MenuItemBuilder::with_id(MENU_FILE_CLOSE_FOLDER, "Close Fol&der").build(handle)?;

    let file_submenu = {
        let mut builder = SubmenuBuilder::new(handle, "&File")
            .item(&file_new)
            .item(&file_open)
            .item(&file_recent)
            .item(&file_open_folder)
            .item(&file_save)
            .separator()
            .item(&file_close)
            .separator()
            .item(&file_close_folder);
        #[cfg(not(target_os = "macos"))]
        {
            builder = builder.separator().quit();
        }
        builder.build()?
    };

    let edit_find = MenuItemBuilder::with_id(MENU_EDIT_FIND, "&Find...")
        .accelerator(format!("{MOD}+F"))
        .build(handle)?;
    let edit_replace = MenuItemBuilder::with_id(MENU_EDIT_REPLACE, "&Replace...")
        .accelerator(format!("{MOD}+H"))
        .build(handle)?;
    let edit_submenu = SubmenuBuilder::new(handle, "&Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .separator()
        .select_all()
        .separator()
        .item(&edit_find)
        .item(&edit_replace)
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
