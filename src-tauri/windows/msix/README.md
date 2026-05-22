# Runepad MSIX packaging

This folder contains the MSIX manifest used by `pnpm run pack:msix`.

The packaging scripts follow Microsoft's winapp CLI Tauri flow. The scripts
generate a temporary loose layout under `src-tauri/target/msix/` because
`winapp pack` reads `Package.appxmanifest` from the current directory.

Useful commands:

```powershell
winget install microsoft.winappcli --source winget
pnpm run msix:dev-cert
winapp cert install .\src-tauri\windows\msix\certs\devcert.pfx
pnpm run pack:msix
```

Install notes:

- `winapp cert generate` reads the Publisher from the generated manifest, so keep the script `-Publisher` value aligned with `Package.appxmanifest`.
- `winapp cert install` must be run once for local self-signed packages.
- `Package.appxmanifest` uses `windows.fileTypeAssociation` for the low-cost context menu verb and `windows.fileExplorerContextMenus` for the Windows 11 primary context menu.
- Restart `explorer.exe` after installing or upgrading the MSIX so File Explorer reloads the shell extension.

Official references:

- https://learn.microsoft.com/windows/apps/dev-tools/winapp-cli/guides/tauri
- https://learn.microsoft.com/windows/apps/desktop/modernize/integrate-packaged-app-with-file-explorer
- https://learn.microsoft.com/windows/msix/desktop/desktop-to-uwp-prepare
- https://v2.tauri.app/distribute/windows-installer/
