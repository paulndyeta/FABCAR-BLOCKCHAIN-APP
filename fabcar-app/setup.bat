@echo off
REM FabCar Blockchain Application Setup Script for Windows
REM This script helps set up the FabCar application environment

echo ==========================================
echo FabCar Blockchain Application Setup
echo ==========================================

echo Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js: 
    node --version
) else (
    echo ❌ Node.js is not installed. Please install Node.js v8.9.0 or higher.
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm: 
    npm --version
) else (
    echo ❌ npm is not installed. Please install npm v5.0.0 or higher.
    pause
    exit /b 1
)

REM Check Git
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Git: 
    git --version
) else (
    echo ❌ Git is not installed. Please install Git.
    pause
    exit /b 1
)

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker: 
    docker --version
    set DOCKER_AVAILABLE=true
) else (
    echo ❌ Docker is not installed.
    echo    Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    set DOCKER_AVAILABLE=false
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker Compose: 
    docker-compose --version
    set DOCKER_COMPOSE_AVAILABLE=true
) else (
    echo ❌ Docker Compose is not installed.
    echo    Docker Compose comes with Docker Desktop.
    set DOCKER_COMPOSE_AVAILABLE=false
)

echo.
echo ==========================================
echo Setting up FabCar Application...
echo ==========================================

REM Install JavaScript client dependencies
echo Installing JavaScript client dependencies...
cd fabcar\javascript
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install JavaScript client dependencies
    pause
    exit /b 1
)
echo ✓ JavaScript client dependencies installed

cd ..\..

REM Install chaincode dependencies
echo Installing chaincode dependencies...
cd chaincode\fabcar\javascript
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install chaincode dependencies
    pause
    exit /b 1
)
echo ✓ Chaincode dependencies installed

cd ..\..\..

echo.
echo ==========================================
echo Setup Summary
echo ==========================================

if "%DOCKER_AVAILABLE%"=="true" if "%DOCKER_COMPOSE_AVAILABLE%"=="true" (
    echo ✅ All prerequisites are installed!
    echo.
    echo Next steps:
    echo 1. Start the blockchain network:
    echo    cd first-network
    echo    ./byfn.sh generate
    echo    ./byfn.sh up
    echo.
    echo 2. Start the FabCar network:
    echo    cd ../fabcar
    echo    ./startFabric.sh javascript
    echo.
    echo 3. Run the application:
    echo    cd javascript
    echo    node enrollAdmin.js
    echo    node registerUser.js
    echo    node query.js
    echo    node invoke.js
) else (
    echo ⚠️  Setup incomplete - Docker is required
    echo.
    echo Please install Docker Desktop and run this script again.
    echo Download from: https://www.docker.com/products/docker-desktop
    echo.
    echo After installing Docker, you can:
    echo 1. Run this setup script again: setup.bat
    echo 2. Follow the steps in README.md
)

echo.
echo For detailed instructions, see README.md
echo ==========================================
pause
