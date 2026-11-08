---
title: Warm reboots
sidebar_position: 3
description: "Restart into Linux without the PS5 OS and the loader: what a warm reboot is, what it doesn't reset, and how it works on each image."
hardware: [original, slim, pro]
applies_to: all
---

# Warm reboots

A normal restart returns the PS5 to the PS5 OS, and you run the jailbreak and the loader again. A warm reboot skips that: the running kernel loads the next one with `kexec` and jumps straight to it. This works on any PS5 Linux image; it is the same mechanism the multi-distro image uses to switch distros and `m2_exec.sh` uses to start the M.2 install.

## What isn't reset

A warm reboot starts the new kernel without the console's firmware resetting anything:

- **The Wi-Fi/Bluetooth chip** keeps whatever state the last boot left. The IW620's Wi-Fi often needs the driver reloaded after a warm reboot; its Bluetooth side can hang, see [Bluetooth problems](/troubleshooting/bluetooth#bluetooth-problems).
- **The HDMI chip** keeps the mode the last kernel set. The new kernel sets it up again; a display that needs the full link-training sequence may stay black until a cold start.
- **Firmware the loader dumps** (Wi-Fi, PS5 Pro GPU) stays on the boot partition and is picked up again; nothing is re-dumped.

## IW620 hazard

Giving Linux its own Bluetooth address (the [one DualSense for both systems](/troubleshooting/bluetooth#one-dualsense-for-the-ps5-and-linux) feature) sends a vendor command to the IW620 at every boot. With that on, a warm reboot can leave the chip hung: Bluetooth gone, sometimes Wi-Fi too, until a power-off and a start with the loader. There is no fix yet, see [the research notes](/troubleshooting/bluetooth#iw620-the-linux-only-address-and-warm-reboots). Don't use both at once on an IW620 console.

## On your image

- **[PS5 Bazzite Deck](/post-install/warm-reboot-bazzite-deck):** built in, off by default, `ps5-warm-reboot on`.
- **[Other images](/post-install/warm-reboot-other-images):** with `kexec`, from ps5-linux-tools or by hand.
