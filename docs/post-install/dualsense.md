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

On PS5 Bazzite Deck both are built in, see [DualSense: PS5 Bazzite Deck](/post-install/dualsense-bazzite-deck).

## Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or keep one pairing for both systems as below.
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** only over USB. Over Bluetooth the controller's audio is not available, so a headset in the jack stays silent; use the HDMI output or a USB or Bluetooth headset instead.

When a controller doesn't pair, doesn't reconnect or keeps dropping, see [Bluetooth and DualSense](/troubleshooting/bluetooth).
