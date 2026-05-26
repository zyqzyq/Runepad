param(
  [string]$Architecture = "x64",
  [string]$Configuration = "release",
  [string]$Publisher,
  [string]$CertificatePath = "src-tauri/windows/msix/certs/devcert.pfx",
  [switch]$SkipTauriBuild,
  [switch]$SkipSigning,
  [switch]$Store
)

$ErrorActionPreference = "Stop"

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

function Assert-Command {
  param(
    [string]$Name,
    [string]$InstallHint
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $InstallHint"
  }
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

function Get-DotEnvValue {
  param(
    [string]$Path,
    [string]$Name
  )

  if (-not (Test-Path $Path)) {
    return $null
  }

  $prefix = "$Name="
  $exportPrefix = "export $Name="
  foreach ($line in Get-Content -Path $Path) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
      continue
    }

    if ($trimmed.StartsWith($exportPrefix)) {
      $value = $trimmed.Substring($exportPrefix.Length).Trim()
    } elseif ($trimmed.StartsWith($prefix)) {
      $value = $trimmed.Substring($prefix.Length).Trim()
    } else {
      continue
    }

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    return $value
  }

  return $null
}

function Find-WebView2OfflineInstaller {
  param([string]$Arch)

  $tauriCache = Join-Path $env:LOCALAPPDATA "tauri"
  $archDir = if ($Arch -eq "x64") { "x64" } else { "x86" }
  $searchPath = Join-Path $tauriCache $archDir

  if (-not (Test-Path $searchPath)) {
    return $null
  }

  Get-ChildItem -Path $searchPath -Recurse -Filter "*WebView2*Installer*.exe" |
    Select-Object -First 1
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$tauriDir = Join-Path $repoRoot "src-tauri"
$msixDir = Join-Path $tauriDir "windows/msix"
$outDir = Join-Path $tauriDir "target/msix"
$archOutDir = Join-Path $outDir $Architecture
$packageDir = Join-Path $archOutDir "package"
$manifestTemplate = Join-Path $msixDir "Package.appxmanifest"
$manifestPath = Join-Path $archOutDir "Package.appxmanifest"
$appExe = Join-Path $tauriDir "target/$Configuration/runepad.exe"
$shellExtDll = Join-Path $tauriDir "shell-ext/target/$Configuration/runepad_context_menu.dll"
$certPath = Join-Path $repoRoot $CertificatePath
$cargoBuildArgs = @("build", "--manifest-path", (Join-Path $tauriDir "shell-ext/Cargo.toml"))
$envPath = Join-Path $repoRoot ".env"

if (-not $PSBoundParameters.ContainsKey("Publisher") -or [string]::IsNullOrWhiteSpace($Publisher)) {
  $Publisher = Get-DotEnvValue -Path $envPath -Name "RUNEPAD_MSIX_PUBLISHER"
  if ([string]::IsNullOrWhiteSpace($Publisher)) {
    $Publisher = Get-DotEnvValue -Path $envPath -Name "MSIX_PUBLISHER"
  }
  if ([string]::IsNullOrWhiteSpace($Publisher)) {
    $Publisher = Get-DotEnvValue -Path $envPath -Name "PUBLISHER"
  }
  if ([string]::IsNullOrWhiteSpace($Publisher)) {
    $Publisher = Get-DotEnvValue -Path $envPath -Name "Publisher"
  }
  if ([string]::IsNullOrWhiteSpace($Publisher)) {
    $Publisher = "CN=Runepad Dev"
  }
}

if ($Configuration -eq "release") {
  $cargoBuildArgs += "--release"
} elseif ($Configuration -ne "debug") {
  throw "Unsupported configuration '$Configuration'. Use 'debug' or 'release'."
}

Assert-Command -Name "winapp" -InstallHint "Install it with: winget install microsoft.winappcli --source winget"

if (-not $SkipSigning -and -not (Test-Path $certPath)) {
  throw "Certificate not found: $certPath. Create one with: pnpm run msix:dev-cert"
}

if (-not $SkipSigning) {
  $resolvedCert = Resolve-Path $certPath
}

Push-Location $repoRoot
try {
  if (-not $SkipTauriBuild) {
    $tauriArgs = @("tauri", "build")
    if ($Store) {
      $tauriArgs += "--config", "src-tauri/tauri.microsoftstore.conf.json"
      Write-Host "Building for Microsoft Store with offline WebView2 installer..."
    }
    Invoke-Native -FilePath "pnpm" -Arguments $tauriArgs
  }

  Invoke-Native -FilePath "cargo" -Arguments $cargoBuildArgs

  if (Test-Path $packageDir) {
    Remove-Item -Recurse -Force $packageDir
  }

  New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
  New-Item -ItemType Directory -Force -Path $archOutDir | Out-Null

  Copy-RequiredFile -Source $appExe -Destination (Join-Path $packageDir "Runepad.exe")
  Copy-RequiredFile -Source $shellExtDll -Destination (Join-Path $packageDir "runepad_context_menu.dll")

  $assetDir = Join-Path $packageDir "Assets"
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/StoreLogo.png") -Destination (Join-Path $assetDir "StoreLogo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/Square44x44Logo.png") -Destination (Join-Path $assetDir "Square44x44Logo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/Square150x150Logo.png") -Destination (Join-Path $assetDir "Square150x150Logo.png")
  Copy-RequiredFile -Source (Join-Path $tauriDir "icons/icon.ico") -Destination (Join-Path $assetDir "icon.ico")

  if ($Store) {
    $webView2Installer = Find-WebView2OfflineInstaller -Arch $Architecture
    if ($webView2Installer) {
      Write-Host "Copying offline WebView2 installer: $($webView2Installer.FullName)"
      Copy-RequiredFile -Source $webView2Installer.FullName -Destination (Join-Path $packageDir $webView2Installer.Name)
    } else {
      Write-Warning "Offline WebView2 installer not found. MSIX package may not work on systems without WebView2 installed."
    }
  }

  (Get-Content $manifestTemplate -Raw).
    Replace("__PUBLISHER__", $Publisher).
    Replace("__PROCESSOR_ARCHITECTURE__", $Architecture) |
    Set-Content -NoNewline -Encoding UTF8 $manifestPath

  $packArgs = @("pack", $packageDir, "--manifest", $manifestPath, "--output", $outDir)
  if (-not $SkipSigning) {
    $packArgs += "--cert", $resolvedCert
  }
  Invoke-Native -FilePath "winapp" -Arguments $packArgs

  if ($SkipSigning) {
    Write-Host "Created MSIX under: $outDir"
  } else {
    Write-Host "Created signed MSIX under: $outDir"
  }
}
finally {
  Pop-Location
}
