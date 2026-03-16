@echo off
echo ============================================
echo  Agrowise Advisor - Android Build Script
echo ============================================
echo.

if not exist package.json (
    echo [ERROR] Run this from the agrowise-advisor project root.
    pause & exit /b 1
)

echo [STEP 1] Installing Node dependencies...
call npm install
if %ERRORLEVEL% neq 0 (echo [ERROR] npm install failed. & pause & exit /b 1)

echo [STEP 2] Building React frontend...
call npm run build
if %ERRORLEVEL% neq 0 (echo [ERROR] Build failed. & pause & exit /b 1)
if not exist dist\index.html (echo [ERROR] dist/ not found. & pause & exit /b 1)
echo [OK] Frontend built.

echo [STEP 3] Syncing Capacitor...
call npx cap sync android
if %ERRORLEVEL% neq 0 (echo [ERROR] cap sync failed. & pause & exit /b 1)
echo [OK] Capacitor synced.

echo [STEP 4] Opening Android Studio...

REM Detect Android Studio
set "STUDIO_PATH="
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if "%STUDIO_PATH%"=="" (
    echo [ERROR] Android Studio not found. Install from https://developer.android.com/studio
    pause & exit /b 1
)

start "" "%STUDIO_PATH%" "%~dp0android"

echo.
echo [OK] Android Studio is opening the project...
echo.
echo NEXT: Wait for Gradle sync, then go to Build ^> Build APK
echo APK:  android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
