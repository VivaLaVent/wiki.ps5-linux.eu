---
title: DualSense controller
sidebar_position: 3
description: Use the DualSense over USB or Bluetooth, keep one pairing for the PS5 and Linux, and fix pairing on Marvell chips.
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

## One DualSense for the PS5 and Linux

The PS5 OS and Linux share the same Bluetooth chip, and therefore the same Bluetooth address. A DualSense with pairing profiles keeps one pairing per host address, so pairing it with Linux replaces the PS5 pairing, and the other way around. Normally you'd have to pair again every time you switch systems.

Giving Linux its own Bluetooth address solves this. It is a boot-time service ([`ps5-bt-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/ps5-bt-addr)) that any image can run; PS5 Bazzite Deck includes it by default. The DualSense then keeps one pairing for the PS5 on one profile, and one for Linux on another. No re-pairing and no USB cable are needed when you switch.

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

How the address is set per chip, and the pitfalls found in testing, are on [Bluetooth](./bluetooth.md#one-dualsense-for-the-ps5-and-linux).

## DualSense pairs once but won't reconnect

On some images the Bluetooth adapter starts in a non-connectable state, so the controller pairs but can't connect again after it turns off. Make the adapter connectable at every boot:

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
Reported on the official CachyOS image (Marvell IW620). The existing `JustWorksRepairing` tip under [Bluetooth troubleshooting](#bluetooth-troubleshooting) solves a related pairing problem and can be combined with this.
:::

### Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or use the [shared Bluetooth address](#one-dualsense-for-the-ps5-and-linux) setup.
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** these work only over USB, not Bluetooth.

## Bluetooth troubleshooting

- **The Bluetooth adapter disappears after a while:** the Bluetooth chips drop off USB when they enter USB power saving (U3), and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the IW620 Bluetooth (`1286:2059`), the MediaTek Bluetooth (`0e8d:3603`) and the Salina USB controller (`104d:9108`). PS5 Bazzite Deck does this by default.
- **Bluetooth is gone after a warm restart (IW620):** the Bluetooth side of the chip can hang, more so with the Linux-only address on, see [Bluetooth](./bluetooth.md#iw620-the-linux-only-address-and-warm-restarts). Reloading the `btusb` driver brings it back; if not, power off and start Linux with the loader again.
- **No `hci0` and `Host halt failed, -110` in `dmesg`:** the USB controller that carries Bluetooth did not start (`xhci_hcd 0000:40:00.6`). This affects kernels built from `ps5-linux-patches` between 5 September and 27 October 2026, when the Salina xHCI initialisation was disabled (`xhci_salina_init()` inside `#if 0`). It was turned back on in #57, and kernel release 7.2.3 has it. Update the kernel, or if you must stay on a kernel from that range, remove the `#if 0` and its `#endif` and rebuild, see [Kernel setup](/advanced/kernel#build-from-source). Reloading modules does not help, because xHCI is built into the kernel. A `-110` error on the SATA controller (`40:00.3`) is harmless.
- **Phantom Bluetooth adapters** (an extra `hciN` with address `00:00:00:00:00:00`): the [package repository's fix script](/advanced/package-repository#fix-scripts-for-older-images) turns them off.
- **Pairing problems:** setting `JustWorksRepairing = always` and `PairableTimeout = 0` in `/etc/bluetooth/main.conf`, and loading the `hidp` module at boot, helps controllers pair and re-pair reliably.

## Bluetooth on Marvell chips (Arch fix script)

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
