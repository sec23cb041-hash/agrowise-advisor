@echo off
echo ============================================
echo  Agrowise Advisor - Android Build Script
echo ============================================
echo.

REM STEP 1 - Verify project root
if not exist package.json (
    echo [ERROR] package.json not found.
    echo Make sure you are inside the agrowise-advisor/ project folder.
    pause
    exit /b 1
)
echo [OK] Project root verified.

REM STEP 2 - Install Node dependencies
echo.
echo [STEP 2] Installing Node dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.

REM STEP 3 - Build the frontend
echo.
echo [STEP 3] Building React frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm run build failed.
    pause
    exit /b 1
)
if not exist dist\index.html (
    echo [ERROR] Build output not found in dist/
    pause
    exit /b 1
)
echo [OK] Frontend built successfully (dist/).

REM STEP 4 - Sync Capacitor
echo.
echo [STEP 4] Syncing Capacitor Android project...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] cap sync failed.
    pause
    exit /b 1
)
echo [OK] Capacitor synced.

REM STEP 5 - Check Android Studio
echo.
echo [STEP 5] Checking for Android Studio...
if not exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    echo [ERROR] Android Studio not found.
    echo.
    echo Please install Android Studio from:
    echo   https://developer.android.com/studio
    echo.
    echo Then run setup_android_env.bat as Administrator.
    echo Then re-run this script.
    pause
    exit /b 1
)
echo [OK] Android Studio found.

REM STEP 6 - Open Android Studio
echo.
echo [STEP 6] Opening Android Studio...
echo   - Wait for Gradle sync to complete (first run may take several minutes)
echo   - Then go to: Build ^> Build APK
echo   - APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
call npx cap open android

pause
