@echo off
REM Batch script wrapper for FabCar uninstaller
REM This calls the PowerShell script with appropriate parameters

echo 🗑️  FabCar Blockchain Project Uninstaller (Windows)
echo ================================================

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is required but not found
    echo Please install PowerShell or use the .ps1 script directly
    pause
    exit /b 1
)

REM Parse command line arguments
set "ARGS="
set "DRY_RUN=false"

:parse_args
if "%~1"=="" goto :run_script
if "%~1"=="--force" set "ARGS=%ARGS% -Force"
if "%~1"=="--keep-node-modules" set "ARGS=%ARGS% -KeepNodeModules"
if "%~1"=="--keep-docker-images" set "ARGS=%ARGS% -KeepDockerImages"
if "%~1"=="--dry-run" (
    set "ARGS=%ARGS% -DryRun"
    set "DRY_RUN=true"
)
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
shift
goto :parse_args

:show_help
echo Usage: %0 [OPTIONS]
echo Options:
echo   --force                Remove without confirmation
echo   --keep-node-modules    Don't remove node_modules directories
echo   --keep-docker-images   Don't remove Docker images
echo   --dry-run             Show what would be removed without doing it
echo   -h, --help            Show this help message
pause
exit /b 0

:run_script
echo Running PowerShell uninstaller...
echo.

REM Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "uninstall-fabcar.ps1" %ARGS%

if %errorlevel% equ 0 (
    if "%DRY_RUN%"=="true" (
        echo.
        echo 🔍 Dry run completed successfully
    ) else (
        echo.
        echo ✅ Uninstall completed successfully
    )
) else (
    echo.
    echo ❌ Uninstall failed with error code %errorlevel%
)

echo.
pause
