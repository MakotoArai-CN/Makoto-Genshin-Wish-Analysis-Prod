@echo off
chcp 65001 >nul
title Makoto Genshin Wish Analysis

echo.
echo ==========================================
echo   Makoto Genshin Wish Analysis System
echo ==========================================
echo.

:: 检测网络连接
echo [INFO] 检测网络连接...
ping -n 1 www.baidu.com >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 网络未连接
    goto :end
)
echo [SUCCESS] 网络连接正常

:: 检测 Bun
where bun >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Bun 已安装
    goto :use_bun
)

:: 检测 Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
        set NODE_MAJOR=%%a
    )
    set NODE_MAJOR=%NODE_MAJOR:~1%
    echo [SUCCESS] Node.js 已安装
    goto :use_node
)

echo [ERROR] 未找到 Bun 或 Node.js
echo.
set /p install_choice=是否下载并安装 Node.js? (y/n): 
if /i "%install_choice%"=="y" (
    goto :install_node
) else (
    goto :end
)

:install_node
echo [INFO] 正在下载 Node.js...
curl -L https://registry.npmmirror.com/-/binary/node/v20.9.0/node-v20.9.0-x64.msi -o node.msi --progress-bar
if %errorlevel% neq 0 (
    echo [ERROR] 下载失败
    goto :end
)
echo [INFO] 请安装下载的 node.msi 文件
start /wait node.msi
del node.msi
echo [INFO] 安装完成，请重新运行此脚本
goto :end

:use_bun
echo [INFO] 使用 Bun 运行...
call bun install
if %errorlevel% neq 0 (
    echo [ERROR] 依赖安装失败
    goto :end
)
call bun run start
goto :end

:use_node
echo [INFO] 使用 Node.js 运行...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] 依赖安装失败
    goto :end
)
call npm run start:node
goto :end

:end
echo.
pause