@echo off
title MANA CINEMA — Launch System
echo ===================================================
echo        🎬 MANA CINEMA — Starting Services
echo ===================================================
echo.
echo Starting Spring Boot Backend on http://localhost:8080/api ...
start "MANA CINEMA - Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo Starting React Frontend on http://localhost:3000 ...
start "MANA CINEMA - Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ===================================================
echo  ✅ Both services launched in separate windows!
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://localhost:8080/api
echo ===================================================
pause
