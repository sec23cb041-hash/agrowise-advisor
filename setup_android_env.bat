@echo off
echo ============================================
echo  Agrowise Android Environment Setup
echo ============================================
echo.

REM Check if Android Studio is installed
if not exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    echo [ERROR] Android Studio not found at default path.
    echo.
    echo Please install Android Studio first:
    echo   https://developer.android.com/studio
    echo.
    echo During installation, ensure these components are checked:
    echo   - Android SDK
    echo   - Android SDK Platform Tools
    echo   - Android SDK Build Tools
    echo   - Android Virtual Device (AVD)
    echo.
    echo After installation, re-run this script as Administrator.
    pause
    exit /b 1
)

echo [OK] Android Studio found.
echo.

REM Set Capacitor Android Studio path
setx CAPACITOR_ANDROID_STUDIO_PATH "C:\Program Files\Android\Android Studio\bin\studio64.exe"
echo [SET] CAPACITOR_ANDROID_STUDIO_PATH

REM Set Android SDK paths
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx ANDROID_SDK_ROOT "%LOCALAPPDATA%\Android\Sdk"
echo [SET] ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
echo [SET] ANDROID_SDK_ROOT = %LOCALAPPDATA%\Android\Sdk

REM Add SDK tools to PATH
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\tools\bin"
echo [SET] PATH updated with platform-tools

echo.
echo ============================================
echo  Android environment configured successfully
echo ============================================
echo.
echo NEXT STEPS:
echo   1. Close this window
echo   2. Open a NEW terminal in the project folder
echo   3. Run: npx cap sync
echo   4. Run: npx cap open android
echo   5. In Android Studio: Build ^> Build APK
echo.
echo APK will be at:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
