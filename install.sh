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

##############################################
#                Permissions                 #
##############################################

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

##############################################
#              OS identification             #
##############################################

# Get OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$(echo $VERSION_ID)
    CODENAME=$(echo $VERSION_CODENAME)
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
    CODENAME=$(lsb_release -sc)
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

##############################################
#                Compatibility               #
##############################################

# If OS is Ubuntu > 24, print error and exit (for whatever reason, Vagrant is not in HashiCorp' APT repo on Ubuntu > 24)
if [ "$OS" = "ubuntu" ] && [ "$(lsb_release -r | awk '{print $2}' | cut -d. -f1)" -ge 24 ]; then
    echo -e "${RED}Error: Ubuntu version is not supported${NC}"
    exit 1
fi

# Check if OS is compatible. Darwin is OK only for testing purposes
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ] || [ "$OS" = "Darwin" ]; then
    echo -e "${GREEN}Your OS is compatible with the project"
else
    echo -e "${RED}Error: Incompatible OS"
    exit 1
fi

##############################################
#                Dependencies                #
##############################################

# Set package manager
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
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

# Dependencies
# for every package check if it is installed, if not install it
DEPENDENCIES=("curl" "wget" "gpg" "git" "npm" "unzip" "redis-server" "qemu-system libvirt-daemon-system libvirt-dev")

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

# Install postgresql
if [ -x "$(command -v psql)" ]; then
    echo -e "${GREEN}PostgreSQL is already installed${NC}"
else
    if [ "$PM" = "apt" ]; then
        apt install -y postgresql
    elif [ "$PM" = "brew" ]; then
        brew install postgresql
    fi
fi

# Configure PostgreSQL
if (sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw haddock); then
    echo -e "${GREEN}Database haddock already exists${NC}"
else
    sudo -u postgres psql -c "CREATE USER haddock WITH PASSWORD 'haddock';"
    sudo -u postgres psql -c "CREATE DATABASE haddock WITH OWNER haddock;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE haddock TO haddock;"
fi

# Install nvm & node
if [ -x "$(command -v nvm)" ]; then
    echo -e "${GREEN}nvm is already installed${NC}"
else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Check if node version > 20, else install it
if [ -x "$(command -v node)" ]; then
    if [ "$(node -v | cut -d 'v' -f 2 | awk -F. '{print ($1 >= 20)}')" -eq 1 ]; then
        echo -e "${GREEN}Node 20 or higher is already installed${NC}"
    else
        nvm install 20
        nvm use 20
    fi
else
    nvm install 20
    nvm use 20
fi

# Install yarn
if [ -x "$(command -v yarn)" ]; then
    echo -e "${GREEN}Yarn is already installed${NC}"
else
    npm install -g yarn
fi

# Install pm2
if [ -x "$(command -v pm2)" ]; then
    echo -e "${GREEN}pm2 is already installed${NC}"
else
    yarn global add pm2
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
            # Add HashiCorp's GPG key if it doesn't exist
            if [ ! -f /usr/share/keyrings/hashicorp-archive-keyring.gpg ]; then
                wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
            fi
            # Add HashiCorp's APT repo
            echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $CODENAME main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
            # Install Vagrant
            sudo apt update && sudo apt install -y vagrant
        elif [ "$PM" = "brew" ]; then
            brew install --cask vagrant
        fi
    fi
fi

# Configuring Vagrant
vagrant plugin install vagrant-libvirt
vagrant box add generic/debian12 --provider=libvirt

if [ -x "$(command -v caddy)" ]; then
    echo -e "${GREEN}Caddy is already installed${NC}"
else
    if [ "$PM" = "apt" ]; then
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
        sudo apt update && sudo apt install -y caddy
    elif [ "$PM" = "brew" ]; then
        brew install caddy
    fi
fi

##############################################
#                   Caddy                    #
##############################################

# Stop Caddy
sudo systemctl stop caddy

# Set capabilities for Caddy
sudo setcap cap_net_bind_service=+ep $(which caddy)

# Remove default Caddyfile
sudo rm /etc/caddy/Caddyfile

# Create /etc/caddy/Caddyfile with basic configuration
echo "
:80 {
    root * /opt/haddock/frontend/dist
    try_files {path} /index.html
    file_server
}

import /opt/haddock/api/services.caddy
import /opt/haddock/api/app.caddy" | sudo tee /etc/caddy/Caddyfile

##############################################
#                  Network                   #
##############################################

IPIfConfigWebsite=$(curl -s ifconfig.me)
IPInterface=$(ip route get 1 | awk '{print $7}')
IP=$IPInterface
printf "We detected these public IP addresses for your server: \n"
printf "1. $IPIfConfigWebsite\n"
printf "2. $IPInterface\n"
printf "3. Custom IP\n"

while true; do
    read -p "Choose the public IP address of your server: " -n 1 -r choice
    echo
    case $choice in
        1)
            IP=$IPIfConfigWebsite
            break
            ;;
        2)
            IP=$IPInterface
            break
            ;;
        3)
            read -p "Enter the public IP address of your server: " IP
            # TODO: validate IP
            break
            ;;
        *)
            echo -e "${RED}Invalid choice, please try again${NC}"
            ;;
    esac
done

##############################################
#                  Haddock                   #
##############################################

# Get latest zip release from https://releases.haddock.ovh/main/release.zip
curl -L https://releases.haddock.ovh/main/release.zip -o /tmp/haddock.zip

# Unzip it to /opt/haddock
unzip /tmp/haddock.zip -d /opt/haddock

# Remove the zip file
rm /tmp/haddock.zip

##############################################
#                  Backend                   #
##############################################

#Create empty /opt/haddock/api/services.caddy
sudo touch /opt/haddock/api/services.caddy
sudo echo "" > /opt/haddock/api/services.caddy

#Create empty /opt/haddock/api/app.caddy
sudo touch /opt/haddock/api/app.caddy
sudo echo "" > /opt/haddock/api/app.caddy

#if no .env file, create it
if [ ! -f /opt/haddock/api/.env ]; then
    # Generate random JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")

    # Set API .env
    echo "
    DATABASE_URL=postgresql://haddock:haddock@localhost:5432/haddock
    REDIS_URL=redis://localhost:6379
    CADDY_ROOT_DIR=./
    CADDY_SERVICES_FILE=services.caddy
    CADDY_APP_FILE=app.caddy
    JWT_SECRET=$JWT_SECRET
    SERVER_IP=$IP
    GITHUB_CLIENT_ID=***REMOVED***
    GITHUB_CLIENT_SECRET=***REMOVED***
    FRONTEND_CONFIG=/opt/haddock/frontend/public/config.json
    FRONTEND_PORT=80
    PORT=3000
    " | sudo tee /opt/haddock/api/.env
fi

# Start API
cd /opt/haddock/api

# Install dependencies, migrate database and start API
yarn install
yarn migrate

pm2 start yarn --name api -- start

pm2 startup
pm2 save

##############################################
#                 Frontend                   #
##############################################

#if no .env file, create it
if [ ! -f /opt/haddock/frontend/.env ]; then
    # Set frontend .env, use IP from above
    echo "
        VITE_API_URL=http://$IP:3000
        VITE_SOCKET_URL=http://$IP:3001
        VITE_GITHUB_CLIENT_ID=***REMOVED***
    " | sudo tee /opt/haddock/frontend/.env
fi

# Start frontend
cd /opt/haddock/frontend

# Install dependencies and start frontend
yarn install
yarn build

##############################################
#                 Starting                   #
##############################################

# Start Caddy
sudo systemctl start caddy

exit 0