---
title: "Warm reboots: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "PS5 Bazzite Deck restarts straight back into Linux with ps5-warm-reboot: turning it on, what reboots warm, updates and IW620 consoles."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Warm reboots: PS5 Bazzite Deck

What a warm reboot is and what it doesn't reset is on [Warm reboots](/post-install/warm-reboot).

Warm reboots are built in and off by default. The image has no `kexec-tools`: a small script loads the kernel with the `kexec_file_load` system call and hooks into `reboot.target`. Source: [`files/ps5-kexec`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-kexec).

## Turn it on or off

On the PS5, in a terminal or over SSH:

```bash
ps5-warm-reboot on
```

```bash
ps5-warm-reboot off
```

`ps5-warm-reboot status` shows the current setting. It is kept across updates.

## What reboots warm

With warm reboots on, **every restart** is a warm one: **Restart** in Steam, in the desktop's power menu, and `sudo reboot` in a terminal. **Power off** always powers off. If the kernel on the boot partition can't be loaded, the console falls back to a normal restart through the PS5 OS; you start Linux with the loader as usual.

To go back to the PS5 OS once while warm reboots are on, run `ps5-reboot-to-ps5`. The next restart after that is warm again.

## After an update

A new kernel needs a cold start: starting it with a warm reboot skips the console's hardware reset, and in testing that left the console hung. So the restart right after an update goes through the PS5 OS once, by itself:

- After `sudo bootc upgrade`, the next restart goes through the PS5 OS. Start with the loader as usual and you are on the new version.
- On a Legacy install, the update command arranges the same and says so in its output.
- After `sudo bootc rollback`, power off and start with the loader rather than restarting, so the loader starts the version you rolled back to.

## IW620 consoles

Because of the [IW620 hazard](/post-install/warm-reboot#iw620-hazard), restarts on an IW620 console go through the PS5 OS while the Linux-only Bluetooth address is on (the default), even with `ps5-warm-reboot on`. `ps5-report` names the chip on its **Wireless** line.

To use warm reboots on an IW620 console, turn the address off with `ps5-bt-address off`. The trade-off: Linux and the PS5 OS then share the console's Bluetooth address, and pairing a DualSense on one side breaks its pairing on the other.

From v2.8 the Wi-Fi driver resets the IW620 at the start when it finds the old firmware still running. After a warm reboot, two services also check the chip and repair it by themselves: `ps5-wifi-repair` reloads the Wi-Fi driver if it still failed, and `ps5-bt-revive` restarts a Bluetooth adapter that hangs. If Wi-Fi or Bluetooth is still missing, power off and start with the loader. The MediaTek chips of the Slim and the Pro keep working through warm reboots with the address on.
