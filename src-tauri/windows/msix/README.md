# Runepad MSIX packaging

This folder contains the MSIX manifest used by `pnpm run pack:msix`.

The packaging scripts follow Microsoft's winapp CLI Tauri flow. The scripts
generate a temporary loose layout and manifest under `src-tauri/target/msix/`,
then pass them to `winapp pack` with explicit paths.

Useful commands:

```powershell
winget install microsoft.winappcli --source winget
pnpm run msix:dev-cert
winapp cert install .\src-tauri\windows\msix\certs\devcert.pfx
pnpm run pack:msix
```

Install notes:

- `winapp cert generate` reads the Publisher from the generated manifest, so keep the script `-Publisher` value aligned with `Package.appxmanifest`.
- `-Publisher` has the highest priority. When it is omitted, the scripts read `RUNEPAD_MSIX_PUBLISHER`, `MSIX_PUBLISHER`, `PUBLISHER`, or `Publisher` from the repository `.env` file, then fall back to `CN=Runepad Dev`.
- Keep real Microsoft Store Publisher CN values in local `.env` files or pass them with `-Publisher`; do not commit `.env` or files under `src-tauri/windows/msix/certs`.
- `pnpm run msix:dev-cert` replaces the local ignored `devcert.pfx` so Publisher changes in `.env` do not leave an old certificate behind.
- `winapp cert install` must be run once for local self-signed packages.
- `Package.appxmanifest` uses `windows.fileTypeAssociation` for the low-cost context menu verb and `windows.fileExplorerContextMenus` for the Windows 11 primary context menu.
- Restart `explorer.exe` after installing or upgrading the MSIX so File Explorer reloads the shell extension.

Official references:

- https://learn.microsoft.com/windows/apps/dev-tools/winapp-cli/guides/tauri
- https://learn.microsoft.com/windows/apps/desktop/modernize/integrate-packaged-app-with-file-explorer
- https://learn.microsoft.com/windows/msix/desktop/desktop-to-uwp-prepare
- https://v2.tauri.app/distribute/windows-installer/
