#!/bin/bash
# This script is intended to be used to install the necessary dependencies for the project to run
# It is only intended to be used on Ubuntu and Debian based systems for now

# Colors
GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

# Print project name
# Made on: https://patorjk.com/software/taag/

echo '
  _    _           _     _            _    
 | |  | |         | |   | |          | |   
 | |__| | __ _  __| | __| | ___   ___| | __
 |  __  |/ _` |/ _` |/ _` |/ _ \ / __| |/ /
 | |  | | (_| | (_| | (_| | (_) | (__|   < 
 |_|  |_|\__,_|\__,_|\__,_|\___/ \___|_|\_\                                         
'

# Check if root, if not ask to run as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}Error: The script must be run as root${NC}"
    read -p "Do you want to run the script as root? (y/n) " -n 1 -r response
    echo
    if [ "$response" = "y" ]; then
        if ! [ -x "$(command -v sudo)" ]; then
            echo -e "${RED}Error: sudo is not installed.${NC}"
            exit 1
        fi

        sudo bash install.sh
    else
        exit 1
    fi
    exit 0
fi

# Get OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$(echo $VERSION_ID)
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
else
    OS=$(uname -s)
    VER=$(echo uname -r)
fi

# Get architecture
ARCH=$(uname -m)

# Print OS, version & architecture
echo "OS: $OS"
echo "Version: $VER"
echo "Architecture: $ARCH"

# If OS is Ubuntu > 24, print error and exit (for whatever reason, Vagrant is not in HashiCorp' APT repo on Ubuntu > 24)
if [ "$OS" = "Ubuntu" ] && [ "$VER" > 24 ]; then
    echo -e "${RED}Error: Ubuntu version is not supported${NC}"
    exit 1
fi

# Check if OS is compatible. Darwin is OK only for testing purposes
if [ "$OS" = "Ubuntu" ] || [ "$OS" = "Debian" ] || [ "$OS" = "Darwin" ]; then
    echo -e "${GREEN}Your OS is compatible with the project"
else
    echo -e "${RED}Error: Incompatible OS"
    exit 1
fi

# Set package manager
if [ "$OS" = "Ubuntu" ] || [ "$OS" = "Debian" ]; then
    if [ -x "$(command -v apt)" ]; then
        PM="apt"
    else
        echo -e "${RED}Error: apt is not installed.${NC}"
        exit 1
    fi
elif [ "$OS" = "Darwin" ]; then
    if [ -x "$(command -v brew)" ]; then
        PM="brew"
    else
        echo -e "${RED}Error: brew is not installed.${NC}"
        exit 1
    fi
fi

# Update package manager & system
if [ "$PM" = "apt" ]; then
    apt update -y && apt upgrade -y
elif [ "$PM" = "brew" ]; then
    brew update && brew upgrade
fi

# Dependencies (for now): git, nodejs, npm
# for every package check if it is installed, if not install it
DEPENDENCIES=("wget" "gpg" "git" "nodejs" "npm")

for i in "${DEPENDENCIES[@]}"; do
    if [ -x "$(command -v $i)" ]; then
        echo -e "${GREEN}$i is already installed${NC}"
    else
        if [ "$PM" = "apt" ]; then
            apt install -y $i
        elif [ "$PM" = "brew" ]; then
            brew install $i
        fi
    fi
done

# Install pm2
if [ -x "$(command -v pm2)" ]; then
    echo -e "${GREEN}pm2 is already installed${NC}"
else
    npm install pm2 -g
fi

# Check if Vagrant is installed
if [ -x "$(command -v vagrant)" ]; then
    echo -e "${GREEN}Vagrant is already installed${NC}"
else
    echo -e "${RED}Error: Vagrant is not installed${NC}"
    
    # Ask to install Vagrant
    read -p "Do you want to install Vagrant? (y/n) " -n 1 -r response
    echo
    # If yes, install Vagrant
    if [ "$response" = "y" ]; then
        if [ "$PM" = "apt" ]; then
            if [ ! -f /usr/share/keyrings/hashicorp-archive-keyring.gpg ]; then
                wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
            fi
            echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
            sudo apt update && sudo apt install -y vagrant
        elif [ "$PM" = "brew" ]; then
            brew install --cask vagrant
        fi
    fi
fi



exit 0