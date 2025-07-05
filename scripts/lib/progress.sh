#!/bin/bash

source "$SCRIPT_DIR/lib/display.sh"

draw_progress_bar() {
    local progress=$1
    local width=$((TERM_WIDTH - 20))
    
    # Ensure progress doesn't exceed 100%
    [ $progress -gt 100 ] && progress=100
    
    local filled=$((width * progress / 100))
    local empty=$((width - filled))
    
    # Save cursor
    tput sc
    
    # Move to progress bar line
    tput cup $PROGRESS_LINE 0
    
    # Draw bar
    printf "${PURPLE}Progress: ["
    printf "%${filled}s" | tr ' ' '#'
    printf "%${empty}s" | tr ' ' '-'
    printf "] %3d%%${NC}" $progress
    
    # Restore cursor
    tput rc
}

update_progress() {
    local increment=$1
    
    # Calculate new progress
    current_progress=$((current_progress + increment))
    
    # Ensure we don't exceed 100%
    [ $current_progress -gt 100 ] && current_progress=100
    
    draw_progress_bar $current_progress
}

section_progress() {
    local title=$1
    output "\n${BLUE}[$current_step/$total_steps] $title ${NC}"
    ((current_step++))
    update_progress 10
}
