---
title: Warm restarts on PS5 Bazzite Deck
sidebar_label: Warm restarts
sidebar_position: 1
description: Restart PS5 Bazzite Deck straight back into Linux, without the PS5 OS, the jailbreak and the loader, and what to know on IW620 consoles.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Warm restarts on PS5 Bazzite Deck

A normal restart goes back to the PS5 OS, so you run the jailbreak and the Linux loader again. A warm restart skips all of that: Linux loads its kernel from the boot partition and starts it straight away. On PS5 Bazzite Deck it is built in and off by default. How it works on other images is on [Restart straight into Linux](/advanced/warm-reboot).

## Turn it on or off

On the PS5, in a terminal or over SSH:

```bash
ps5-warm-reboot on
```

```bash
ps5-warm-reboot off
```

`ps5-warm-reboot status` shows the current setting. It is kept across updates.

## What restarts warm

With warm restarts on, **every restart** is a warm one: **Restart** in Steam, in the desktop's power menu, and `sudo reboot` in a terminal. **Power off** always powers off.

If the kernel on the boot partition can't be loaded (boot partition not found, a damaged file), the console falls back to a normal restart through the PS5 OS. Nothing is lost; you start Linux with the loader as usual.

## Restart into the PS5 OS once

To go back to the PS5 OS while warm restarts are on, without turning them off:

```bash
ps5-reboot-to-ps5
```

The next restart after that is warm again.

## After an update

A new kernel needs a cold start: starting it with a warm restart skips the console's hardware reset, and in testing that left the console hung. So the restart right after an update goes through the PS5 OS once, by itself:

- **Legacy:** the update command arranges it and says so in its output. Power off, then start with the loader.
- **bootc:** after `sudo bootc upgrade` or Steam's update, the next restart goes through the PS5 OS once. Start with the loader as usual and you are on the new version.

## IW620 consoles

Most original PS5s and some Slims have the IW620 Wi-Fi/Bluetooth chip; `ps5-report` names it on its **Wireless** line.

On these consoles, warm restarts and the [Linux-only Bluetooth address](/using-linux/dualsense#one-dualsense-for-the-ps5-and-linux) don't go together: with both on, the chip can come back hung after a warm restart, with Bluetooth gone and sometimes Wi-Fi too. So while the Linux-only address is on (the default), restarts on an IW620 console go through the PS5 OS, even with `ps5-warm-reboot on`.

To use warm restarts on an IW620 console, turn the Linux-only address off:

```bash
ps5-bt-address off
```

The trade-off: with the address off, Linux and the PS5 OS share the console's Bluetooth address, and pairing a DualSense on one side breaks its pairing on the other.

After a warm restart, two services check the chip and repair it by themselves: `ps5-wifi-repair` reloads the Wi-Fi driver when the firmware was still running, and `ps5-bt-revive` restarts a Bluetooth adapter that hangs. If Wi-Fi or Bluetooth is still missing, power off and start with the loader.

:::tip[Slim and Pro with a MediaTek chip]
The MediaTek chips keep working through warm restarts with the Linux-only address on. Nothing to change.
:::

## If a warm restart hangs

Hold the power button until the console turns off, then start Linux with the loader. If it keeps happening, turn warm restarts off with `ps5-warm-reboot off` and report it in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) with the file `ps5-report` saves.
