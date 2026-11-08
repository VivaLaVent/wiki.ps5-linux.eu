---
title: DualSense controller
sidebar_position: 1
description: Use the DualSense over USB or Bluetooth, and keep one pairing for the PS5 OS and Linux on separate controller profiles.
hardware: [original, slim, pro]
applies_to: all
---

# DualSense controller

The DualSense works over USB and over Bluetooth on every PS5 model.

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
2. On the DualSense, hold **PS + Square** (or another face button than the PS5's): it switches to that profile, and keeps blinking in pairing mode if the profile has no pairing yet. Use a face button, not **PS + Create**.
3. If it doesn't blink fast, keep holding until it does.
4. Pair it in the Linux Bluetooth settings.
5. Start the PS5 OS, select the PS5 profile on the DualSense, and check that it connects.
6. Start Linux again, select the Linux profile, and check that it connects.

From then on, hold **PS + the profile's button** for 2 to 3 seconds to switch: the PS5's profile in the PS5 OS, the Linux profile in Linux. No cable is needed.

**Check or change the setting:** `ps5-bt-address status` shows the address in use; `ps5-bt-address off` turns the feature off (pair the DualSense with Linux again afterwards).

**Known limits:**

- `bluetoothctl` and the Bluetooth settings still show the original address. The chip and the DualSense use the new one.
- In rest mode, both profiles can wake the PS5, but once it has started only the PS5 profile connects.
- On consoles with the IW620 chip, restarts go through the PS5 OS instead of [warm reboots](/post-install/bazzite#built-in-commands) while this is on: the chip doesn't survive a warm reboot with the changed address.
- With the feature **off**, a controller paired with the PS5 OS connects to Linux by itself and is refused in a loop, see [Controller refused in a loop](/troubleshooting/bluetooth#controller-refused-in-a-loop).

How the address is set per chip, and the pitfalls found in testing, are on [Bluetooth](/troubleshooting/bluetooth#one-dualsense-for-the-ps5-and-linux).

## Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or use the [shared Bluetooth address](#one-dualsense-for-the-ps5-and-linux) setup.
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** only over USB. Over Bluetooth the controller's audio is not available, so a headset in the jack stays silent; use the HDMI output or a USB or Bluetooth headset instead.

When a controller doesn't pair, doesn't reconnect or keeps dropping, see [Bluetooth and DualSense](/troubleshooting/bluetooth).
