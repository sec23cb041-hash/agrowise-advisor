@echo off
echo ============================================
echo  Agrowise Android Environment Setup
echo ============================================
echo.

REM Detect Android Studio location
set "STUDIO_PATH="
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if "%STUDIO_PATH%"=="" (
    echo [ERROR] Android Studio not found.
    echo Download from: https://developer.android.com/studio
    pause
    exit /b 1
)

echo [OK] Android Studio found at: %STUDIO_PATH%

REM Set environment variables
setx CAPACITOR_ANDROID_STUDIO_PATH "%STUDIO_PATH%"
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx ANDROID_SDK_ROOT "%LOCALAPPDATA%\Android\Sdk"

echo [SET] CAPACITOR_ANDROID_STUDIO_PATH = %STUDIO_PATH%
echo [SET] ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
echo [SET] ANDROID_SDK_ROOT = %LOCALAPPDATA%\Android\Sdk
echo.
echo Done. Close this window and open a new terminal.
pause
