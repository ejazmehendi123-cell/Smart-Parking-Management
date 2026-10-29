# SmartPark Setup Script
# Verifies prerequisites, prepares PostgreSQL database, compiles backend, and installs frontend dependencies.

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SmartPark — Automated Setup Script     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check Java
Write-Host "`n[1/5] Checking Java version..." -ForegroundColor Yellow
try {
    $javaVer = java -version 2>&1 | Select-String "version"
    Write-Host "✓ Java detected: $javaVer" -ForegroundColor Green
} catch {
    Write-Error "Java 21 is required but not found on PATH."
    exit 1
}

# 2. Check Node & npm
Write-Host "`n[2/5] Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    $npmVer = npm -v
    Write-Host "✓ Node detected: $nodeVer (npm: $npmVer)" -ForegroundColor Green
} catch {
    Write-Error "Node.js and npm are required but not found on PATH."
    exit 1
}

# 3. Check PostgreSQL & Prepare Database
Write-Host "`n[3/5] Checking PostgreSQL service & creating database..." -ForegroundColor Yellow
$pgService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
if ($pgService) {
    Write-Host "✓ PostgreSQL Service is running: $($pgService.DisplayName)" -ForegroundColor Green
} else {
    Write-Warning "PostgreSQL service not detected in running state. Ensure PostgreSQL is active on port 5432."
}

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (Test-Path $psqlPath) {
    $env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
    $dbUser = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }
    
    $checkDb = & $psqlPath -U $dbUser -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = 'smartpark_db'" 2>&1
    if ($checkDb -match "1") {
        Write-Host "✓ Database 'smartpark_db' already exists." -ForegroundColor Green
    } else {
        Write-Host "Creating database 'smartpark_db'..." -ForegroundColor Cyan
        & $psqlPath -U $dbUser -h localhost -c "CREATE DATABASE smartpark_db;"
        Write-Host "✓ Database 'smartpark_db' created successfully." -ForegroundColor Green
    }
} else {
    Write-Warning "psql.exe not found at standard path. Ensure database 'smartpark_db' is created."
}

# 4. Compile Backend
Write-Host "`n[4/5] Compiling Spring Boot Backend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\backend"
try {
    .\mvnw.cmd clean compile
    Write-Host "✓ Backend compiled successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

# 5. Install Frontend Dependencies & Build
Write-Host "`n[5/5] Installing Frontend dependencies & building bundle..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\frontend"
try {
    npm install
    npm run build
    Write-Host "✓ Frontend built successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   SmartPark Setup Complete! Run .\scripts\start.ps1    " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
