!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr HKCU "Software\Classes\*\shell\Runepad" "" "Open with Runepad"
  WriteRegStr HKCU "Software\Classes\*\shell\Runepad" "Icon" "$INSTDIR\Runepad.exe,0"
  WriteRegStr HKCU "Software\Classes\*\shell\Runepad\command" "" '"$INSTDIR\Runepad.exe" "%1"'
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey HKCU "Software\Classes\*\shell\Runepad"
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
