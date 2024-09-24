#/bin/sh
# This script is intended to be used to install the necessary dependencies for the project to run
# It is only intended to be used on Ubuntu and Debian based systems for now

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
    echo "\033[1;31mError: The script must be run as root\033[0m"
    read -p "Do you want to run the script as root? (y/n) " response
    if [ "$response" = "y" ]; then
        if ! [ -x "$(command -v sudo)" ]; then
            echo "\033[1;31mError: sudo is not installed.\033[0m"
            exit 1
        fi

        sudo sh install.sh
    else
        exit 1
    fi
    exit 0
fi

# Get OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
else
    OS=$(uname -s)
    VER=$(uname -r)
fi

# Get architecture
ARCH=$(uname -m)

# Print OS, version & architecture
echo "OS: $OS"
echo "Version: $VER"
echo "Architecture: $ARCH"

# Check if OS is compatible. Darwin is OK only for testing purposes
if [ "$OS" = "Ubuntu" ] || [ "$OS" = "Debian" ] || [ "$OS" = "Darwin" ]; then
    echo "\033[1;32mYour OS is compatible with the project"
else
    echo "\033[1;31mError: Incompatible OS"
    exit 1
fi

#tbd: check if the necessary dependencies are already installed

exit 0