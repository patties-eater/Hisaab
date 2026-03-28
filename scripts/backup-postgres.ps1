param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$EnvFile,
  [string]$BackupDir,
  [string]$DatabaseUrl,
  [int]$KeepDays = 30
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key
  )

  if (-not (Test-Path -LiteralPath $FilePath)) {
    return $null
  }

  $pattern = "^\s*{0}\s*=\s*(.*)\s*$" -f [regex]::Escape($Key)

  foreach ($line in Get-Content -LiteralPath $FilePath) {
    if ($line -match '^\s*#') {
      continue
    }

    if ($line -match $pattern) {
      $value = $Matches[1].Trim()

      if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
      ) {
        $value = $value.Substring(1, $value.Length - 2)
      }

      return $value
    }
  }

  return $null
}

function Resolve-DefaultBackupDir {
  param([string]$HomePath)

  $candidates = @(
    (Join-Path $HomePath "Google Drive"),
    (Join-Path $HomePath "My Drive"),
    (Join-Path $HomePath "GoogleDrive")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return (Join-Path $candidate "HisaabBackups")
    }
  }

  return (Join-Path $ProjectRoot "backups")
}

if (-not $EnvFile) {
  $EnvFile = Join-Path $ProjectRoot "NewBackend\.env"
}

if (-not $DatabaseUrl) {
  $DatabaseUrl = $env:DATABASE_URL
}

if (-not $DatabaseUrl) {
  $DatabaseUrl = Get-EnvValue -FilePath $EnvFile -Key "DATABASE_URL"
}

if (-not $DatabaseUrl) {
  throw "DATABASE_URL was not found. Pass -DatabaseUrl or set it in $EnvFile."
}

if (-not $BackupDir) {
  $BackupDir = $env:GOOGLE_DRIVE_BACKUP_DIR
}

if (-not $BackupDir) {
  $BackupDir = Resolve-DefaultBackupDir -HomePath $HOME
}

if (-not (Test-Path -LiteralPath $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$pgDumpCommand = Get-Command pg_dump -ErrorAction SilentlyContinue

if (-not $pgDumpCommand) {
  throw "pg_dump is not available in PATH. Install PostgreSQL tools or add pg_dump to PATH."
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $BackupDir ("hisaab-backup-{0}.sql" -f $timestamp)
$hashFile = "$backupFile.sha256.txt"

Write-Host "Creating backup: $backupFile"

& $pgDumpCommand.Source `
  --dbname="$DatabaseUrl" `
  --format=plain `
  --no-owner `
  --no-privileges `
  --file="$backupFile"

if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE"
}

$hash = Get-FileHash -LiteralPath $backupFile -Algorithm SHA256
"$($hash.Hash)  $(Split-Path -Leaf $backupFile)" | Set-Content -LiteralPath $hashFile

$cutoff = (Get-Date).AddDays(-1 * [Math]::Abs($KeepDays))
Get-ChildItem -LiteralPath $BackupDir -File -Filter "hisaab-backup-*.sql" |
  Where-Object { $_.LastWriteTime -lt $cutoff } |
  ForEach-Object {
    $checksumPath = "$($_.FullName).sha256.txt"
    Remove-Item -LiteralPath $_.FullName -Force
    if (Test-Path -LiteralPath $checksumPath) {
      Remove-Item -LiteralPath $checksumPath -Force
    }
  }

Write-Host "Backup complete."
Write-Host "Saved to: $backupFile"
Write-Host "Checksum: $hashFile"
