---
title: Warm reboots
sidebar_position: 3
description: "Restart into Linux without the PS5 OS and the loader: what a warm reboot is, what it doesn't reset, and how it works on each image."
hardware: [original, slim, pro]
applies_to: all
---

# Warm reboots

A normal restart returns the PS5 to the PS5 OS, and you run the jailbreak and the loader again. A warm reboot skips that: the running kernel loads the next one with `kexec` and jumps straight to it. This works on any PS5 Linux image; it is the same mechanism the multi-distro image uses to switch distros and `m2_exec.sh` uses to start the M.2 install.
<<<<<<< ours
=======

## Restart with kexec

Install `kexec-tools` from your distro (`kexec-tools` on Debian, Ubuntu, Arch and Fedora). Then either run the script that ships with [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools):

```bash
cd ps5-linux-tools
sudo ./ps5-linux-warm-reboot.sh
```

Or do what it does by hand. It reads the kernel, initrd and command line from the boot partition, so whatever you have just updated there is what boots next:

```bash
sudo kexec -l /boot/efi/bzImage --initrd=/boot/efi/initrd.img --append="$(cat /boot/efi/cmdline.txt)"
sudo systemctl kexec -i
```

On a system without systemd, replace the second line with `sudo kexec -e`. On Bazzite the boot partition is at `/efi`, not `/boot/efi`.

Confirmed on original PS5s and Slims with Ubuntu, Arch and PS5 Bazzite Deck. The console's LED stays white; the PS5 OS is never started.

:::tip[Test a new kernel this way]
A kernel that doesn't boot costs you a full cycle through the PS5 OS, the jailbreak and the loader. Load it with `kexec` first: if it fails, power off and the old kernel is still on the boot partition.
:::
>>>>>>> theirs

## What isn't reset

A warm reboot starts the new kernel without the console's firmware resetting anything:

<<<<<<< ours
- **The Wi-Fi/Bluetooth chip** keeps whatever state the last boot left. The IW620's Wi-Fi needs the driver reloaded after a warm reboot, unless the driver resets the chip itself (ps5-linux-mwifiex from 9 November 2026, PS5 Bazzite Deck from v2.8); its Bluetooth side can hang, see [Bluetooth problems](/troubleshooting/bluetooth#bluetooth-problems).
=======
- **The Wi-Fi/Bluetooth chip** keeps whatever state the last boot left. The IW620's Wi-Fi often needs the driver reloaded after a warm reboot; its Bluetooth side can hang, in which case reload `btusb` or power off, see [Bluetooth](/troubleshooting/bluetooth#iw620-marvell).
>>>>>>> theirs
- **The HDMI chip** keeps the mode the last kernel set. The new kernel sets it up again; a display that needs the full link-training sequence may stay black until a cold start.
- **Firmware the loader dumps** (Wi-Fi, PS5 Pro GPU) stays on the boot partition and is picked up again; nothing is re-dumped.

## IW620 hazard

Giving Linux its own Bluetooth address (the [one DualSense for both systems](/troubleshooting/bluetooth#one-dualsense-for-the-ps5-and-linux) feature) sends a vendor command to the IW620 at every boot. With that on, a warm reboot can leave the chip hung: Bluetooth gone, sometimes Wi-Fi too, until a power-off and a start with the loader. There is no fix yet, see [the research notes](/troubleshooting/bluetooth#iw620-the-linux-only-address-and-warm-reboots). Don't use both at once on an IW620 console.
<<<<<<< ours

## On your image

- **[PS5 Bazzite Deck](/post-install/warm-reboot-bazzite-deck):** built in, off by default, `ps5-warm-reboot on`.
- **[Other images](/post-install/warm-reboot-other-images):** with `kexec`, from ps5-linux-tools or by hand.
=======

## PS5 Bazzite Deck

Warm reboots are built in and off by default. The image has no `kexec-tools`: a small script loads the kernel with the `kexec_file_load` system call and hooks into `reboot.target`. Source: [`files/ps5-kexec`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-kexec).

### Turn it on or off

On the PS5, in a terminal or over SSH:

```bash
ps5-warm-reboot on
```

```bash
ps5-warm-reboot off
```

`ps5-warm-reboot status` shows the current setting. It is kept across updates.

### What reboots warm

With warm reboots on, **every restart** is a warm one: **Restart** in Steam, in the desktop's power menu, and `sudo reboot` in a terminal. **Power off** always powers off. If the kernel on the boot partition can't be loaded, the console falls back to a normal restart through the PS5 OS; you start Linux with the loader as usual.

To go back to the PS5 OS once while warm reboots are on, run `ps5-reboot-to-ps5`. The next restart after that is warm again.

### After an update

A new kernel needs a cold start: starting it with a warm reboot skips the console's hardware reset, and in testing that left the console hung. So the restart right after an update goes through the PS5 OS once, by itself:

- After Steam's update or `sudo bootc upgrade`, the next restart goes through the PS5 OS. Start with the loader as usual and you are on the new version.
- On a Legacy install, the update command arranges the same and says so in its output.
- After `sudo bootc rollback`, power off and start with the loader rather than restarting, so the loader starts the version you rolled back to.

### IW620 consoles

Because of the [IW620 hazard](#iw620-hazard), restarts on an IW620 console go through the PS5 OS while the Linux-only Bluetooth address is on (the default), even with `ps5-warm-reboot on`. `ps5-report` names the chip on its **Wireless** line.

To use warm reboots on an IW620 console, turn the address off with `ps5-bt-address off`. The trade-off: Linux and the PS5 OS then share the console's Bluetooth address, and pairing a DualSense on one side breaks its pairing on the other.

After a warm reboot, two services check the chip and repair it by themselves: `ps5-wifi-repair` reloads the Wi-Fi driver when the firmware was still running, and `ps5-bt-revive` restarts a Bluetooth adapter that hangs. If Wi-Fi or Bluetooth is still missing, power off and start with the loader. The MediaTek chips of the Slim and the Pro keep working through warm reboots with the address on.
>>>>>>> theirs
