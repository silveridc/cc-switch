@echo off
rem Compile the legacy-UI desktop installer with Inno Setup 6.
rem   tools\inno.cmd          -> version read from src-tauri\tauri.conf.json
rem   tools\inno.cmd 4.1.0    -> explicit version
setlocal
cd /d D:\projects\ccs

set "ISCC=%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe"
if not exist "%ISCC%" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if not exist "%ISCC%" set "ISCC=iscc"

set "VER=%~1"
if not "%VER%"=="" goto :havever
set "VERFILE=%TEMP%\ccs-inno-version.txt"
node -e "process.stdout.write(require('./src-tauri/tauri.conf.json').version)" > "%VERFILE%" 2>nul
set /p VER=<"%VERFILE%"
del "%VERFILE%" 2>nul
if not defined VER set "VER=0.0.0"
:havever

if not exist "installer\Output" mkdir "installer\Output"
"%ISCC%" /DAppVersion=%VER% installer\legacy-desktop.iss
set "RC=%ERRORLEVEL%"
echo INNO-EXIT=%RC% APPVERSION=%VER%
exit /b %RC%
