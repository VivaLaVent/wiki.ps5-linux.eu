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

The PS5 OS and Linux share one Bluetooth chip. A DualSense keeps one pairing per console address, so without help, pairing it on one system breaks it on the other. PS5 Bazzite Deck has two ways around that; `ps5-bt-address status` shows which one is on.

| | Shared pairing (address **off**) | Linux-only address (address **on**) |
| --- | --- | --- |
| Default on | Slim (MediaTek), from v2.8.1 | original PS5 (IW620) and PS5 Pro |
| Pairing | one, made in the PS5 OS; Linux gets it at every start through the loader | one in the PS5 OS and one in Linux, on two controller profiles |
| Needs | bazzite-bootc-loader v2.9 or newer | a DualSense with profiles (its software 0630, PS5 system software 12.00) |
| Warm reboots on the IW620 | work | restarts go through the PS5 OS, see below |

The setting is stored in the install's `/etc`: it stays through updates, but a reflash or switching from Legacy to bootc starts from the default again. Check it after either.

### Shared pairing {#shared-pairing}

The loader hands the PS5 OS's active pairings to Linux at every start, and `ps5-bt-import` adds them to Linux's Bluetooth settings before Bluetooth starts. The controller then connects in both systems without pairing again.

1. On an original PS5 or a Pro, in Linux: `ps5-bt-address off`. On a Slim it's already off.
2. Use bazzite-bootc-loader v2.9 or newer (from the [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases)).
3. Power off. In the PS5 OS, check that the controller connects; pair it there if not.
4. Start Linux with the loader and press the PS button: it connects.

Check it: `ps5-bt-address status` says **off**, and `journalctl -b -u ps5-bt-import -o cat` reports the pairings it brought over. If it says `no pairing export from the loader`, an older loader started Linux.

- **Pair in the PS5 OS, not in Linux.** A pairing made in Linux replaces the PS5 OS's, and the next start through the loader brings the PS5 OS's back.
- **A newly paired controller comes over at the next start through the loader.** A warm reboot keeps the pairings Linux already has.
- **Controllers paired in Linux while the address was on** stop connecting after the switch: pair them in the PS5 OS, then start Linux with the loader.
- **Not with the boot files on the console's own storage** (`ps5-m2-install --boot`): Linux can't read the pairings the loader leaves there.

### Linux-only address {#linux-only-address}

A boot-time service ([`ps5-bt-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-addr), [`ps5-bt-pro-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-pro-addr) on the Pro) gives Linux an address of its own, with its own pairing on a second controller profile. Turn it on with `ps5-bt-address on`, then power off and start with the loader.

1. Make sure the controller is paired with the PS5 OS on one profile.
2. In Linux, hold **PS + Square** (or another face button than the PS5's): the controller switches to that profile and blinks fast if it holds no pairing yet. If it doesn't blink fast, hold **PS + Create** until it does (on the PS5's profile, that would replace the PS5's pairing).
3. Pair it in Game Mode's Bluetooth settings.
4. From then on, hold **PS + the profile's button** for 2 to 3 seconds to switch: the PS5's profile in the PS5 OS, the Linux profile in Linux.

- `bluetoothctl` and the Bluetooth settings still show the original address; the chip and the DualSense use the new one (`ps5-bt-address status` shows it).
- In rest mode both profiles can wake the PS5; once it has started, only the PS5 profile connects.
- **IW620 (original PS5):** while the address is on, `sudo reboot` silently does a normal restart through the PS5 OS, even with `ps5-warm-reboot on`: the chip doesn't survive a warm reboot with the changed address. For warm reboots, use the shared pairing.
- With the address off and a loader older than v2.9, a controller paired in the PS5 OS reaches Linux with a key Linux doesn't have and is refused in a loop, see [Controller refused in a loop](/troubleshooting/bluetooth#controller-refused-in-a-loop).

How the address is set per chip, and the pitfalls found in testing, are on [Bluetooth](/troubleshooting/bluetooth#one-dualsense-for-the-ps5-and-linux).

## Controller quirks

- **Used in the PS5 OS first:** pairing the controller in the PS5 OS breaks its Linux pairing. Remove it in Linux and pair again, or use the [shared pairing](#shared-pairing).
- **USB while connected over Bluetooth:** don't plug in the USB cable while the controller is connected over Bluetooth. The log shows `Duplicate device found for MAC`.
- **Speaker and headphone jack:** only over USB. Over Bluetooth the controller's audio is not available, so a headset in the jack stays silent; use the HDMI output or a USB or Bluetooth headset instead.

When a controller doesn't pair, doesn't reconnect or keeps dropping, see [Bluetooth and DualSense](/troubleshooting/bluetooth).
