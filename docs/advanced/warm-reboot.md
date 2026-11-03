---
title: Restart straight into Linux
sidebar_label: Warm reboot
sidebar_position: 4
description: Restart into Linux without the PS5 OS and the loader, with kexec on any image, and what a warm restart leaves un-reset.
---

# Restart straight into Linux

A normal restart returns the PS5 to the PS5 OS, and you run the jailbreak and the loader again. A warm restart skips that: the running kernel loads the next one with `kexec` and jumps straight to it. This works on any PS5 Linux image; it is the same mechanism the multi-distro image uses to switch distros and `m2_exec.sh` uses to start the M.2 install.

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

## What isn't reset

A warm restart starts the new kernel without the console's firmware resetting anything:

- **The Wi-Fi/Bluetooth chip** keeps whatever state the last boot left. The IW620's Wi-Fi often needs the driver reloaded after a warm boot; its Bluetooth side can hang, in which case reload `btusb` or power off, see [Bluetooth](/using-linux/bluetooth#iw620-marvell).
- **The HDMI chip** keeps the mode the last kernel set. The new kernel sets it up again; a display that needs the full link-training sequence may stay black until a cold start.
- **Firmware the loader dumps** (Wi-Fi, PS5 Pro GPU) stays on the boot partition and is picked up again; nothing is re-dumped.

## IW620 hazard

Giving Linux its own Bluetooth address (the [one DualSense for both systems](/using-linux/bluetooth#one-dualsense-for-the-ps5-and-linux) feature) sends a vendor command to the IW620 at every boot. With that on, a warm restart can leave the chip hung: Bluetooth gone, sometimes Wi-Fi too, until a power-off and a start with the loader. There is no fix yet, see [the research notes](/using-linux/bluetooth#iw620-the-linux-only-address-and-warm-restarts). Don't use both at once on an IW620 console.

:::note[PS5 Bazzite Deck]
The image has no `kexec-tools`, so it uses the `kexec_file_load` system call from a small script and hooks it into `reboot.target`, which makes a plain `sudo reboot` a warm restart once `ps5-warm-reboot on` is set. That is an implementation detail of the image, not a requirement: on other images the two commands above are all you need. `ps5-reboot-to-ps5` restarts into the PS5 OS once. Source: [`files/ps5-kexec`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-kexec).
:::
