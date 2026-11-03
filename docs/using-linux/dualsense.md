---
title: DualSense controller
sidebar_position: 3
description: Use the DualSense over USB or Bluetooth, keep one pairing for the PS5 and Linux, and fix pairing on Marvell chips.
---

# DualSense controller

The DualSense works over USB and over Bluetooth on every PS5 model. This page covers both, how to keep one controller paired with the PS5 OS and Linux at the same time, and what to do when pairing fails.

## USB

The kernel's `hid-playstation` driver, part of mainline Linux for years, handles the DualSense over a cable. Check that it is loaded:

```bash
lsmod | grep hid_playstation
```

Everything on the controller works over USB: buttons, sticks, rumble, touchpad, gyro, speaker and headphone jack.

:::info[Bazzite: pair in Game Mode]
On Bazzite, pair a controller over Bluetooth from **Game Mode**, not from the desktop. The desktop's Bluetooth settings don't complete the pairing with a DualSense.
:::

## One DualSense for the PS5 and Linux

The PS5 OS and Linux share the same Bluetooth chip, and therefore the same Bluetooth address. A DualSense with pairing profiles keeps one pairing per host address, so pairing it with Linux replaces the PS5 pairing, and the other way around. Normally you'd have to pair again every time you switch systems.

Giving Linux its own Bluetooth address solves this. It is a boot-time service ([`ps5-bt-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-addr), and [`ps5-bt-pro-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-pro-addr) for the PS5 Pro) that any image can run; PS5 Bazzite Deck includes both and turns them on by default. The DualSense then keeps one pairing for the PS5 on one profile, and one for Linux on another. No re-pairing and no USB cable are needed when you switch.

Pairing profiles came to the DualSense with its software version **0630**, released with PS5 system software 12.00. A controller on older software has no profiles: PS + Square or Triangle does nothing. A jailbroken console on older system software can't update the controller, but a PC can: Sony's [DualSense firmware updater](https://controller.dl.playstation.net/controller/lang/en/fwupdater.html) for Windows, over USB. Check the version in the PS5 OS under Settings → Accessories → Controller (General) → Wireless Controller Device Software.

**Pair the DualSense with Linux** (make sure it is already paired with the PS5 OS on one profile):

1. Start Linux.
2. On the DualSense, select a different profile, for example **PS + Square**.
3. Put the DualSense in pairing mode.
4. Pair it in the Linux Bluetooth settings.
5. Start the PS5 OS, select the PS5 profile on the DualSense, and check that it connects.
6. Start Linux again, select the Linux profile, and check that it connects.

**Check or change the setting:** `ps5-bt-address status` shows the address in use; `ps5-bt-address off` turns the feature off (pair the DualSense with Linux again afterwards).

**Known limits:**

- `bluetoothctl` and the Bluetooth settings still show the original address. The chip and the DualSense use the new one.
- In rest mode, both profiles can wake the PS5, but once it has started only the PS5 profile connects.
- On consoles with the IW620 chip, restarts go through the PS5 OS instead of [warm restarts](/installation/bazzite-deck#built-in-commands) while this is on: the chip doesn't survive a warm restart with the changed address.
- With the feature **off**, a controller paired with the PS5 OS connects to Linux by itself and is refused in a loop, see [Controller refused in a loop](./bluetooth.md#controller-refused-in-a-loop).

How the address is set per chip, and the pitfalls found in testing, are on [Bluetooth](./bluetooth.md#one-dualsense-for-the-ps5-and-linux).

## DualSense pairs once but won't reconnect

On some images the Bluetooth adapter comes up without accepting incoming connections, so a controller pairs fine but can't find its way back after it has been switched off. Tell the adapter to accept connections at every boot:

```bash
sudo systemctl enable --now bluetooth
```

Create a service that runs `btmgmt connectable on` after Bluetooth starts:

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

Load the two drivers at boot:

```text title="/etc/modules-load.d/dualsense.conf"
hidp
hid_playstation
```

Enable the service, then reboot:

```bash
sudo systemctl enable bt-connectable
```

:::note[Not tested]
Reported on the official CachyOS image with a Marvell IW620. The `JustWorksRepairing` setting under [Bluetooth troubleshooting](#bluetooth-troubleshooting) addresses a related pairing problem and can be combined with this.
:::

### Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or use the [shared Bluetooth address](#one-dualsense-for-the-ps5-and-linux) setup.
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** only over USB. Over Bluetooth the controller's audio is not available, so a headset in the jack stays silent; use the HDMI output or a USB or Bluetooth headset instead.

## Bluetooth troubleshooting

- **The Bluetooth adapter disappears after a while:** the Bluetooth chips drop off USB when they enter USB power saving (U3), and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the IW620 Bluetooth (`1286:2059`), the MediaTek Bluetooth (`0e8d:3603`, `0e8d:3605`) and the Salina USB controller (`104d:9108`). PS5 Bazzite Deck does this by default.
- **Bluetooth is gone after a warm restart (IW620):** the Bluetooth side of the chip can hang, more so with the Linux-only address on, see [Bluetooth](./bluetooth.md#iw620-the-linux-only-address-and-warm-restarts). Reloading the `btusb` driver brings it back; if not, power off and start Linux with the loader again.
- **No `hci0` and `Host halt failed, -110` in `dmesg`:** the USB controller that carries Bluetooth did not start (`xhci_hcd 0000:40:00.6`). Kernels built from upstream during a few weeks had the Salina xHCI start disabled (`xhci_salina_init()` inside `#if 0`); every current kernel has it back. Update the kernel, or if you must stay on such a build, remove the `#if 0` and its `#endif` and rebuild, see [Kernel setup](/advanced/kernel#build-by-hand). Reloading modules does not help, because xHCI is built into the kernel. A `-110` error on the SATA controller (`40:00.3`) is harmless.
- **Phantom Bluetooth adapters** (an extra `hciN` with address `00:00:00:00:00:00`): the [package repository's fix script](/advanced/package-repository#fix-scripts-for-older-images) turns them off.
- **Pairing problems:** setting `JustWorksRepairing = always` and `PairableTimeout = 0` in `/etc/bluetooth/main.conf`, and loading the `hidp` module at boot, helps controllers pair and re-pair reliably.
- **The settings find no new devices on an original PS5:** a kernel quirk that mixes the LE command families, see [Bluetooth](./bluetooth.md#iw620-marvell). On PS5 Bazzite Deck, update to the current release.

## Bluetooth on Marvell chips (Arch fix script)

If a DualSense won't connect over Bluetooth on a console with the Marvell IW620, the script below applies the power, TLP and BlueZ settings that have fixed it for most people. It is for **Marvell** consoles; on MediaTek consoles it doesn't change anything, and the fix there is in the kernel, see [Bluetooth](./bluetooth.md#mediatek-on-the-slim).

:::warning[Marvell only]
Not sure which chip you have? See [Console models and chips](/hardware/overview#console-models-and-chips).
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
