# SmartPark Stop Script
# Gracefully stops running backend (port 8080) and frontend (port 5173) processes

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Stopping SmartPark System Processes    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Stop 8080 (Spring Boot)
$backendConn = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($backendConn) {
    $pids = $backendConn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        Write-Host "Stopping backend process (PID: $p)..." -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Backend stopped." -ForegroundColor Green
} else {
    Write-Host "No process listening on port 8080." -ForegroundColor Gray
}

# Stop 5173 (Vite)
$frontendConn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendConn) {
    $pids = $frontendConn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        Write-Host "Stopping frontend process (PID: $p)..." -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ Frontend stopped." -ForegroundColor Green
} else {
    Write-Host "No process listening on port 5173." -ForegroundColor Gray
}

Write-Host "`nAll SmartPark services stopped." -ForegroundColor Green
