param(
  [string]$Architecture = "x64",
  [string]$Publisher,
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

New-Item -ItemType Directory -Force -Path $certDir | Out-Null
New-Item -ItemType Directory -Force -Path $workDir | Out-Null

if (Test-Path $outputCert) {
  Remove-Item -Force -Path $outputCert
}

(Get-Content $manifestTemplate -Raw).
  Replace("__PUBLISHER__", $Publisher).
  Replace("__PROCESSOR_ARCHITECTURE__", $Architecture) |
  Set-Content -NoNewline -Encoding UTF8 $manifestPath

Write-Host "Generating development certificate for publisher: $Publisher"

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
