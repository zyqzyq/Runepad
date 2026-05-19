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

pub const MENU_APP_SETTINGS: &str = "app-settings";

pub const MENU_FILE_ACTION_EVENT: &str = "menu-file-action";
pub const MENU_EDIT_ACTION_EVENT: &str = "menu-edit-action";
pub const MENU_APP_ACTION_EVENT: &str = "menu-app-action";

struct MenuLabels {
    file: String,
    edit: String,
    file_new: String,
    file_open: String,
    file_recent: String,
    file_save: String,
    file_close: String,
    file_open_folder: String,
    file_close_folder: String,
    file_settings: String,
    edit_find: String,
    edit_replace: String,
}

fn labels_for(locale: &str) -> MenuLabels {
    if locale.starts_with("zh") {
        MenuLabels {
            file: "文件(&F)".into(),
            edit: "编辑(&E)".into(),
            file_new: "新建(&N)".into(),
            file_open: "打开(&O)...".into(),
            file_recent: "打开最近(&R)...".into(),
            file_save: "保存(&S)".into(),
            file_close: "关闭标签(&W)".into(),
            file_open_folder: "打开文件夹(&F)...".into(),
            file_close_folder: "关闭文件夹(&D)".into(),
            file_settings: "设置(&S)...".into(),
            edit_find: "查找(&F)...".into(),
            edit_replace: "替换(&H)...".into(),
        }
    } else {
        MenuLabels {
            file: "&File".into(),
            edit: "&Edit".into(),
            file_new: "&New".into(),
            file_open: "&Open...".into(),
            file_recent: "Open &Recent...".into(),
            file_save: "&Save".into(),
            file_close: "Close &Tab".into(),
            file_open_folder: "Open &Folder...".into(),
            file_close_folder: "Close Fol&der".into(),
            file_settings: "&Settings...".into(),
            edit_find: "&Find...".into(),
            edit_replace: "&Replace...".into(),
        }
    }
}

pub fn init_app_menu(app: &App) -> tauri::Result<()> {
    let menu = build_app_menu(app.handle(), "en-US")?;
    app.set_menu(menu)?;
    Ok(())
}

pub fn build_app_menu<R: tauri::Runtime>(
    handle: &AppHandle<R>,
    locale: &str,
) -> tauri::Result<tauri::menu::Menu<R>> {
    const MOD: &str = "CmdOrCtrl";
    let labels = labels_for(locale);

    let file_new = MenuItemBuilder::with_id(MENU_FILE_NEW, &labels.file_new)
        .accelerator(format!("{MOD}+N"))
        .build(handle)?;
    let file_open = MenuItemBuilder::with_id(MENU_FILE_OPEN, &labels.file_open)
        .accelerator(format!("{MOD}+O"))
        .build(handle)?;
    let file_recent = MenuItemBuilder::with_id(MENU_FILE_RECENT, &labels.file_recent).build(handle)?;
    let file_save = MenuItemBuilder::with_id(MENU_FILE_SAVE, &labels.file_save)
        .accelerator(format!("{MOD}+S"))
        .build(handle)?;
    let file_close = MenuItemBuilder::with_id(MENU_FILE_CLOSE, &labels.file_close)
        .accelerator(format!("{MOD}+W"))
        .build(handle)?;
    let file_open_folder =
        MenuItemBuilder::with_id(MENU_FILE_OPEN_FOLDER, &labels.file_open_folder)
            .accelerator(format!("{MOD}+Shift+O"))
            .build(handle)?;
    let file_close_folder =
        MenuItemBuilder::with_id(MENU_FILE_CLOSE_FOLDER, &labels.file_close_folder).build(handle)?;
    let app_settings = MenuItemBuilder::with_id(MENU_APP_SETTINGS, &labels.file_settings)
        .accelerator(format!("{MOD}+,"))
        .build(handle)?;

    let file_submenu = {
        let mut builder = SubmenuBuilder::new(handle, &labels.file)
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
            builder = builder
                .separator()
                .item(&app_settings)
                .separator()
                .quit();
        }
        builder.build()?
    };

    let edit_find = MenuItemBuilder::with_id(MENU_EDIT_FIND, &labels.edit_find)
        .accelerator(format!("{MOD}+F"))
        .build(handle)?;
    let edit_replace = MenuItemBuilder::with_id(MENU_EDIT_REPLACE, &labels.edit_replace)
        .accelerator(format!("{MOD}+H"))
        .build(handle)?;
    let edit_submenu = SubmenuBuilder::new(handle, &labels.edit)
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
            .item(&app_settings)
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
