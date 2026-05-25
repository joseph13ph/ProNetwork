Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Sembrando base de datos con usuarios y publicaciones..."
Push-Location $backend
try {
  & npm run seed
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}

if (-not (Test-Path (Join-Path $backend "node_modules"))) {
  Write-Host "No se encontro node_modules en backend. Instalando dependencias..."
  Push-Location $backend
  try {
    & npm install
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "No se encontro node_modules en frontend. Instalando dependencias..."
  Push-Location $frontend
  try {
    & npm install
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

Write-Host "Iniciando backend..."
Start-Process -FilePath "cmd.exe" -WorkingDirectory $backend -ArgumentList @('/k', 'npm run dev')

Start-Sleep -Seconds 1

Write-Host "Iniciando frontend..."
Start-Process -FilePath "cmd.exe" -WorkingDirectory $frontend -ArgumentList @('/k', 'npm run dev')

Start-Sleep -Seconds 2

Write-Host "Abriendo navegador en http://localhost:5173"
Start-Process "http://localhost:5173"