@echo off
setlocal
cd /d "%~dp0..\apps\marketplace-api"
call npm.cmd run dev
