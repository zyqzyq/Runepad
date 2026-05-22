param(
  [string]$Architecture = "x64",
  [string]$Configuration = "release",
  [string]$Publisher = "CN=Runepad Dev",
  [string]$CertificatePath = "src-tauri/windows/msix/certs/RunepadDev.pfx",
  [string]$CertificatePassword = "runepad-dev",
  [switch]$SkipTauriBuild,
  [switch]$SkipSigning
)

$ErrorActionPreference = "Stop"

function Find-WindowsKitTool {
  param([string]$ToolName)

  $kitRoot = "${env:ProgramFiles(x86)}\Windows Kits\10\bin"
  if (-not (Test-Path $kitRoot)) {
    throw "Windows 10/11 SDK was not found. Install the Windows SDK to get $ToolName."
  }

  $tool = Get-ChildItem -Path $kitRoot -Recurse -Filter $ToolName -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like "*\$Architecture\*" } |
    Sort-Object FullName -Descending |
    Select-Object -First 1

  if (-not $tool) {
    throw "$ToolName was not found in the Windows SDK for architecture $Architecture."
  }

  return $tool.FullName
}

function Copy-RequiredFile {
  param(
    [string]$Source,
    [string]$Destination
  )

  if (-not (Test-Path $Source)) {
    throw "Required file not found: $Source"
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
  Copy-Item -Force -Path $Source -Destination $Destination
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FilePath failed with exit code $LASTEXITCODE."
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$tauriDir = Join-Path $repoRoot "src-tauri"
$msixDir = Join-Path $tauriDir "windows/msix"
$stagingDir = Join-Path $tauriDir "target/msix/$Architecture"
$packageDir = Join-Path $stagingDir "package"
$outDir = Join-Path $tauriDir "target/msix"
$manifestTemplate = Join-Path $msixDir "Package.appxmanifest"
$manifestPath = Join-Path $packageDir "AppxManifest.xml"
$appExe = Join-Path $tauriDir "target/$Configuration/runepad.exe"
$shellExtDll = Join-Path $tauriDir "shell-ext/target/$Configuration/runepad_context_menu.dll"
$unsignedMsix = Join-Path $outDir "Runepad-$Architecture.msix"
$signedMsix = Join-Path $outDir "Runepad-$Architecture-signed.msix"
$cargoBuildArgs = @("build", "--manifest-path", (Join-Path $tauriDir "shell-ext/Cargo.toml"))
if ($Configuration -eq "release") {
  $cargoBuildArgs += "--release"
} elseif ($Configuration -ne "debug") {
  throw "Unsupported configuration '$Configuration'. Use 'debug' or 'release'."
}

Push-Location $repoRoot
try {
  if (-not $SkipTauriBuild) {
    Invoke-Native -FilePath "pnpm" -Arguments @("tauri", "build")
  }

  Invoke-Native -FilePath "cargo" -Arguments $cargoBuildArgs

  if (Test-Path $packageDir) {
    Remove-Item -Recurse -Force $packageDir
  }

  New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null

  Copy-RequiredFile -Source $appExe -Destination (Join-Path $packageDir "Runepad.exe")
  Copy-RequiredFile -Source $shellExtDll -Destination (Join-Path $packageDir "runepad_context_menu.dll")
  $assetDir = Join-Path $packageDir "Assets"
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/StoreLogo.png") -Destination (Join-Path $assetDir "StoreLogo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/Square44x44Logo.png") -Destination (Join-Path $assetDir "Square44x44Logo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/Square150x150Logo.png") -Destination (Join-Path $assetDir "Square150x150Logo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/icon.ico") -Destination (Join-Path $assetDir "icon.ico")

  (Get-Content $manifestTemplate -Raw).
    Replace("__PUBLISHER__", $Publisher).
    Replace("__PROCESSOR_ARCHITECTURE__", $Architecture) |
    Set-Content -NoNewline -Encoding UTF8 $manifestPath

  $makeAppx = Find-WindowsKitTool -ToolName "makeappx.exe"
  Invoke-Native -FilePath $makeAppx -Arguments @("pack", "/d", $packageDir, "/p", $unsignedMsix, "/o")

  if ($SkipSigning) {
    Write-Host "Created unsigned MSIX: $unsignedMsix"
    return
  }

  $resolvedCert = Resolve-Path (Join-Path $repoRoot $CertificatePath)
  $signTool = Find-WindowsKitTool -ToolName "signtool.exe"
  Invoke-Native -FilePath $signTool -Arguments @("sign", "/fd", "SHA256", "/a", "/f", $resolvedCert, "/p", $CertificatePassword, $unsignedMsix)
  Copy-Item -Force -Path $unsignedMsix -Destination $signedMsix
  Write-Host "Created signed MSIX: $signedMsix"
}
finally {
  Pop-Location
}
