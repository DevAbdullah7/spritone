@echo off
chcp 65001 >nul
rem Run project in vscode
start code .

rem Export IPv4 and port number to print it togther 
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    goto :copy_ip
)

:copy_ip
rem Cleaning extra spaces 
set "IP=%IP: =%"
set "URL=http://%IP%:8562"

rem Copy full URL to clip board 
<nul set /p "=%URL%" | clip