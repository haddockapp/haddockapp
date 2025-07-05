#!/bin/bash

source "$SCRIPT_DIR/lib/colors.sh"

# Increase header height and add buffer
HEADER_HEIGHT=9
OUTPUT_BUFFER=2

init_display() {
    clear
    
    # Get terminal size and enforce minimum width
    TERM_HEIGHT=$(tput lines)
    TERM_WIDTH=$(tput cols)
    [ "$TERM_WIDTH" -lt 80 ] && TERM_WIDTH=80
    
    # Adjust output area height based on terminal size with buffer
    OUTPUT_HEIGHT=$((TERM_HEIGHT - HEADER_HEIGHT - OUTPUT_BUFFER - 3))
    
    # Calculate positions with buffer space
    OUTPUT_START=$((HEADER_HEIGHT + OUTPUT_BUFFER))
    OUTPUT_END=$((OUTPUT_START + OUTPUT_HEIGHT))
    PROGRESS_LINE=$((OUTPUT_END + 1))
    
    # Initialize cursor position
    CURRENT_LINE=$OUTPUT_START
    
    # Draw initial layout
    draw_header
    draw_output_area
    draw_progress_bar 0
}

draw_header() {
    # Move to top and clear entire screen first
    tput clear
    tput cup 0 0
    
    # Print header with proper spacing
    cat << 'EOF'

  _    _           _     _            _    
 | |  | |         | |   | |          | |   
 | |__| | __ _  __| | __| | ___   ___| | __
 |  __  |/ _` |/ _` |/ _` |/ _ \ / __| |/ /
 | |  | | (_| | (_| | (_| | (_) | (__|   < 
 |_|  |_|\__,_|\__,_|\__,_|\___/ \___|_|\_\

EOF
    
    # Add welcome text with extra spacing
    echo -e "${BLUE}Welcome to Haddock Installation${NC}"
    echo -e "${DIM}Estimated installation time: 10-15 minutes${NC}"
    echo # Extra blank line for separation
}

draw_output_area() {
    # Draw top border
    tput cup $((OUTPUT_START - 1)) 0
    printf '%*s\n' "$TERM_WIDTH" '' | tr ' ' '-'
    
    # Clear output area
    for ((i=OUTPUT_START; i<OUTPUT_END; i++)); do
        tput cup $i 0
        tput el
    done
    
    # Draw bottom border
    tput cup $OUTPUT_END 0
    printf '%*s\n' "$TERM_WIDTH" '' | tr ' ' '-'
}

output() {
    local msg="$1"
    
    # Ensure we're within bounds
    [ $CURRENT_LINE -lt $OUTPUT_START ] && CURRENT_LINE=$OUTPUT_START
    [ $CURRENT_LINE -ge $OUTPUT_END ] && CURRENT_LINE=$OUTPUT_START
    
    # Move to current line and clear it
    tput cup $CURRENT_LINE 0
    tput el
    
    # Print message with color support
    echo -e "$msg"
    
    # Update cursor position
    ((CURRENT_LINE++))
}

clear_output_area() {
    # Clear all lines in output area
    for ((i=OUTPUT_START; i<OUTPUT_END; i++)); do
        tput cup $i 0
        tput el
    done
    
    # Reset cursor to start of output area
    CURRENT_LINE=$OUTPUT_START
    tput cup $CURRENT_LINE 0
}

spinner() {
    local pid=$1
    local msg=$2
    local spinstr='|/-\'
    
    # Move to output area and clear line
    tput cup $((OUTPUT_START)) 0
    tput el
    
    # Show initial message with color support
    echo -en "$msg"
    
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        tput cup $((OUTPUT_START)) ${#msg}
        echo -en " [${spinstr}]"
        local spinstr=$temp${spinstr%"$temp"}
        sleep 0.1
        tput cup $((OUTPUT_START)) ${#msg}
        echo -en "    "
    done
    
    # Clear line and show final message
    tput cup $((OUTPUT_START)) 0
    echo -e "$msg ${GREEN}✓${NC}"
}

restore_terminal() {
    # Move cursor below the progress bar
    tput cup $((PROGRESS_LINE + 2)) 0
    # Reset terminal but keep colors
    tput sgr0
    tput cnorm
}
