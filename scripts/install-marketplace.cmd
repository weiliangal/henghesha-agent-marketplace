@echo off
setlocal

echo Installing marketplace API dependencies...
cd /d "%~dp0..\apps\marketplace-api"
call npm.cmd install
if errorlevel 1 exit /b 1

echo Installing marketplace web dependencies...
cd /d "%~dp0..\apps\marketplace-web"
call npm.cmd install
if errorlevel 1 exit /b 1

echo.
echo Marketplace dependencies installed successfully.
