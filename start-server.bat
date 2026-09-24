@echo off
cd /d "%~dp0"
echo Opening http://localhost:5173
echo Close this window or press Ctrl+C to stop.
echo.
if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  echo.
)
call npm run dev
pause
