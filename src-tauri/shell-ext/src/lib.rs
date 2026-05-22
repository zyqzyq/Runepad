#![cfg(target_os = "windows")]

use std::ffi::c_void;
use std::path::PathBuf;
use std::sync::atomic::{AtomicIsize, AtomicU32, Ordering};

use windows_core::{implement, BOOL, GUID, Interface, PWSTR, Ref, Result};
use windows::Win32::Foundation::{
    CLASS_E_CLASSNOTAVAILABLE, CLASS_E_NOAGGREGATION, E_NOINTERFACE, E_NOTIMPL, HINSTANCE,
    HMODULE, S_OK,
};
use windows::Win32::Globalization::GetUserDefaultUILanguage;
use windows::Win32::System::Com::{
    CoTaskMemAlloc, CoTaskMemFree, IBindCtx, IClassFactory, IClassFactory_Impl,
};
use windows::Win32::System::LibraryLoader::GetModuleFileNameW;
use windows::Win32::UI::Shell::{
    IEnumExplorerCommand, IExplorerCommand, IExplorerCommand_Impl, IShellItemArray, ECF_DEFAULT,
    ECS_ENABLED, SIGDN_FILESYSPATH,
};

const CLSID_RUNEPAD_CONTEXT_MENU: GUID =
    GUID::from_u128(0x2cfa7747_b52c_4a23_94fb_4d7a847cfb6e);
const MENU_TITLE_EN: &str = "Open with Runepad";
const MENU_TITLE_ZH: &str = "用 Runepad 打开";
const MENU_TOOLTIP_EN: &str = "Open the selected file in Runepad";
const MENU_TOOLTIP_ZH: &str = "在 Runepad 中打开所选文件";

static DLL_MODULE: AtomicIsize = AtomicIsize::new(0);
static SERVER_LOCKS: AtomicU32 = AtomicU32::new(0);
static ACTIVE_OBJECTS: AtomicU32 = AtomicU32::new(0);

#[implement(IExplorerCommand)]
struct ExplorerCommand;

impl Drop for ExplorerCommand {
    fn drop(&mut self) {
        ACTIVE_OBJECTS.fetch_sub(1, Ordering::SeqCst);
    }
}

#[allow(non_snake_case)]
impl IExplorerCommand_Impl for ExplorerCommand_Impl {
    fn GetTitle(&self, _psiitemarray: Ref<'_, IShellItemArray>) -> Result<PWSTR> {
        string_to_cotaskmem(localized_text(MENU_TITLE_EN, MENU_TITLE_ZH))
    }

    fn GetIcon(&self, _psiitemarray: Ref<'_, IShellItemArray>) -> Result<PWSTR> {
        let icon = runepad_exe_path()
            .map(|path| format!("{},0", path.display()))
            .unwrap_or_else(|| "Runepad.exe,0".to_string());
        string_to_cotaskmem(&icon)
    }

    fn GetToolTip(&self, _psiitemarray: Ref<'_, IShellItemArray>) -> Result<PWSTR> {
        string_to_cotaskmem(localized_text(MENU_TOOLTIP_EN, MENU_TOOLTIP_ZH))
    }

    fn GetCanonicalName(&self) -> Result<GUID> {
        Ok(CLSID_RUNEPAD_CONTEXT_MENU)
    }

    fn GetState(
        &self,
        psiitemarray: Ref<'_, IShellItemArray>,
        _foktobeslow: BOOL,
    ) -> Result<u32> {
        let has_file = selected_file_paths(psiitemarray).is_ok_and(|paths| !paths.is_empty());
        Ok(if has_file { ECS_ENABLED.0 as u32 } else { 1 })
    }

    fn Invoke(
        &self,
        psiitemarray: Ref<'_, IShellItemArray>,
        _pbc: Ref<'_, IBindCtx>,
    ) -> Result<()> {
        let paths = selected_file_paths(psiitemarray)?;
        if let Some(exe) = runepad_exe_path() {
            let mut command = std::process::Command::new(exe);
            command.arg("--open-with-runepad");
            for path in paths {
                command.arg(path);
            }
            let _ = command.spawn();
        }
        Ok(())
    }

    fn GetFlags(&self) -> Result<u32> {
        Ok(ECF_DEFAULT.0 as u32)
    }

    fn EnumSubCommands(&self) -> Result<IEnumExplorerCommand> {
        Err(E_NOTIMPL.into())
    }
}

#[implement(IClassFactory)]
struct ExplorerCommandFactory;

#[allow(non_snake_case)]
impl IClassFactory_Impl for ExplorerCommandFactory_Impl {
    fn CreateInstance(
        &self,
        punkouter: Ref<'_, windows::core::IUnknown>,
        riid: *const GUID,
        ppvobject: *mut *mut c_void,
    ) -> Result<()> {
        unsafe {
            if !ppvobject.is_null() {
                *ppvobject = std::ptr::null_mut();
            }
        }

        if !punkouter.is_null() {
            return Err(CLASS_E_NOAGGREGATION.into());
        }

        ACTIVE_OBJECTS.fetch_add(1, Ordering::SeqCst);
        let command: IExplorerCommand = ExplorerCommand.into();
        let hr = unsafe { command.query(riid, ppvobject) };
        if hr.is_err() {
            ACTIVE_OBJECTS.fetch_sub(1, Ordering::SeqCst);
            return Err(hr.into());
        }
        Ok(())
    }

    fn LockServer(&self, flock: BOOL) -> Result<()> {
        if flock.as_bool() {
            SERVER_LOCKS.fetch_add(1, Ordering::SeqCst);
        } else {
            SERVER_LOCKS.fetch_sub(1, Ordering::SeqCst);
        }
        Ok(())
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn DllGetClassObject(
    rclsid: *const GUID,
    riid: *const GUID,
    ppv: *mut *mut c_void,
) -> windows_core::HRESULT {
    unsafe {
        if !ppv.is_null() {
            *ppv = std::ptr::null_mut();
        }

        if rclsid.is_null() || *rclsid != CLSID_RUNEPAD_CONTEXT_MENU {
            return CLASS_E_CLASSNOTAVAILABLE;
        }

        let factory: IClassFactory = ExplorerCommandFactory.into();
        factory.query(riid, ppv)
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn DllCanUnloadNow() -> windows_core::HRESULT {
    if SERVER_LOCKS.load(Ordering::SeqCst) == 0 && ACTIVE_OBJECTS.load(Ordering::SeqCst) == 0 {
        S_OK
    } else {
        windows_core::HRESULT(1)
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn DllMain(
    module: HINSTANCE,
    reason: u32,
    _reserved: *mut c_void,
) -> BOOL {
    const DLL_PROCESS_ATTACH: u32 = 1;
    if reason == DLL_PROCESS_ATTACH {
        DLL_MODULE.store(module.0 as isize, Ordering::SeqCst);
    }
    true.into()
}

fn selected_file_paths(items: Ref<'_, IShellItemArray>) -> Result<Vec<PathBuf>> {
    let Some(items) = items.as_ref() else {
        return Ok(Vec::new());
    };

    let count = unsafe { items.GetCount()? };
    let mut paths = Vec::with_capacity(count as usize);
    for index in 0..count {
        let item = unsafe { items.GetItemAt(index)? };
        let display_name = unsafe { item.GetDisplayName(SIGDN_FILESYSPATH)? };
        let path = unsafe { display_name.to_string().ok() }.map(PathBuf::from);
        unsafe { CoTaskMemFree(Some(display_name.as_ptr() as *const c_void)) };
        if let Some(path) = path.filter(|p| p.is_file()) {
            paths.push(path);
        }
    }

    Ok(paths)
}

fn runepad_exe_path() -> Option<PathBuf> {
    let module = DLL_MODULE.load(Ordering::SeqCst);
    if module == 0 {
        return None;
    }

    let mut buffer = vec![0u16; 32768];
    let len = unsafe {
        GetModuleFileNameW(
            Some(HMODULE(module as *mut c_void)),
            &mut buffer,
        )
    };
    if len == 0 {
        return None;
    }

    let dll_path = PathBuf::from(String::from_utf16_lossy(&buffer[..len as usize]));
    dll_path.parent().map(|dir| dir.join("Runepad.exe"))
}

fn string_to_cotaskmem(value: &str) -> Result<PWSTR> {
    let wide: Vec<u16> = value.encode_utf16().chain(std::iter::once(0)).collect();
    let bytes = wide.len() * std::mem::size_of::<u16>();
    let ptr = unsafe { CoTaskMemAlloc(bytes) as *mut u16 };
    if ptr.is_null() {
        return Err(E_NOINTERFACE.into());
    }

    unsafe {
        std::ptr::copy_nonoverlapping(wide.as_ptr(), ptr, wide.len());
    }
    Ok(PWSTR(ptr))
}

fn localized_text<'a>(english: &'a str, chinese: &'a str) -> &'a str {
    const LANG_CHINESE: u16 = 0x04;
    let language_id = unsafe { GetUserDefaultUILanguage() };
    let primary_language_id = language_id & 0x03ff;
    if primary_language_id == LANG_CHINESE {
        chinese
    } else {
        english
    }
}
