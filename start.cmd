@echo off
setlocal
cd /d "%~dp0"
set "COMMON_NODE="

rem Explorer does not inherit the Node path supplied to Codex.
if defined NODE_EXE if exist "%NODE_EXE%" set "COMMON_NODE=%NODE_EXE%"
if not defined COMMON_NODE for /f "delims=" %%N in ('where.exe node.exe 2^>nul') do if not defined COMMON_NODE set "COMMON_NODE=%%N"
if not defined COMMON_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "COMMON_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined COMMON_NODE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "COMMON_NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined COMMON_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "COMMON_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined COMMON_NODE goto missing_node

echo Same Old Faces
echo Using Node: "%COMMON_NODE%"
echo.
if /i "%~1"=="--check" goto checks
"%COMMON_NODE%" "%~dp0server.mjs" --open %*
set "COMMON_EXIT=%ERRORLEVEL%"
if not "%COMMON_EXIT%"=="0" goto failed
exit /b 0

:checks
"%COMMON_NODE%" "%~dp0check.mjs"
if errorlevel 1 goto failed
"%COMMON_NODE%" --test "%~dp0model.test.mjs" "%~dp0themes.test.mjs"
if errorlevel 1 goto failed
exit /b 0

:missing_node
echo Node.js was not found.
echo Install the LTS version from https://nodejs.org/ and run start.cmd again.
echo Or set NODE_EXE to the full path of an existing node.exe.
goto failed

:failed
echo.
echo The command did not complete. Read the error above.
if not defined COMMON_NO_PAUSE pause
exit /b 1
