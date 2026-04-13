@echo off
setlocal

start "Marketplace API" cmd /k "cd /d %~dp0..\apps\marketplace-api && npm.cmd run dev"
start "Marketplace Web" cmd /k "cd /d %~dp0..\apps\marketplace-web && npm.cmd run dev"

echo Marketplace API and Web are starting in separate windows.
