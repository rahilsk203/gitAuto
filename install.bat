@echo off
:: Auto-Installation Script for gitauto.py (Windows)
echo ==========================================
echo 🚀 Setting up gitauto.py for Windows...
echo ==========================================

:: Step 1: Check if Python is installed
echo.
echo 🔍 Checking for Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python is already installed.
) else (
    echo ❌ Python is not installed. Installing Python...
    :: Download and install Python silently
    curl -o python_installer.exe https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe
    start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1
    del python_installer.exe
    echo ✅ Python installed successfully.
)

:: Step 2: Check if Git is installed
echo.
echo 🔍 Checking for Git installation...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git is already installed.
) else (
    echo ❌ Git is not installed. Installing Git...
    :: Download and install Git silently
    curl -o git_installer.exe https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe
    start /wait git_installer.exe /VERYSILENT
    del git_installer.exe
    echo ✅ Git installed successfully.
)

:: Step 3: Create the gitAuto directory
echo.
echo 📂 Creating gitAuto directory...
set "GIT_AUTO_DIR=C:\gitAuto"
if not exist "%GIT_AUTO_DIR%" (
    mkdir "%GIT_AUTO_DIR%"
    echo ✅ Directory created: %GIT_AUTO_DIR%
) else (
    echo ✅ Directory already exists: %GIT_AUTO_DIR%
)

:: Step 4: Copy gitauto.py to the gitAuto directory (if not already there)
echo.
echo 📄 Copying gitauto.py to %GIT_AUTO_DIR%...
if exist "gitauto.py" (
    copy /Y "gitauto.py" "%GIT_AUTO_DIR%"
    echo ✅ gitauto.py copied successfully.
) else (
    if not exist "%GIT_AUTO_DIR%\gitauto.py" (
        echo ❌ gitauto.py not found! Please place it in the current directory.
        exit /b 1
    ) else (
        echo ✅ gitauto.py already exists in %GIT_AUTO_DIR%.
    )
)

:: Step 5: Create gitauto.bat for easy execution
echo.
echo 📝 Creating gitauto.bat...
(
    echo @echo off
    echo python "C:\gitAuto\gitauto.py" %%*
) > "%GIT_AUTO_DIR%\gitauto.bat"
echo ✅ gitauto.bat created successfully.

:: Step 6: Add C:\gitAuto to PATH (System-wide PATH, permanent)
echo.
echo 🔧 Adding %GIT_AUTO_DIR% to SYSTEM PATH permanently...
setx /M PATH "%PATH%;%GIT_AUTO_DIR%" >nul
set "PATH=%PATH%;%GIT_AUTO_DIR%"  :: Apply immediately
echo ✅ SYSTEM PATH updated successfully.

:: Step 7: Verify the setup
echo.
echo 🔍 Verifying gitauto command...
where gitauto >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ gitauto command is now available globally!
) else (
    echo ❌ Command not found. Please restart your terminal or PC and try again.
    exit /b 1
)

:: Step 8: Final message
echo.
echo ==========================================
echo 🎉 Setup completed successfully!
echo You can now run 'gitauto' from anywhere.
echo ==========================================
pause
