section_progress "Configuring network"
clear_output_area

# Get IPs first
output "${BLUE}▶ Detecting network configuration...${NC}"
sleep 1  # Add small delay to ensure curl command completes
IPIfConfigWebsite=$(curl -s ifconfig.me)
IPInterface=$(ip route get 1 | awk '{print $7}')

# Show available IPs
clear_output_area
output "Available IP addresses:"
sleep 0.5  # Add small delay for visual clarity

if [ -n "$IPIfConfigWebsite" ]; then
    output "  Public IP: $IPIfConfigWebsite"
fi

if [ -n "$IPInterface" ]; then
    output "  Local IP:  $IPInterface"
fi

sleep 1  # Give user time to read IPs

# Ask user for IP choice
while true; do
    echo
    read -p "Enter IP address to use: " IP
    if validate_ip "$IP"; then
        log_info "User entered IP: $IP"
        break
    else
        output "${RED}Invalid IP format. Use format: xxx.xxx.xxx.xxx${NC}"
        log_warn "Invalid IP entered: $IP"
    fi
done

output "${GREEN}✓${NC} Using IP address: ${BLUE}$IP${NC}"
log_info "Network configuration complete. Using IP: $IP"
clear_output_area