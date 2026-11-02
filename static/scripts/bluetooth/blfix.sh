#!/usr/bin/env bash
# DualSense + Marvell Bluetooth fix for PS5 Linux (Arch-based distros).
# Usage: curl -sSL https://wiki.ps5-linux.eu/scripts/bluetooth/blfix.sh | sudo bash

if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run this script as root (sudo)."
  exit 1
fi

echo "=== DualSense & Marvell Bluetooth Configuration Script ==="

DS_VENDOR="054c"
DS_PRODUCT="0ce6"
DUALSENSE_ID="${DS_VENDOR}:${DS_PRODUCT}"

MV_VENDOR="1286"
MV_PRODUCT="204e"

UDEV_FILE="/etc/udev/rules.d/99-dualsense-power.rules"

cat << EOF > "$UDEV_FILE"
ACTION=="add", SUBSYSTEM=="usb", ATTR{idVendor}=="$DS_VENDOR", ATTR{idProduct}=="$DS_PRODUCT", ATTR{power/control}="on"

ACTION=="add", SUBSYSTEM=="usb", ATTR{idVendor}=="$MV_VENDOR", ATTR{idProduct}=="$MV_PRODUCT", ATTR{power/control}="on"
EOF

udevadm control --reload-rules && udevadm trigger

if ! command -v tlp &> /dev/null; then
  echo "TLP not detected. Installing via pacman..."
  pacman -S --noconfirm tlp
fi

TLP_CONF="/etc/tlp.conf"
if [ -f "$TLP_CONF" ]; then
  if ! grep -q "$DUALSENSE_ID" "$TLP_CONF"; then
    echo "Configuring TLP denylist..."
    echo "USB_DENYLIST+=\" $DUALSENSE_ID\"" >> "$TLP_CONF"
  fi
else
  echo "Warning: $TLP_CONF not found. Skipping TLP block."
fi

BT_INPUT_CONF="/etc/bluetooth/input.conf"
if [ -f "$BT_INPUT_CONF" ]; then
  sed -i 's/^[#]*\s*UserspaceHID\s*=\s*.*/UserspaceHID=false/' "$BT_INPUT_CONF"
else
  echo "Warning: $BT_INPUT_CONF not found. Skipping Bluetooth input optimization."
fi

if ! command -v blueman-manager &> /dev/null; then
  pacman -S --noconfirm blueman
fi

systemctl restart tlp
systemctl restart bluetooth

echo "=== Automated Configuration Complete ==="
echo "Now pair the controller as described on https://wiki.ps5-linux.eu/using-linux/dualsense"
