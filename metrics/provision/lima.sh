#!/bin/bash
set -e

sudo apt-get update
sudo apt-get install -y python3-venv

SERVICE_NAME="metrics"
SERVICE_DIR="/opt/$SERVICE_NAME"
PYTHON_SCRIPT="__main__.py"
VENV_DIR="$SERVICE_DIR/venv"
SYSTEMD_SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
CONFIG_FILE="$SERVICE_DIR/config.py"
DEPLOYMENT_DIR="/workspace/source"

# Ensure service directory exists
sudo mkdir -p "$SERVICE_DIR"

echo "Copying files to $SERVICE_DIR..."
sudo cp -r /mnt/metrics/* "$SERVICE_DIR"

cd "$SERVICE_DIR"

echo "Creating virtual environment..."
sudo python3 -m venv "$VENV_DIR"

if [[ -f "$SERVICE_DIR/requirements.txt" ]]; then
    echo "Installing dependencies..."
    source "$VENV_DIR/bin/activate"
    pip install -r "$SERVICE_DIR/requirements.txt"
    deactivate
fi

echo "Writing config.py to $CONFIG_FILE..."
sudo tee "$CONFIG_FILE" > /dev/null <<EOF
class Config:
    WS_PORT = 55000
    HTTP_PORT = 55001
    COMPOSE_PATH = "${DEPLOYMENT_DIR}/compose.yml"
EOF

echo "Creating systemd service file at $SYSTEMD_SERVICE_FILE..."
sudo tee "$SYSTEMD_SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Metrics Service
After=network.target

[Service]
WorkingDirectory=$SERVICE_DIR
ExecStart=$VENV_DIR/bin/python $SERVICE_DIR/$PYTHON_SCRIPT
Restart=always
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd units..."
sudo systemctl daemon-reload

echo "Enabling and starting $SERVICE_NAME..."
sudo systemctl enable "$SERVICE_NAME" --now

echo "Deployment complete."
