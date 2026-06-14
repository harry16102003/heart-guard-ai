$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$backendUrl = "http://127.0.0.1:8000/api/health"
$frontendUrl = "http://127.0.0.1:5173"

function Test-UrlReady {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-ForUrl {
  param(
    [string]$Url,
    [string]$Name,
    [int]$TimeoutSeconds = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-UrlReady -Url $Url) {
      Write-Host "$Name is ready." -ForegroundColor Green
      return $true
    }
    Start-Sleep -Seconds 1
  }

  Write-Host "$Name did not respond within $TimeoutSeconds seconds." -ForegroundColor Yellow
  return $false
}

if (-not (Test-Path $backendDir)) {
  throw "Backend folder not found: $backendDir"
}
if (-not (Test-Path $frontendDir)) {
  throw "Frontend folder not found: $frontendDir"
}

Write-Host ""
Write-Host "Launching HeartGuard AI..." -ForegroundColor Cyan
Write-Host "Project: $projectRoot" -ForegroundColor DarkCyan

if (Test-UrlReady -Url $backendUrl) {
  Write-Host "Backend is already running on port 8000." -ForegroundColor Green
} else {
  Write-Host "Starting HeartGuard backend..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendDir`"; py -3.11 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
}

if (Test-UrlReady -Url $frontendUrl) {
  Write-Host "Frontend is already running on port 5173." -ForegroundColor Green
} else {
  Write-Host "Starting HeartGuard frontend..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendDir`"; npm run dev -- --host 127.0.0.1 --port 5173"
}

$backendReady = Wait-ForUrl -Url $backendUrl -Name "Backend"
$frontendReady = Wait-ForUrl -Url $frontendUrl -Name "Frontend"

if ($backendReady -and $frontendReady) {
  Write-Host "Opening HeartGuard in your browser..." -ForegroundColor Cyan
  Start-Process $frontendUrl
  Write-Host "HeartGuard launched successfully." -ForegroundColor Green
} else {
  Write-Host "One or more services are still starting. Keep the opened terminal windows visible and open $frontendUrl after they finish." -ForegroundColor Yellow
}
