---
title: Bluetooth and DualSense
sidebar_label: Bluetooth
sidebar_position: 7
description: "The PS5's Bluetooth chips under Linux, the Linux-only address, and fixes for controllers that don't pair, reconnect or stay connected."
hardware: [original, slim, pro]
applies_to: all
---

# Bluetooth and DualSense

Fixes for controllers that don't pair, connect or stay connected. Pairing itself is on [DualSense controller](/post-install/dualsense).

## Quick answers {#bluetooth-problems}

<<<<<<< ours
| Problem | Do this |
| --- | --- |
| No adapter | `bluetoothctl show` should list a controller with `Powered: yes`. After a warm reboot: power off and start with the loader |
| Controller paired in the PS5 OS doesn't connect, or `Refusing connection … unknown device` repeats | [Controller refused in a loop](#controller-refused-in-a-loop) |
| Slim: pairs but doesn't connect, or drops after seconds | Linux-only address off (the default from v2.8.1): `ps5-bt-address off`, power off, start with the loader, pair again |
| Original PS5: the settings find no new devices | An old kernel quirk; update PS5 Bazzite Deck |
| Adapter disappears after a while | The chip went into USB power saving. PS5 Bazzite Deck prevents it; elsewhere, a udev rule that sets `power/control` to `on` for the chip (`1286:2059`, `0e8d:3603`, `0e8d:3605`) and the USB controller (`104d:9108`) |
| Gone after a warm reboot (IW620) | Reload `btusb`; if that fails, power off and start with the loader. See [warm reboots](#iw620-the-linux-only-address-and-warm-reboots) |
| No `hci0`, `Host halt failed, -110` in `dmesg` | The USB controller didn't start: update the kernel |
| An extra `hciN` with address `00:00:00:00:00:00` | The [fix script](/post-install/package-repository#fix-scripts-for-older-images) turns it off |
| Pairs once, doesn't reconnect after a restart | [Reconnect](#dualsense-pairs-once-but-wont-reconnect) |
| Pairing fails or needs repeating | `JustWorksRepairing = always` and `PairableTimeout = 0` in `/etc/bluetooth/main.conf`, and load `hidp` at boot. PS5 Bazzite Deck sets these |

## Which chip {#the-three-chips}
=======
## First checks

1. Check that the adapter is there and powered: `bluetoothctl show` should list a controller with `Powered: yes`.
2. Pair the DualSense with Linux once, on another profile than the one you use in the PS5 OS, see [One DualSense for the PS5 and Linux](/post-install/dualsense#one-dualsense-for-the-ps5-and-linux). On PS5 Bazzite Deck, `ps5-bt-address status` shows the Linux-only address.
3. After a warm reboot without Bluetooth, power off and start with the loader.
4. A Slim controller that connects and drops after a few seconds is an open problem: test with `ps5-bt-address off` and report the result.

## The three chips
>>>>>>> theirs

| Chip | USB ID | Consoles | Status |
| --- | --- | --- | --- |
| Marvell IW620 | `1286:2059` | Original PS5, some Slims | ✅ Working with the quirks below |
| MediaTek MT7961 | `0e8d:3603` | Most Slims | ✅ Working with the endpoint fix below |
| MediaTek MT7925 | `0e8d:3605` | PS5 Pro | ✅ Working from a cold boot with the Pro patch below |

```bash
lsusb | grep -i -e 1286:2059 -e 0e8d:3603 -e 0e8d:3605
```

<<<<<<< ours
Each needs kernel fixes, which PS5 Bazzite Deck carries in its [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches):
=======
All three drop off USB when they enter USB power saving (U3) and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the chip and for the Salina xHCI (`104d:9108`), see [Bluetooth troubleshooting](/troubleshooting/bluetooth#bluetooth-problems).

## IW620 (Marvell)

Two changes to `btusb` make the IW620 usable:

- **Quirks table entry.** The chip needs its own entry with the right quirks; without it `btusb` treats it as a generic adapter.
- **L2CAP connect while encryption is pending.** Controllers that connect before encryption has finished were dropped. The fix defers the connection until security is settled.

Both are in rmuxnet's kernel and PS5 Bazzite Deck; upstream has the quirks entry.

:::warning[Don't mix the LE command families on this chip]
A third change, a "legacy LE" workaround that marks the chip's extended LE scan and create-connection commands as broken so keyboards and mice reconnect, exists in rmuxnet's repository and was in some PS5 Bazzite Deck releases. On the IW620 it stops the settings from finding any new device: the scan uses the legacy commands while advertising still uses the extended ones (`0x2039`), and the chip refuses to mix them (`Busy`, `0x200b … Command Disallowed`). A DualSense that was already paired keeps working, which hides the problem. The current PS5 Bazzite Deck release drops the workaround; anyone porting it to another kernel should know what it does to the IW620.
:::

The IW620's Bluetooth side can also hang after a warm reboot. Reloading `btusb` brings it back; if not, power off and start with the loader.

## MediaTek on the Slim

The MT7961 only drains ACL data from its second bulk OUT endpoint (`0x02`). The Slim Bluetooth patch sends ACL there; the module parameter `btusb.ps5_tx_ep` overrides the endpoint (`0` = the driver's default). Confirmed on Slims.

## MediaTek on the Pro

The MT7925 (`0e8d:3605`) needs more than a table entry. The Pro Bluetooth patch:

- binds only interface 3 (the HCI controller) and doesn't claim the ISO interface,
- after the usual `btmtk` setup, sends the WMT activation `6f fc 06 01 06 02 00 00 01` as a class/interface request with `wIndex` 3, and routes HCI commands to `wIndex` 3 from then on,
- sends ACL data on bulk OUT `0x0d`: endpoint `0x0b` accepts one transfer and then NAKs forever,
- retries the first HCI Reset a few times, because from a cold boot it raced the controller becoming ready and left a dead `hci0` that only a reload of `btusb` revived.

Confirmed on Pros. Only `0e8d:3605` is touched; other consoles are unaffected. rmuxnet's kernel has an optional endpoint resync after the firmware setup instead (`btusb.ps5_ep_resync=1`, off by default); whether it needs the reload hasn't been confirmed.
>>>>>>> theirs

- <a id="iw620-marvell"></a>**IW620:** legacy LE commands for scanning, connecting and advertising; the repeated link key request answered (`btusb.ps5_iw620_linkkey=0` turns it off); private addresses resolved by the host (`btusb.ps5_iw620_le=0`).
- <a id="mediatek-on-the-slim"></a>**MediaTek on the Slim:** ACL data on the second bulk OUT endpoint (`btusb.ps5_tx_ep` overrides it).
- <a id="mediatek-on-the-pro"></a>**MediaTek on the Pro:** only interface 3 is used, ACL on endpoint `0x0d`, and the first reset is retried after a cold boot.

## One DualSense for the PS5 and Linux {#one-dualsense-for-the-ps5-and-linux}

The two setups and their steps are on [DualSense: PS5 Bazzite Deck](/post-install/dualsense-bazzite-deck). `ps5-bt-address status` shows which is on.

<<<<<<< ours
### Controller refused in a loop {#controller-refused-in-a-loop}
=======
| Chip | Method |
| --- | --- |
| IW620 | Marvell vendor command `0xFC22` ("set BD address", parameters `FE 06` plus the address) sent to the chip over a raw HCI socket. The chip keeps it in RAM; the PS5 OS gets the original back on its next start. |
| MediaTek | `btmgmt public-addr` with the adapter powered off, which the kernel can apply on this chip. On some MT7961 units the command completes but the old address stays; the fallback is MediaTek's own vendor command `0xFC1A` (the address little-endian), then a power cycle so the kernel reads it back. |

Why not `btmgmt public-addr` on the IW620: the kernel only sends a new public address to the chip during the adapter's first setup. Once the adapter is up, the kernel keeps the address in memory and never sends it to the chip.

Pitfalls found in testing:

- **Save the address and reuse it.** The chip's power-on default isn't fixed in hardware on every IW620 and can read differently after a cold boot. Deriving the Linux address fresh each boot then changes it, and the controller's stored pairing stops matching. The script saves the address on first use and reuses it.
- **The kernel and `bluetoothd` must see the new address too.** Otherwise pairings are stored under the old address on some boots and the new one on others. After the vendor command, the adapter is powered off and on with `bluetoothd` stopped, so it registers the adapter under the new address. If the chip loses the address during that re-initialisation, it is set once more without another re-initialisation.
- **It doesn't survive a warm reboot on the IW620** (see below).
- `bluetoothctl` may still show the original address on the IW620; the chip and the controller use the new one.

Source: [`files/ps5-bt-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-addr) and [`files/ps5-bt-pro-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-pro-addr).

### Controller refused in a loop

Symptom: the log repeats `Refusing connection … unknown device` and a controller never connects. It happens with the Linux-only address **off**: Linux then has the same address as the PS5 OS, so a controller that was paired with the PS5 OS connects to Linux as soon as it is switched on, and Linux, which has no pairing for it, refuses it, over and over.

Fix: turn the Linux-only address on, cold start, and pair the controller once in Linux on a profile of its own:
>>>>>>> theirs

`Refusing connection … unknown device` repeats: Linux has the PS5 OS's address but not its pairing. Either:

- **Share the pairing:** start Linux with bazzite-bootc-loader v2.9 or newer on PS5 Bazzite Deck v2.9 or newer, see [Shared pairing](/post-install/dualsense-bazzite-deck#shared-pairing).
- **Or give Linux its own address:** `ps5-bt-address on`, power off, start with the loader, and pair the controller in Game Mode on another profile, see [Linux-only address](/post-install/dualsense-bazzite-deck#linux-only-address).

### Is the Linux-only address applied?

With it applied, the second character of the address differs from the PS5's (`9C:…` becomes `9E:…`):

```bash
cat /sys/class/bluetooth/hci0/address
journalctl -u ps5-bt-addr -b --no-pager | tail -5   # why it wasn't applied
sudo systemctl restart ps5-bt-addr; sleep 3; cat /sys/class/bluetooth/hci0/address
```

<<<<<<< ours
`ps5-report` shows it on its Bluetooth line.
=======
`ps5-report` prints this as `linux-only BT address: on, applied` or `on, NOT applied`.

### IW620: the Linux-only address and warm reboots

Status: no fix yet. With the address on, a [warm reboot](/post-install/warm-reboot) can leave the IW620 hung: its Bluetooth side stops answering on USB (`device descriptor read/64, error -110`, `device not accepting address`), and sometimes Wi-Fi is gone too (`wlan_pcie ... probe ... failed`). Only a power-off and a start with the loader brings it back. With the address off, Bluetooth survives a warm reboot. A cold start always works, with or without the address.

The cause is the chip's state, not the restart itself: a warm reboot starts the new kernel without resetting any hardware, so the chip enters the next boot with the changed address and then gets the vendor command again. Ideas, none tested yet:

1. Undo the address before the warm reboot: send `0xFC22` with the original address on the way down, so the chip starts the next boot as after a cold one. This needs the original address kept somewhere, for example in `/run`.
2. Don't send it twice: on a warm reboot, read the chip's current address first and skip the command if it already has the Linux one (the MediaTek path does this).
3. Reset the Bluetooth side before the warm reboot: unbind `btusb` and reset the chip's USB device, or send an HCI reset.

Test plan for an IW620 console with both on: cold start and check `ps5-bt-address status` shows the Linux address and the controller connects; warm reboot and check the adapter comes back (`bluetoothctl show`) and the controller reconnects; ten warm reboots in a row, then a cold start, checking Wi-Fi each time; on failure, `sudo dmesg | grep -i -e btusb -e btmrvl -e "usb 5-"`.

:::note[PS5 Bazzite Deck]
While the address is on, the image replaces warm reboots with normal ones on IW620 consoles. `ps5-bt-address off` turns the address off instead.
:::

## Bluetooth problems {#bluetooth-problems}

- **The Bluetooth adapter disappears after a while:** the Bluetooth chips drop off USB when they enter USB power saving (U3), and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the IW620 Bluetooth (`1286:2059`), the MediaTek Bluetooth (`0e8d:3603`, `0e8d:3605`) and the Salina USB controller (`104d:9108`). PS5 Bazzite Deck does this by default.
- **Bluetooth is gone after a warm reboot (IW620):** the Bluetooth side of the chip can hang, more so with the Linux-only address on, see [Bluetooth](/troubleshooting/bluetooth#iw620-the-linux-only-address-and-warm-reboots). Reloading the `btusb` driver brings it back; if not, power off and start Linux with the loader again.
- **No `hci0` and `Host halt failed, -110` in `dmesg`:** the USB controller that carries Bluetooth did not start (`xhci_hcd 0000:40:00.6`). Kernels built from upstream during a few weeks had the Salina xHCI start disabled (`xhci_salina_init()` inside `#if 0`); every current kernel has it back. Update the kernel, or if you must stay on such a build, remove the `#if 0` and its `#endif` and rebuild, see [Kernel setup](/post-install/kernel#build-by-hand). Reloading modules does not help, because xHCI is built into the kernel. A `-110` error on the SATA controller (`40:00.3`) is harmless.
- **Phantom Bluetooth adapters** (an extra `hciN` with address `00:00:00:00:00:00`): the [package repository's fix script](/post-install/package-repository#fix-scripts-for-older-images) turns them off.
- **Pairing problems:** setting `JustWorksRepairing = always` and `PairableTimeout = 0` in `/etc/bluetooth/main.conf`, and loading the `hidp` module at boot, helps controllers pair and re-pair reliably.
- **The settings find no new devices on an original PS5:** a kernel quirk that mixes the LE command families, see [Bluetooth](/troubleshooting/bluetooth#iw620-marvell). On PS5 Bazzite Deck, update to the current release.

## Bluetooth on Marvell chips (Arch fix script)

If a DualSense won't connect over Bluetooth on a console with the Marvell IW620, the script below applies the power, TLP and BlueZ settings that have fixed it for most people. It is for **Marvell** consoles; on MediaTek consoles it doesn't change anything, and the fix there is in the kernel, see [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-slim).

:::warning[Marvell only]
Not sure which chip you have? See [Console models and chips](/getting-started/hardware#console-models-and-chips).
:::

### Step 1: Run the fix script

What the script does:

- writes udev rules that keep the DualSense and the Marvell Bluetooth device powered,
- adds the DualSense to the TLP USB denylist (and installs TLP if it is missing),
- sets `UserspaceHID=false` in `/etc/bluetooth/input.conf`,
- installs Blueman if it is missing,
- restarts the TLP and Bluetooth services.

:::note[Arch-based distros only]
The script installs packages with `pacman`, so as written it runs on Arch, CachyOS and other Arch-based distros. Run it as root.
:::

```bash
curl -sSL https://wiki.ps5-linux.eu/scripts/bluetooth/blfix.sh | sudo bash
```

You can [read the script](pathname:///scripts/bluetooth/blfix.sh) before running it.

### Step 2: Pair the controller

1. Put the DualSense into pairing mode: hold **PS** and **Create** together until the light bar flashes quickly.
2. When the controller shows up in Blueman, select it and click **Connect**.
3. Right-click the paired controller in Blueman and check that both the **Audio** and **Input** profiles are turned on.

### Step 3: If it doesn't reconnect after a reboot

The Marvell driver doesn't always restore the pairing after a restart. If the controller doesn't come back by itself:

1. Open Blueman.
2. Right-click the DualSense entry and select **Remove**.
3. Scan again, put the controller in pairing mode and pair it as in step 2.

For a permanent fix, make the adapter connectable at boot as described under [DualSense pairs once but won't reconnect](#dualsense-pairs-once-but-wont-reconnect).
>>>>>>> theirs

### IW620: the Linux-only address and warm reboots {#iw620-the-linux-only-address-and-warm-reboots}

No fix: the chip doesn't survive a warm reboot with the changed address. PS5 Bazzite Deck therefore restarts through the PS5 OS while the address is on. For warm reboots, turn it off (`ps5-bt-address off`), see [IW620 consoles](/post-install/warm-reboot-bazzite-deck#iw620-consoles).

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
