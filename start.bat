@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist data\logs mkdir data\logs
set ELECTRON_ENABLE_LOGGING=1
rem ELECTRON_RUN_AS_NODE faz o Electron arrancar como Node simples (a app crasha em arranque)
set "ELECTRON_RUN_AS_NODE="
call npm start > data\logs\start-output.log 2>&1
echo Terminou com codigo %errorlevel%. Registo em data\logs\start-output.log
type data\logs\start-output.log
pause
