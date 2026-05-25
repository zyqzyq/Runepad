use std::ffi::OsString;
use std::path::{Path, PathBuf};

pub const OPEN_FILES_EVENT: &str = "runepad://open-files";
const OPEN_WITH_RUNEPAD_FLAG: &str = "--open-with-runepad";

fn current_exe_path() -> Option<PathBuf> {
    std::env::current_exe().ok()?.canonicalize().ok()
}

fn resolve_launch_path(arg: OsString, cwd: Option<&Path>) -> Option<String> {
    if arg == OPEN_WITH_RUNEPAD_FLAG {
        return None;
    }

    let path = PathBuf::from(arg);
    let candidate = if path.is_absolute() {
        path
    } else if let Some(cwd) = cwd {
        cwd.join(path)
    } else {
        path
    };
    let canonical = candidate.canonicalize().ok()?;
    if !canonical.is_file() {
        return None;
    }
    if Some(canonical.as_path()) == current_exe_path().as_deref() {
        return None;
    }

    Some(canonical.to_string_lossy().to_string())
}

pub fn launch_files_from_args<I>(args: I, cwd: Option<&Path>) -> Vec<String>
where
    I: IntoIterator<Item = OsString>,
{
    args.into_iter()
        .filter_map(|arg| resolve_launch_path(arg, cwd))
        .collect()
}

#[tauri::command]
pub fn get_launch_files() -> Result<Vec<String>, String> {
    Ok(launch_files_from_args(std::env::args_os().skip(1), None))
}
