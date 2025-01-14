# Add new function to ensure Node.js environment
ensure_node_env() {
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Load completion
}

# Update Node.js installation section
section_progress "Installing Node.js environment"
# Install nvm & node
if [ -x "$(command -v nvm)" ]; then
    output "${GREEN}nvm is already installed${NC}"
else
    output "Installing nvm..."
    # Download nvm installation script to temp file first
    TEMP_NVM_SCRIPT=$(mktemp)
    curl -s -o "$TEMP_NVM_SCRIPT" https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh
    # Run installation script quietly
    bash "$TEMP_NVM_SCRIPT" >/dev/null 2>&1
    rm -f "$TEMP_NVM_SCRIPT"
    
    # Set up nvm in current session
    ensure_node_env
    output "${GREEN}✓${NC} nvm installed successfully"
fi

# Check if node version > 20, else install it
ensure_node_env  # Ensure nvm is loaded
if command -v node >/dev/null 2>&1; then
    if [ "$(node -v | cut -d 'v' -f 2 | awk -F. '{print ($1 >= 20)}')" -eq 1 ]; then
        output "${GREEN}Node 20 or higher is already installed${NC}"
    else
        run_command "Installing Node.js 20..." bash -c '
            source $HOME/.nvm/nvm.sh
            nvm install 20
            nvm use 20
        '
    fi
else
    run_command "Installing Node.js 20..." bash -c '
        source $HOME/.nvm/nvm.sh
        nvm install 20
        nvm use 20
    '
fi

# Install yarn - with proper Node.js environment
ensure_node_env  # Ensure npm is available
if command -v yarn >/dev/null 2>&1; then
    output "${GREEN}Yarn is already installed${NC}"
else
    run_command "Installing Yarn..." bash -c '
        source $HOME/.nvm/nvm.sh
        npm install -g yarn
    '
fi

# Install pm2 - with proper Node.js environment
ensure_node_env  # Ensure yarn is available
if command -v pm2 >/dev/null 2>&1; then
    output "${GREEN}pm2 is already installed${NC}"
else
    run_command "Installing pm2..." bash -c '
        source $HOME/.nvm/nvm.sh
        yarn global add pm2
    '
fi

update_progress 10