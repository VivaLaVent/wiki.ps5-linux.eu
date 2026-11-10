---
title: DualSense controller
sidebar_position: 1
description: The DualSense over USB and Bluetooth on every image, why one Bluetooth chip makes pairings collide, and the controller's quirks.
hardware: [original, slim, pro]
applies_to: all
---

# DualSense controller

The DualSense works over USB and over Bluetooth on every PS5 model and image.

## USB

The kernel's `hid-playstation` driver, part of mainline Linux for years, handles the DualSense over a cable. Check that it is loaded:

```bash
lsmod | grep hid_playstation
```

Everything on the controller works over USB: buttons, sticks, rumble, touchpad, gyro, speaker and headphone jack.

## One DualSense for the PS5 and Linux {#one-dualsense-for-the-ps5-and-linux}

<a id="shared-pairing"></a><a id="linux-only-address"></a>

The PS5 OS and Linux share one Bluetooth chip, so both talk to the controller with the same console address. A DualSense keeps one pairing per address: pairing it in one system replaces the pairing of the other. Two ways around it:

- **Share the pairing:** the loader hands the PS5 OS's pairing keys to Linux at every start, and Linux imports them. The export is in the official [loader](https://github.com/ps5-linux/ps5-linux-loader) from November 2026 and in bazzite-bootc-loader v2.9; the importer is `ps5-bt-sync` from [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches/tree/main/bluetooth).
- **A Linux-only address:** Linux uses an address of its own, with its own pairing on a second **profile** of the controller. Profiles came with the DualSense's software version 0630 (PS5 system software 12.00): hold PS + a face button to switch between them.

<<<<<<< ours
On PS5 Bazzite Deck both are built in, see [DualSense: PS5 Bazzite Deck](/post-install/dualsense-bazzite-deck).
=======
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
- On consoles with the IW620 chip, restarts go through the PS5 OS instead of [warm reboots](/post-install/bazzite#built-in-commands) while this is on: the chip doesn't survive a warm reboot with the changed address.
- With the feature **off**, a controller paired with the PS5 OS connects to Linux by itself and is refused in a loop, see [Controller refused in a loop](/troubleshooting/bluetooth#controller-refused-in-a-loop).

How the address is set per chip, and the pitfalls found in testing, are on [Bluetooth](/troubleshooting/bluetooth#one-dualsense-for-the-ps5-and-linux).
>>>>>>> theirs

## Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or keep one pairing for both systems as below.
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** only over USB. Over Bluetooth the controller's audio is not available, so a headset in the jack stays silent; use the HDMI output or a USB or Bluetooth headset instead.

When a controller doesn't pair, doesn't reconnect or keeps dropping, see [Bluetooth and DualSense](/troubleshooting/bluetooth).
