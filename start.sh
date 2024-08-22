#!/bin/bash

# 设置脚本标题
title="MAP-CAT"

# 检测网络连接
ping -c 1 www.baidu.com > /dev/null 2>&1
if [ $? -eq 0 ]; then
    begin
else
    echo "Network is NOT connected."
    exit 1
fi

begin() {
    node_version=$(node -v 2>/dev/null)
    if [ -z "$node_version" ]; then
        question
    else
        echo "Node.js seems to be installed."
        check_node_version
    fi
}

question() {
    echo "Node.js does not seem to be installed."
    read -p "Do you want to download and install Node.js? (y/n): " answer
    if [ "$answer" = "y" ]; then
        check_curl
    else
        exit 1
    fi
}

download() {
    echo "Downloading Node.js(V20.9.0)..."
    if command -v curl &> /dev/null; then
        curl -L https://registry.npmmirror.com/-/binary/node/v20.9.0/node-v20.9.0-linux-x64.tar.xz -o node.tar.xz --progress-bar
    elif command -v wget &> /dev/null; then
        wget -O node.tar.xz https://registry.npmmirror.com/-/binary/node/v20.9.0/node-v20.9.0-linux-x64.tar.xz
    else
        echo "Neither curl nor wget is available. Please install one of them."
        exit 1
    fi
    echo "Download complete."
    echo "Extracting Node.js..."
    tar xf node.tar.xz -C /usr/local --strip-components=1
    echo "Installation complete."
    check_node_version
}

update() {
    read -p "Do you want to update Node.js(V20.9.0)? (y/n): " update_question
    if [ "$update_question" = "y" ]; then
        check_curl
    else
        exit 1
    fi
}

check_node_version() {
    echo "Checking Node.js version..."
    node_version=$(node -v 2>/dev/null)
    if [[ $node_version =~ ^v([0-9]+)\. ]]; then
        major_version=${BASH_REMATCH[1]}
        if [ $major_version -gt 14 ]; then
            echo "Node.js version is OK."
            check_npm_registry
        else
            echo "Your Node.js version is too low. This project requires Node.js version 14 or higher."
            update
        fi
    else
        echo "Failed to determine Node.js version."
        update
    fi
}

check_npm_registry() {
    echo "Checking npm registry..."
    npm_reg=$(npm config get registry)
    if [ "$npm_reg" = "https://registry.npmjs.org/" ]; then
        set_npm_registry
    else
        echo "Your npm registry is already set to a mirror source."
        start_project
    fi
}

set_npm_registry() {
    read -p "Your npm registry is set to the official source. Do you want to switch to the mirror source? (y/n): " change_registry_question
    if [ "$change_registry_question" = "y" ]; then
        npm config set registry https://registry.npmmirror.com
        echo "Registry changed to https://registry.npmmirror.com"
        start_project
    else
        exit 1
    fi
}

start_project() {
    echo "Starting project..."
    npm i
    if [ $? -eq 0 ]; then
        echo "Installation complete."
        npm run start
    else
        echo "Installation failed."
        exit 1
    fi
}

# 主函数
begin
