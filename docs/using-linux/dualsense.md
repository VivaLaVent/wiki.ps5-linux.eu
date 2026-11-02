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

## One DualSense for the PS5 and Linux

The PS5 system and Linux share the same Bluetooth chip, and therefore the same Bluetooth address. A DualSense with pairing profiles keeps one pairing per host address, so pairing it with Linux replaces the PS5 pairing, and the other way around. Normally you'd have to pair again every time you switch systems.

[PS5 Bazzite Deck](/installation/bazzite-deck) solves this by giving Linux its own Bluetooth address (on by default from v1.8.9). The DualSense then keeps one pairing for the PS5 on one profile, and one for Linux on another. No re-pairing and no USB cable are needed when you switch.

**Pair the DualSense with Linux** (make sure it is already paired with the PS5 system on one profile):

1. Start Linux.
2. On the DualSense, select a different profile, for example **PS + Square**.
3. Put the DualSense in pairing mode.
4. Pair it in the Linux Bluetooth settings.
5. Start the PS5 system, select the PS5 profile on the DualSense, and check that it connects.
6. Start Linux again, select the Linux profile, and check that it connects.

**Check or change the setting:** `ps5-bt-address status` shows the address in use; `ps5-bt-address off` turns the feature off (pair the DualSense with Linux again afterwards).

**Known limits:**

- `bluetoothctl` and the Bluetooth settings still show the original address. The chip and the DualSense use the new one.
- In rest mode, both profiles can wake the PS5, but once it has started only the PS5 profile connects.
- On consoles with the IW620 chip, restarts go through the PS5 system instead of [warm restarts](/installation/bazzite-deck#built-in-commands) while this is on: the chip doesn't survive a warm restart with the changed address.

<details>
<summary>How it works</summary>

At boot, before `bluetooth.service` starts, a service reads the chip's address, sets the "locally administered" bit of the first byte (for example `80:60:B7:C5:74:44` becomes `82:60:B7:C5:74:44`) and sends it to the chip. On the IW620 this uses the Marvell vendor command `0xFC22`; on MediaTek chips, MediaTek's own command. The chip only keeps the new address in RAM, so the PS5 system always gets its original address back. `btmgmt public-addr` can't be used, because the kernel only sends a new public address to the chip during the adapter's first setup.

</details>

## Bluetooth troubleshooting

- **The Bluetooth adapter disappears after a while:** the Bluetooth chips drop off USB when they enter USB power saving (U3), and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the IW620 Bluetooth (`1286:2059`), the MediaTek Bluetooth (`0e8d:3603`) and the Salina USB controller (`104d:9108`). PS5 Bazzite Deck does this by default.
- **Bluetooth is gone after a warm restart (IW620):** the Bluetooth side of the chip can hang. Reloading the `btusb` driver brings it back; if not, power off and start Linux with the loader again.
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
