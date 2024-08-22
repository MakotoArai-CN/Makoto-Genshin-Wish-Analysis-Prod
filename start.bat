@echo off
title MAP-CAT

:: 检测网络连接
ping -n 1 www.baidu.com >nul
if %errorlevel% == 0 (
    goto begin
) else (
    echo Network is NOT connected.
    goto endd
)

:begin
@echo off
node -v
if %errorlevel% == 0 (
    for /f "delims=" %%a in ('node -v 2^>nul') do (
        set nodeVersion=%%a
    )
) else (
   goto download
)
if %nodeVersion% =="" (
    goto question
) else (
    echo Node.js seems to be installed.
    goto checkNodeVersion
)

:question
echo Node.js does not seem to be installed.
set /p answer=Do you want to download and install Node.js? (y/n):
if /i %answer%==y (
    goto checkCurl
) else (
    goto endd
)

:download

echo Downloading Node.js(V20.9.0)...
curl -L https://registry.npmmirror.com/-/binary/node/v20.9.0/node-v20.9.0-x64.msi -o node.msi --progress-bar
echo Download complete.   
echo Please install Node.js using the downloaded file: node.msi
start node.msi
set /p nodeVersionquerstion=Do you have installed Node.js? (y/n):
if /i %nodeVersionquerstion%==y (
    del node.msi
    goto begin
) else (
    goto endd
)

:update
set /p updatequestion= Do you want to update Node.js(V20.9.0)? (y/n):
if /i %updatequestion%==y (
    goto checkCurl
) else (
    goto endd
)

:checkNodeVersion
echo Checking Node.js version...
if %nodeVersion:~1,2% gtr 14 (
    echo Node.js version is OK.
    goto checkNpmRegistry
) else (
    echo Your Node.js version is too low. This project requires Node.js version 14 or higher.
    goto update
)

:checkNpmRegistry
echo Checking npm registry...
for /f "tokens=2 delims=:" %%a in ('npm config get registry') do (
    set npmreg=%%a
)
if %npmreg%=="//registry.npmjs.org" (
    goto setNpmRegistry
) else (
    goto startProject
)

:setNpmRegistry
set /p changeRegistryQuestion=Your npm registry is set to the official source. Do you want to switch to the mirror source? (y/n):
if /i %changeRegistryQuestion%==y (
    call npm config set registry https://registry.npmmirror.com
    echo Registry changed to https://registry.npmmirror.com
    goto startProject
) else (
    goto endd
)

:startProject
echo Starting project...
call npm i
if %errorlevel% EQU 0 (
    echo Installation complete.   
    call npm run start
) else (
    echo Installation failed.
    goto endd
)

:endd