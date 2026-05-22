# Runepad MSIX packaging

This folder contains the MSIX manifest used by `pnpm run pack:msix`.

Useful commands:

```powershell
pnpm run msix:dev-cert
pnpm run pack:msix
```

Install notes:

- Trust `src-tauri/windows/msix/certs/RunepadDev.cer` under Current User > Trusted People before installing a development package.
- `Package.appxmanifest` uses `windows.fileTypeAssociation` for the low-cost context menu verb and `windows.fileExplorerContextMenus` for the Windows 11 primary context menu.
- Restart `explorer.exe` after installing or upgrading the MSIX so File Explorer reloads the shell extension.

Official references:

- https://learn.microsoft.com/windows/apps/desktop/modernize/integrate-packaged-app-with-file-explorer
- https://learn.microsoft.com/windows/msix/desktop/desktop-to-uwp-prepare
- https://v2.tauri.app/distribute/windows-installer/
