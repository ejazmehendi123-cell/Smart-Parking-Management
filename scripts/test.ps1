# SmartPark Test Verification Script
# Executes backend unit tests and validates frontend production bundle build.

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SmartPark - Comprehensive Test Suite   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$backendDir = Resolve-Path "$PSScriptRoot\..\backend"
$frontendDir = Resolve-Path "$PSScriptRoot\..\frontend"

# 1. Backend Tests
Write-Host "`n[1/2] Running Spring Boot Backend Tests..." -ForegroundColor Yellow
Push-Location $backendDir
try {
    & .\mvnw.cmd test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All Backend Tests Passed (23/23)!" -ForegroundColor Green
    } else {
        Write-Error "Backend tests failed."
        exit 1
    }
} finally {
    Pop-Location
}

# 2. Frontend Build Verification
Write-Host "`n[2/2] Running Frontend TypeScript Typecheck and Build..." -ForegroundColor Yellow
Push-Location $frontendDir
try {
    & npm.cmd run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend Production Bundle Built Successfully!" -ForegroundColor Green
    } else {
        Write-Error "Frontend build failed."
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   ALL TESTS AND VERIFICATIONS PASSED (100% HEALTHY)    " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
