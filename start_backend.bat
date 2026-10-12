@echo off
title MANA CINEMA — Backend Server
cd /d %~dp0backend
echo Starting Spring Boot Backend on http://localhost:8080/api ...
mvn spring-boot:run
pause
