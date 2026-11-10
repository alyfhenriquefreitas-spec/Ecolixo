@echo off
title Abrindo Projeto EcoLixo no VS Code...
echo ===================================================
echo   Abrindo o VS Code na pasta do projeto EcoLixo...
echo ===================================================

if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
    start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "%~dp0."
    exit
)

if exist "C:\Program Files\Microsoft VS Code\Code.exe" (
    start "" "C:\Program Files\Microsoft VS Code\Code.exe" "%~dp0."
    exit
)

start code "%~dp0."
exit
