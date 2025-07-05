section_progress "Configuring database"
# Install postgresql
if [ -x "$(command -v psql)" ]; then
    output "${GREEN}PostgreSQL is already installed${NC}"
else
    if [ "$PM" = "apt" ]; then
        quiet apt install -y postgresql
    elif [ "$PM" = "brew" ]; then
        quiet brew install postgresql
    fi
    install_status "PostgreSQL"
fi

# Configure PostgreSQL
if ! (sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw haddock) 2>/dev/null; then
    output "Configuring database... "
    {
        sudo -u postgres psql -c "CREATE USER haddock WITH PASSWORD 'haddock';" 
        sudo -u postgres psql -c "CREATE DATABASE haddock WITH OWNER haddock;"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE haddock TO haddock;"
    } >/dev/null 2>&1
    install_status "Database configuration"
fi