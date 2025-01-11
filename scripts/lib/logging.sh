#!/bin/bash

log_info() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$INSTALL_LOG"
}

log_warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$INSTALL_LOG"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$INSTALL_LOG"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] Command output: $2" >> "$INSTALL_LOG"
}

log_cmd() {
    local cmd=$1
    local output=$2
    local status=$3
    {
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] [CMD] Running: $cmd"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] [CMD] Status: $status"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] [CMD] Output:"
        echo "$output"
        echo "----------------------------------------"
    } >> "$INSTALL_LOG"
}

log_system_info() {
    {
        echo "==================== System Information ===================="
        echo "Date: $(date)"
        echo "OS: $OS"
        echo "Version: $VER"
        echo "Architecture: $ARCH"
        echo "Kernel: $(uname -r)"
        echo "Memory: $(free -h 2>/dev/null || vm_stat)"
        echo "Disk Space: $(df -h / 2>/dev/null || df -h)"
        echo "========================================================="
    } >> "$INSTALL_LOG"
}
