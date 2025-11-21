#!/bin/bash

section_progress "Detecting system configuration"

output "${BLUE}▶ Detecting system configuration...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
    CODENAME=$VERSION_CODENAME
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
    CODENAME=$(lsb_release -sc)
else
    OS=$(uname -s)
    VER=$(uname -r)
fi

ARCH=$(uname -m)
output "✓ System: $OS $VER ($ARCH)"
log_system_info

section_progress "Checking system compatibility"
if [ "$OS" = "ubuntu" ] && [ "$(lsb_release -r | awk '{print $2}' | cut -d. -f1)" -ge 25 ]; then
    output "${RED}✗ Unsupported Ubuntu version${NC}"
    exit 1
fi

if ! [[ "$OS" =~ ^(ubuntu|debian|Darwin)$ ]]; then
    output "${RED}✗ Unsupported operating system${NC}"
    exit 1
fi

output "${GREEN}✓ System compatible${NC}"
update_progress 5