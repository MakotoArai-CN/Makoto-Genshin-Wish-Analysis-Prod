#!/bin/bash

# ==========================================
# Makoto Genshin Wish Analysis - 启动脚本
# ==========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测网络连接
check_network() {
    print_info "检测网络连接..."
    if ping -c 1 www.baidu.com > /dev/null 2>&1; then
        print_success "网络连接正常"
        return 0
    else
        print_error "网络未连接"
        return 1
    fi
}

# 检测 Bun 是否安装
check_bun() {
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun --version)
        print_success "Bun 已安装 (v$BUN_VERSION)"
        return 0
    else
        print_warning "Bun 未安装"
        return 1
    fi
}

# 检测 Node.js 是否安装
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js 已安装 ($NODE_VERSION)"
        return 0
    else
        print_warning "Node.js 未安装"
        return 1
    fi
}

# 安装 Bun
install_bun() {
    print_info "正在安装 Bun..."
    curl -fsSL https://bun.sh/install | bash
    
    # 重新加载环境变量
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    
    if check_bun; then
        print_success "Bun 安装成功"
    else
        print_error "Bun 安装失败，请手动安装"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "正在安装依赖..."
    
    if command -v bun &> /dev/null; then
        bun install
    elif command -v npm &> /dev/null; then
        npm install
    else
        print_error "未找到包管理器"
        exit 1
    fi
    
    print_success "依赖安装完成"
}

# 启动项目
start_project() {
    print_info "正在启动项目..."
    
    if command -v bun &> /dev/null; then
        bun run start
    elif command -v node &> /dev/null; then
        npm run start:node
    else
        print_error "未找到运行时环境"
        exit 1
    fi
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  Makoto Genshin Wish Analysis System"
    echo "=========================================="
    echo ""

    # 检测网络
    if ! check_network; then
        exit 1
    fi

    # 优先使用 Bun
    if check_bun; then
        install_dependencies
        start_project
    elif check_node; then
        # Node.js 版本检查
        NODE_MAJOR=$(node -v | cut -d. -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js 版本过低，建议使用 v18 或更高版本"
            read -p "是否继续? (y/n): " continue_choice
            if [ "$continue_choice" != "y" ]; then
                exit 1
            fi
        fi
        install_dependencies
        start_project
    else
        read -p "是否安装 Bun 运行时? (y/n): " install_choice
        if [ "$install_choice" = "y" ]; then
            install_bun
            install_dependencies
            start_project
        else
            print_error "需要 Bun 或 Node.js 运行时"
            exit 1
        fi
    fi
}

# 运行主函数
main