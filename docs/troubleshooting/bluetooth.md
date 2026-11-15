---
title: Bluetooth and DualSense
sidebar_label: Bluetooth
sidebar_position: 7
description: "The PS5's Bluetooth chips under Linux, and fixes for controllers that don't pair, reconnect or stay connected."
hardware: [original, slim, pro]
applies_to: all
---

# Bluetooth and DualSense

Fixes for controllers that don't pair, connect or stay connected. Pairing itself is on [DualSense controller](/post-install/dualsense).

## Quick answers {#bluetooth-problems}

| Problem | Do this |
| --- | --- |
| No adapter | `bluetoothctl show` should list a controller with `Powered: yes`. After a warm reboot: power off and start with the loader |
| Controller paired in the PS5 OS doesn't connect, or `Refusing connection … unknown device` repeats | [Controller refused in a loop](#controller-refused-in-a-loop) |
| Slim: pairs but doesn't connect, or drops after seconds | A Linux-only address from v2.15 or older: update, power off, start with the loader, pair in the PS5 OS |
| Original PS5: the settings find no new devices | An old kernel quirk; update PS5 Bazzite Deck |
| Adapter disappears after a while | The chip went into USB power saving. PS5 Bazzite Deck prevents it; elsewhere, a udev rule that sets `power/control` to `on` for the chip (`1286:2059`, `0e8d:3603`, `0e8d:3605`) and the USB controller (`104d:9108`) |
| Gone after a warm reboot (IW620) | Reload `btusb`; if that fails, power off and start with the loader. See [warm reboots](#iw620-the-linux-only-address-and-warm-reboots) |
| No `hci0`, `Host halt failed, -110` in `dmesg` | The USB controller didn't start: update the kernel |
| An extra `hciN` with address `00:00:00:00:00:00` | The [fix script](/post-install/package-repository#fix-scripts-for-older-images) turns it off |
| Pairs once, doesn't reconnect after a restart | [Reconnect](#dualsense-pairs-once-but-wont-reconnect) |
| Pairing fails or needs repeating | `JustWorksRepairing = always` and `PairableTimeout = 0` in `/etc/bluetooth/main.conf`, and load `hidp` at boot. PS5 Bazzite Deck sets these |

## Which chip {#the-three-chips}

| Chip | USB ID | Consoles | Status |
| --- | --- | --- | --- |
| Marvell IW620 | `1286:2059` | Original PS5, some Slims | ✅ Working with the quirks below |
| MediaTek MT7961 | `0e8d:3603` | Most Slims | ✅ Working with the endpoint fix below |
| MediaTek MT7925 | `0e8d:3605` | PS5 Pro | ✅ Working from a cold boot with the Pro patch below |

```bash
lsusb | grep -i -e 1286:2059 -e 0e8d:3603 -e 0e8d:3605
```

Each needs kernel fixes, which PS5 Bazzite Deck carries in its [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches):

- <a id="iw620-marvell"></a>**IW620:** legacy LE commands for scanning, connecting and advertising; the repeated link key request answered (`btusb.ps5_iw620_linkkey=0` turns it off); private addresses resolved by the host (`btusb.ps5_iw620_le=0`).
- <a id="mediatek-on-the-slim"></a>**MediaTek on the Slim:** ACL data on the second bulk OUT endpoint (`btusb.ps5_tx_ep` overrides it).
- <a id="mediatek-on-the-pro"></a>**MediaTek on the Pro:** only interface 3 is used, ACL on endpoint `0x0d`, and the first reset is retried after a cold boot.

## One DualSense for the PS5 and Linux {#one-dualsense-for-the-ps5-and-linux}

The pairing made in the PS5 OS reaches Linux through the loader; the steps are on [DualSense: PS5 Bazzite Deck](/post-install/dualsense-bazzite-deck).

### Controller refused in a loop {#controller-refused-in-a-loop}

`Refusing connection … unknown device` repeats: Linux has the PS5 OS's address but not its pairing. Start Linux with bazzite-bootc-loader v2.9 or newer, see [Shared pairing](/post-install/dualsense-bazzite-deck#shared-pairing).

<a id="iw620-the-linux-only-address-and-warm-reboots"></a>Up to v2.15 the original PS5 and the Pro gave Linux a Bluetooth address of its own; from v2.16 Linux uses the console's address, see [Coming from the Linux-only address](/post-install/dualsense-bazzite-deck#linux-only-address).

## Reconnect after a restart {#dualsense-pairs-once-but-wont-reconnect}

On images where the adapter doesn't accept incoming connections (PS5 Bazzite Deck does this itself):

```ini title="/etc/systemd/system/bt-connectable.service"
[Unit]
Description=Make Bluetooth adapter accept incoming connections (DualSense reconnect)
After=bluetooth.service
Requires=bluetooth.service

[Service]
Type=oneshot
ExecStartPre=/usr/bin/sleep 2
ExecStart=/usr/bin/btmgmt connectable on
RemainAfterExit=yes

[Install]
WantedBy=bluetooth.target
```

```text title="/etc/modules-load.d/dualsense.conf"
hidp
hid_playstation
```

```bash
sudo systemctl enable --now bluetooth && sudo systemctl enable bt-connectable
```

## Arch and CachyOS on the IW620: fix script

Applies power, TLP and BlueZ settings and installs Blueman. Marvell consoles only; read [the script](pathname:///scripts/bluetooth/blfix.sh) first:

```bash
curl -sSL https://wiki.ps5-linux.eu/scripts/bluetooth/blfix.sh | sudo bash
```

Then pair in Blueman (hold **PS + Create** until the light flashes fast) and check that the **Audio** and **Input** profiles are on. If it doesn't reconnect after a restart: remove it in Blueman and pair again, or set up [Reconnect](#dualsense-pairs-once-but-wont-reconnect).
