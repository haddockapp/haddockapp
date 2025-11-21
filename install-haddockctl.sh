#!/bin/bash

#############################################
# Install haddockctl to system PATH
#############################################

set -e

GREEN='\033[1;32m'
RED='\033[1;31m'
BLUE='\033[1;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HADDOCKCTL="$SCRIPT_DIR/haddockctl"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Installing haddockctl to system PATH    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗${NC} This script must be run as root (use sudo)"
    exit 1
fi

# Check if haddockctl exists
if [ ! -f "$HADDOCKCTL" ]; then
    echo -e "${RED}✗${NC} haddockctl not found at $HADDOCKCTL"
    exit 1
fi

# Make sure it's executable
chmod +x "$HADDOCKCTL"

# Create symlink
echo -e "${BLUE}ℹ${NC} Creating symlink in /usr/local/bin..."
ln -sf "$HADDOCKCTL" /usr/local/bin/haddockctl

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} haddockctl installed successfully!"
    echo ""
    echo "You can now run 'haddockctl' from anywhere:"
    echo "  $ sudo haddockctl"
else
    echo -e "${RED}✗${NC} Failed to create symlink"
    exit 1
fi

echo ""

