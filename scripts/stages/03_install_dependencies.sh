#!/bin/bash

section_progress "Installing system dependencies"

# Set package manager
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    if [ -x "$(command -v apt)" ]; then
        PM="apt"
    else
        output "${RED}Error: apt is not installed.${NC}"
        exit 1
    fi
elif [ "$OS" = "Darwin" ]; then
    if [ -x "$(command -v brew)" ]; then
        PM="brew"
    else
        output "${RED}Error: brew is not installed.${NC}"
        exit 1
    fi
fi

# Update system
output "\n${BLUE}▶ Installing dependencies...${NC}"
[ "$PM" = "apt" ] && {
    run_command "Updating system..." apt update
    run_command "Upgrading system..." apt upgrade -y
}

# Install dependencies
DEPENDENCIES=("curl" "wget" "gpg" "git" "unzip" "redis-server" "qemu-system" "libvirt-daemon-system" "libvirt-dev" "bc")
total=${#DEPENDENCIES[@]}
current=0

output "Installing dependencies..."
for dep in "${DEPENDENCIES[@]}"; do
    if ! command -v $dep >/dev/null 2>&1; then
        if run_command "Installing $dep..." $PM install -y $dep; then
            output "${GREEN}✓${NC} $dep installed successfully"
        else
            output "${RED}✗${NC} Failed to install $dep"
            failed_installations+=("$dep")
        fi
    fi
    update_progress 2
done

# Install Caddy with proper repository setup
if [ -x "$(command -v caddy)" ]; then
    output "${GREEN}✓${NC} Caddy is already installed"
else
    output "Installing Caddy..."
    if [ "$PM" = "apt" ]; then
        {
            # Add Caddy repository and key
            curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
            curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
            # Update and install
            sudo apt update
            sudo apt install caddy -y
        } >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            output "${GREEN}✓${NC} Caddy installed successfully"
        else
            output "${RED}✗${NC} Failed to install Caddy"
            failed_installations+=("caddy")
        fi
    elif [ "$PM" = "brew" ]; then
        if brew install caddy >/dev/null 2>&1; then
            output "${GREEN}✓${NC} Caddy installed successfully"
        else
            output "${RED}✗${NC} Failed to install Caddy"
            failed_installations+=("caddy")
        fi
    fi
fi

# Install Vagrant if user wants to
if ask_yes_no "Do you want to install Vagrant?"; then
    output "Installing Vagrant..."
    if [ "$PM" = "apt" ]; then
        # Detect OS codename
        if command -v lsb_release >/dev/null 2>&1; then
            CODENAME=$(lsb_release -cs)
        else
            CODENAME=$(grep -Po 'VERSION_CODENAME=\K[^"]*' /etc/os-release 2>/dev/null || echo "stable")
        fi
        
        run_command "Adding Hashicorp repository..." "curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/hashicorp.asc"
        run_command "Configuring repository..." "sudo bash -c 'echo \"deb [arch=amd64] https://apt.releases.hashicorp.com ${CODENAME} main\" > /etc/apt/sources.list.d/hashicorp.list'"
        run_command "Updating package lists..." "sudo apt update"
        if run_command "Installing Vagrant..." "sudo apt install -y vagrant"; then
            output "${GREEN}✓${NC} Vagrant installed successfully"
        else
            output "${RED}✗${NC} Failed to install Vagrant"
            failed_installations+=("vagrant")
        fi

        # Install Vagrant plugin and box
        run_command "Installing vagrant-libvirt plugin..." "vagrant plugin install vagrant-libvirt"
        run_command "Adding Debian 12 box..." "vagrant box add generic/debian12 --provider=libvirt --force"
        
        if [ $? -eq 0 ]; then
            output "${GREEN}✓${NC} Vagrant plugin and box installed successfully"
        else
            output "${RED}✗${NC} Failed to install Vagrant plugin or box"
            failed_installations+=("vagrant-components")
        fi
    elif [ "$PM" = "brew" ]; then
        if run_command "Installing Vagrant..." "brew install vagrant"; then
            output "${GREEN}✓${NC} Vagrant installed successfully"
        else
            output "${RED}✗${NC} Failed to install Vagrant"
            failed_installations+=("vagrant")
        fi

        # Install Vagrant plugin and box
        run_command "Installing vagrant-libvirt plugin..." "vagrant plugin install vagrant-libvirt"
        run_command "Adding Debian 12 box..." "vagrant box add generic/debian12 --provider=libvirt --force"
        
        if [ $? -eq 0 ]; then
            output "${GREEN}✓${NC} Vagrant plugin and box installed successfully"
        else
            output "${RED}✗${NC} Failed to install Vagrant plugin or box"
            failed_installations+=("vagrant-components")
        fi
    fi
fi

clear_output_area