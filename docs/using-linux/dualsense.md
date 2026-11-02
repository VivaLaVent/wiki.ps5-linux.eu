---
title: DualSense controller
sidebar_position: 3
description: Use the DualSense over USB, and fix Bluetooth pairing on Marvell chips.
---

# DualSense controller

## USB

The DualSense works over USB with the `hid-playstation` kernel driver, which has been in the mainline kernel since 5.12. Check that it is loaded:

```bash
lsmod | grep hid_playstation
```

Buttons, rumble, the touchpad and the gyro all work over USB.

:::info[Bazzite: pair in Game Mode]
On Bazzite, pair the controller over Bluetooth in **Game Mode only**. Pairing from Desktop Mode does not work.
:::

## Bluetooth on Marvell chips

The developer c0w released an updated Bluetooth driver that supports both the Marvell and MediaTek wireless chips. Even so, many users can't get a DualSense to connect over Bluetooth. The steps below fix this on **Marvell** hardware.

:::warning[Marvell only]
This workaround has been tested and does **not** fix connection problems on MediaTek chips. Not sure which chip you have? See [Salina chip revision](/hardware/overview#salina-chip-revision).
:::

### Step 1: Run the fix script

The script:

- creates udev rules that keep the DualSense and the Marvell Bluetooth device powered,
- adds the DualSense to the TLP USB denylist (and installs TLP if needed),
- sets `UserspaceHID=false` in `/etc/bluetooth/input.conf`,
- installs Blueman if needed,
- restarts the TLP and Bluetooth services.

:::note[Arch-based distros only]
The script installs packages with `pacman`, so it only works as-is on Arch, CachyOS and other Arch-based distros. It must run as root.
:::

```bash
curl -sSL https://wiki.ps5-linux.eu/scripts/bluetooth/blfix.sh | sudo bash
```

You can [read the script](pathname:///scripts/bluetooth/blfix.sh) before running it.

### Step 2: Pair the controller

1. Put the DualSense into pairing mode: hold the **PS** button and the **Create** button together until the light bar flashes rapidly.
2. When the controller appears in the Blueman device list, select it and click **Connect**.
3. Right-click the paired controller in Blueman and make sure both the **Audio** and **Input** profiles are enabled.

### Step 3: If it doesn't reconnect after a reboot

The Marvell Bluetooth driver is still at an early stage, so automatic reconnection may fail after a reboot. If the controller doesn't reconnect:

1. Open Blueman.
2. Right-click the existing DualSense entry and select **Remove**.
3. Scan for devices again, put the controller in pairing mode and pair it as in step 2.
