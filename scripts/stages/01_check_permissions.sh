#!/bin/bash

section_progress "Checking permissions"
if [ "$(id -u)" -ne 0 ]; then
    output "${BLUE}▶ Administrator privileges required${NC}"
    if ask_yes_no "Do you want to run the script as root?"; then
        sudo bash "$0" && exit 0
    fi
    exit 1
fi

update_progress 5
