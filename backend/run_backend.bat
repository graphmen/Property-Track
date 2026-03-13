@echo off
echo Starting GMB Property Track Backend...
:: Get the directory of the script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."

echo Current Directory: %cd%

if not exist "backend\venv\Scripts\activate.bat" (
    echo Error: Virtual environment not found in backend\venv
    pause
    exit /b
)

call .\backend\venv\Scripts\activate
echo Virtual environment activated.

python -m backend.main
if %ERRORLEVEL% neq 0 (
    echo.
    echo Backend failed with error code %ERRORLEVEL%
)

pause
