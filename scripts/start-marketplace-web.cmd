@echo off
setlocal
cd /d "%~dp0..\apps\marketplace-web"
call npm.cmd run dev
