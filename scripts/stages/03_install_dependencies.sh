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
DEPENDENCIES=("curl" "wget" "gpg" "git" "unzip" "redis-server" "qemu-system" "libvirt-daemon-system" "libvirt-dev" "bc" "build-essential")
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

# Install rbenv and Ruby
if [ -x "$(command -v rbenv)" ]; then
    output "${GREEN}✓${NC} rbenv is already installed"
else
    output "Installing rbenv..."
    if [ "$PM" = "apt" ]; then
        # Install rbenv dependencies
        run_command "Installing rbenv dependencies..." "sudo apt install -y autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev"
        
        # Install rbenv
        if run_command "Installing rbenv..." "curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-installer | bash"; then
            # Initialize rbenv in current session
            export PATH="$HOME/.rbenv/bin:$PATH"
            eval "$(rbenv init -)"
            
            # Install latest stable Ruby
            run_command "Installing Ruby 3.3.8..." "rbenv install 3.3.8"
            run_command "Setting global Ruby version..." "rbenv global 3.3.8"
            
            output "${GREEN}✓${NC} rbenv and Ruby installed successfully"
        else
            output "${RED}✗${NC} Failed to install rbenv"
            failed_installations+=("rbenv")
        fi
    elif [ "$PM" = "brew" ]; then
        if run_command "Installing rbenv..." "brew install rbenv ruby-build"; then
            # Initialize rbenv in current session
            export PATH="$HOME/.rbenv/bin:$PATH"
            eval "$(rbenv init -)"
            
            # Install latest stable Ruby
            run_command "Installing Ruby 3.3.8..." "rbenv install 3.3.8"
            run_command "Setting global Ruby version..." "rbenv global 3.3.8"
            
            output "${GREEN}✓${NC} rbenv and Ruby installed successfully"
        else
            output "${RED}✗${NC} Failed to install rbenv"
            failed_installations+=("rbenv")
        fi
    fi
fi

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

# Install Trivy
if [ -x "$(command -v trivy)" ]; then
    output "${GREEN}✓${NC} Trivy is already installed"
else
    output "Installing Trivy..."
    if [ "$PM" = "apt" ]; then
        # Install dependencies for Trivy repo
        run_command "Installing Trivy dependencies..." "sudo apt install -y wget apt-transport-https gnupg lsb-release"
        
        # Add Trivy key and repository
        run_command "Adding Trivy key..." "wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null"
        run_command "Adding Trivy repository..." "echo 'deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main' | sudo tee /etc/apt/sources.list.d/trivy.list"
        
        run_command "Updating package lists..." "sudo apt update"
        if run_command "Installing Trivy..." "sudo apt install -y trivy"; then
            output "${GREEN}✓${NC} Trivy installed successfully"
        else
            output "${RED}✗${NC} Failed to install Trivy"
            failed_installations+=("trivy")
        fi
    elif [ "$PM" = "brew" ]; then
        if run_command "Installing Trivy..." "brew install trivy"; then
            output "${GREEN}✓${NC} Trivy installed successfully"
        else
            output "${RED}✗${NC} Failed to install Trivy"
            failed_installations+=("trivy")
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

        run_command "Adding Hashicorp repository..." "wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg"
        run_command "Configuring repository..." 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list'
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