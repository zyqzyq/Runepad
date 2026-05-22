param(
  [string]$Publisher = "CN=Runepad Dev",
  [string]$OutputDir = "src-tauri/windows/msix/certs",
  [string]$Password = "runepad-dev"
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "../..")
$certDir = Join-Path $repoRoot $OutputDir
$pfxPath = Join-Path $certDir "RunepadDev.pfx"
$cerPath = Join-Path $certDir "RunepadDev.cer"

New-Item -ItemType Directory -Force -Path $certDir | Out-Null

$cert = New-SelfSignedCertificate `
  -Type Custom `
  -Subject $Publisher `
  -KeyUsage DigitalSignature `
  -FriendlyName "Runepad MSIX Development Certificate" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") `
  -NotAfter (Get-Date).AddYears(3)

$securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePassword | Out-Null
Export-Certificate -Cert $cert -FilePath $cerPath | Out-Null

Write-Host "Created development certificate:"
Write-Host "  PFX: $pfxPath"
Write-Host "  CER: $cerPath"
Write-Host ""
Write-Host "Trust the CER under Current User > Trusted People before installing a sideloaded MSIX."
