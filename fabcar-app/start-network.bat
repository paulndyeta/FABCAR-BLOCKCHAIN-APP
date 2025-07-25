@echo off
REM FabCar Network Startup Script for Windows
REM This script starts the Hyperledger Fabric network and FabCar chaincode

echo ==========================================
echo Starting FabCar Blockchain Network
echo ==========================================

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Navigate to fabcar directory
cd fabcar

echo.
echo 🚀 Starting FabCar network...
echo This will:
echo   1. Start the basic Hyperledger Fabric network
echo   2. Create the channel
echo   3. Install and instantiate the FabCar chaincode
echo   4. Initialize the ledger with sample data

REM Use Git Bash to run the startFabric script
"C:\Program Files\Git\bin\bash.exe" -c "./startFabric.sh javascript"

if %errorlevel% equ 0 (
    echo.
    echo ✅ FabCar network started successfully!
    echo.
    echo Next steps:
    echo 1. Navigate to enhanced-client directory: cd ..\enhanced-client
    echo 2. Enroll admin: node enrollAdmin.js
    echo 3. Register user: node registerUser.js
    echo 4. Test queries: node query.js all
    echo 5. Start web interface: node app.js
    echo.
) else (
    echo.
    echo ❌ Failed to start FabCar network
    echo Please check the error messages above
    echo.
)

pause
