param(
  [string]$Architecture = "x64",
  [string]$Publisher = "CN=Runepad Dev",
  [string]$OutputDir = "src-tauri/windows/msix/certs"
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

if (-not (Get-Command winapp -ErrorAction SilentlyContinue)) {
  throw "winapp was not found. Install it with: winget install microsoft.winappcli --source winget"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$tauriDir = Join-Path $repoRoot "src-tauri"
$msixDir = Join-Path $tauriDir "windows/msix"
$certDir = Join-Path $repoRoot $OutputDir
$workDir = Join-Path $tauriDir "target/msix/cert"
$manifestTemplate = Join-Path $msixDir "Package.appxmanifest"
$manifestPath = Join-Path $workDir "Package.appxmanifest"
$outputCert = Join-Path $certDir "devcert.pfx"

New-Item -ItemType Directory -Force -Path $certDir | Out-Null
New-Item -ItemType Directory -Force -Path $workDir | Out-Null

(Get-Content $manifestTemplate -Raw).
  Replace("__PUBLISHER__", $Publisher).
  Replace("__PROCESSOR_ARCHITECTURE__", $Architecture) |
  Set-Content -NoNewline -Encoding UTF8 $manifestPath

Invoke-Native -FilePath "winapp" -Arguments @(
  "cert",
  "generate",
  "--manifest",
  $manifestPath,
  "--output",
  $outputCert,
  "--if-exists",
  "skip"
)

if (-not (Test-Path $outputCert)) {
  throw "winapp cert generate completed but devcert.pfx was not created at $outputCert."
}

Write-Host "Created development certificate: $outputCert"
Write-Host "Trust it once with: winapp cert install $outputCert"
