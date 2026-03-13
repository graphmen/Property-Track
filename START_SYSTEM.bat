@echo off
echo ==========================================
echo   GMB PROPERTY TRACK - MASTER START
echo ==========================================
echo.
echo 1. Starting Backend (FastAPI)...
start "GMB Backend" cmd /c "cd backend && run_backend.bat"

echo 2. Starting Frontend (Dashboard)...
start "GMB Frontend" cmd /c "cd frontend && run_frontend.bat"

echo.
echo Launching Dashboard in Browser...
timeout /t 5
start http://localhost:5173

echo.
echo All systems initialized. 
echo Please keep the two new terminal windows open while using the app.
echo.
pause
