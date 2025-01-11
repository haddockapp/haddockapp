#!/bin/bash

source "$SCRIPT_DIR/lib/logging.sh"

run_command() {
    local msg=$1
    shift
    local cmd="$*"
    local tmpfile=$(mktemp)
    
    log_info "Starting: $msg ($cmd)"
    clear_output_area
    
    # Execute command in background with output redirection
    (eval "$cmd") > "$tmpfile" 2>&1 &
    local pid=$!
    
    # Show spinner while command runs
    spinner $pid "$msg"
    wait $pid
    local status=$?
    
    log_cmd "$cmd" "$(cat $tmpfile)" "$status"
    rm -f "$tmpfile"
    
    [ $status -ne 0 ] && log_error "Command failed: $cmd" "$(cat $tmpfile)"
    return $status
}

quiet() {
    "$@" >/dev/null 2>&1
}

install_status() {
    local name=$1
    if [ $? -eq 0 ]; then
        output "\r${GREEN}✓${NC} $name installed successfully"
    else
        output "\r${RED}✗${NC} Failed to install $name"
        failed_installations+=("$name")
    fi
}

error_handler() {
    local exit_code=$?
    local line_number=$1
    local cmd=$(sed -n ${line_number}p "$0")
    log_error "Error on line $line_number (exit code: $exit_code)" "Command: $cmd"
    output "${RED}Error on line $line_number. Check $INSTALL_LOG for details.${NC}"
}

cleanup() {
    [ $? -ne 0 ] && {
        output "\n${YELLOW}⚠️  Installation interrupted. Cleaning up...${NC}"
        rm -f /tmp/haddock.zip
        log "Installation cleanup performed"
    }
}

validate_ip() {
    local ip=$1
    local IFS='.'
    if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        read -ra ADDR <<< "$ip"
        for i in "${ADDR[@]}"; do
            [ $i -lt 0 ] || [ $i -gt 255 ] && return 1
        done
        return 0
    fi
    return 1
}

ask_yes_no() {
    local prompt=$1
    local default=${2:-"n"}
    local answer

    while true; do
        read -p "$prompt [y/n] (default: $default) " answer
        answer=${answer:-$default}
        case $answer in
            [Yy]* ) return 0 ;;
            [Nn]* ) return 1 ;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}