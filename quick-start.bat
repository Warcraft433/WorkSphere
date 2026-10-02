@echo off
echo ===================================================
echo     Starting WorkSphere - Quick Start
echo ===================================================
echo.
echo [1/2] Launching Spring Boot Backend...
echo A new command prompt window will open for the backend server.
start "WorkSphere Backend (Spring Boot)" cmd /k "cd backend\worksphere-backend && mvn spring-boot:run"

echo.
echo Waiting 15 seconds for the backend to fully initialize...
timeout /t 15 /nobreak

echo.
echo [2/2] Opening Frontend...
start "" "frontend\worksphere-frontend\login.html"

echo.
echo Quick Start Complete! You can now log in using:
echo Username: admin
echo Password: admin123
echo.
pause
