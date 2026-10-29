# SmartPark Start Script
# Launches Backend (Spring Boot: 8080) and Frontend (Vite: 5173)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting SmartPark Full-Stack System   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$backendDir = Resolve-Path "$PSScriptRoot\..\backend"
$frontendDir = Resolve-Path "$PSScriptRoot\..\frontend"

# Launch Backend
Write-Host "`n[1/2] Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; .\mvnw.cmd spring-boot:run" -PassThru
Write-Host "✓ Backend process launched (PID: $($backendProcess.Id))" -ForegroundColor Green

# Launch Frontend
Write-Host "`n[2/2] Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -PassThru
Write-Host "✓ Frontend process launched (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   SmartPark is booting up!                            " -ForegroundColor Green
Write-Host "   • Web App:         http://localhost:5173            " -ForegroundColor White
Write-Host "   • REST API:        http://localhost:8080/api        " -ForegroundColor White
Write-Host "   • Swagger UI:      http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
Write-Host "   • Health Check:    http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "`n   Demo Credentials:                                    " -ForegroundColor Cyan
Write-Host "   - User:     ejazmehendi123@gmail.com / Ejaz@123      " -ForegroundColor White
Write-Host "   - Admin:    admin@smartpark.com      / Admin@123     " -ForegroundColor White
Write-Host "   - Operator: operator@smartpark.com   / Operator@123  " -ForegroundColor White
Write-Host "   - Customer: customer@smartpark.com   / Customer@123  " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
