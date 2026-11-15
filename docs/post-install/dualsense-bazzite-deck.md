---
title: "DualSense: PS5 Bazzite Deck"
sidebar_label: DualSense
sidebar_position: 1
description: "On PS5 Bazzite Deck, one DualSense for the PS5 OS and Linux: the pairing made in the PS5 OS reaches Linux through the loader."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# DualSense: PS5 Bazzite Deck

**Pair in Game Mode**, not in the desktop: the desktop's Bluetooth settings don't complete the pairing with a DualSense.

A controller paired in the PS5 OS connects in Linux too, without pairing again: the loader hands the PS5 OS's pairings to Linux at every start. That is the setup on every console from v2.16; before, the original PS5 and the Pro gave Linux a Bluetooth address of its own by default (see [below](#linux-only-address)).

## Shared pairing {#shared-pairing}

The loader hands the PS5 OS's active pairings to Linux at every start, and `ps5-bt-import` adds them to Linux's Bluetooth settings before Bluetooth starts. The controller then connects in both systems without pairing again.

1. Start Linux with **bazzite-bootc-loader v2.9 or newer** (`bazzite-bootc-loader-v2.9.elf` and later, from the [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases)).
2. Power off. In the PS5 OS, check that the controller connects; pair it there if not.
3. Start Linux with the loader and press the PS button: it connects.

Check it: `journalctl -b -u ps5-bt-import -o cat` reports the pairings it brought over. If it says `no pairing export from the loader`, an older loader started Linux.

- **Pair in the PS5 OS, not in Linux.** A pairing made in Linux replaces the PS5 OS's, and the next start through the loader brings the PS5 OS's back.
- **A newly paired controller comes over at the next start through the loader.** A warm reboot keeps the pairings Linux already has.
- **With the boot files on the console's own storage** (`ps5-m2-install --boot`): from v2.13 the loader hands the pairings to Linux in the initrd. Older loaders leave them where Linux can't read them.

## Coming from the Linux-only address {#linux-only-address}

Up to v2.15, the original PS5 and the Pro gave Linux its own Bluetooth address, with the controller's pairing for Linux on a second profile. From v2.16 Linux uses the console's address like the PS5 OS:

- Use the controller's **PS5 profile** in Linux too (hold **PS +** that profile's button for 2 to 3 seconds). The Linux profile is no longer used.
- Other devices you paired only in Linux (headsets, other controllers) need pairing once more, in Game Mode.
- Warm reboots on the original PS5 now keep Bluetooth, see [IW620 consoles](/post-install/warm-reboot-bazzite-deck#iw620-consoles).
