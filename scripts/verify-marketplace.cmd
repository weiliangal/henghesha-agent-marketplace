@echo off
setlocal

echo Running backend smoke test...
cd /d "%~dp0..\apps\marketplace-api"
call npm.cmd run smoke
if errorlevel 1 exit /b 1

echo.
echo Running frontend production build...
cd /d "%~dp0..\apps\marketplace-web"
call npm.cmd run build
if errorlevel 1 exit /b 1

echo.
echo Marketplace verification completed successfully.
