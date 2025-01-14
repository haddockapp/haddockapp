#!/bin/bash

# Set script directory
export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts"

# Source configuration
source "$SCRIPT_DIR/config/settings.sh"

# Source libraries
for lib in "$SCRIPT_DIR"/lib/*.sh; do
    source "$lib"
done

# Initialize
START_TIME=$(date +%s)
current_progress=0
current_step=1
failed_installations=()

# Initialize display
init_display

# Run installation stages
for stage in "$SCRIPT_DIR"/stages/[0-9]*_*.sh; do
    source "$stage"
done

exit 0