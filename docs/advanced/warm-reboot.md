---
title: Restart straight into Linux
sidebar_label: Warm reboot
sidebar_position: 3
description: Restart into Linux without the PS5 OS and the loader, with kexec_file_load and no kexec-tools, and what that leaves un-reset.
---

# Restart straight into Linux

A normal restart returns the PS5 to the PS5 OS, and you run the jailbreak and the loader again. A warm restart skips that: the running kernel loads the next one with `kexec` and jumps to it. Experimental: it works for many, and it has known hazards.

**Credits:** Dasloh (sleep and USB power fixes around it), the PS5 Bazzite Deck image for the units below.

## How it works

The kernel's `kexec_file_load` system call takes the kernel, the initrd and the command line directly, so no `kexec-tools` package is needed. [`files/ps5-kexec`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/ps5-kexec) is a short Python script that:

1. finds the boot partition (`/efi`, `/boot/efi`, or mounts `LABEL=boot` read-only),
2. reads `cmdline.txt`, opens `bzImage` and `initrd.img`, and calls `kexec_file_load`,
3. on `exec`, calls `reboot(LINUX_REBOOT_CMD_KEXEC)`.

Because it reads the boot partition at restart time, a kernel you have just updated and the current `cmdline.txt` are always what boots next.

On a systemd system, the units around it:

| Unit | Role |
| --- | --- |
| `ps5-kexec-prepare.service` | Runs `ps5-kexec load`. Pulled in by an overridden `reboot.target` before `umount.target`, so it runs for restarts only, never for power-off. |
| `ps5-reboot.service` | Required by `reboot.target`: runs `systemctl --force kexec` when a kernel is loaded and `systemctl --force reboot` otherwise. |
| `/usr/sbin/kexec` shim | systemd runs `kexec -e` at the very end; without `kexec-tools` the shim calls `ps5-kexec exec`. |

Sources: [`files/ps5-kexec-prepare.service`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/ps5-kexec-prepare.service), [`files/ps5-reboot.service`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/ps5-reboot.service), [`files/kexec-shim`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/kexec-shim). Confirmed on original PS5s and Slims.

## What isn't reset

A warm restart starts the new kernel without the console's firmware resetting anything:

- **The Wi-Fi/Bluetooth chip** keeps whatever state the last boot left. The IW620's Wi-Fi usually needs repairing after a warm boot (the image reloads the driver when it finds a marker file from the previous boot). Its Bluetooth side can hang; reload `btusb`, or power off.
- **The picture:** the HDMI chip is not re-initialised by the loader. The new kernel sets the mode up again; a display that needs the full link-training sequence may stay black until a cold start.

## IW620 hazard

With the [Linux-only Bluetooth address](/using-linux/bluetooth#iw620-the-linux-only-address-and-warm-restarts) on, a warm restart can leave the IW620 hung: Bluetooth gone, sometimes Wi-Fi too, until a power-off and a start with the loader. There is no fix yet. Don't use both at once on an IW620 console.

:::tip[PS5 Bazzite Deck]
`ps5-warm-reboot on` turns it on; while the Linux-only address is on, IW620 consoles get a normal restart instead. `sudo reboot` then restarts into Linux; `ps5-reboot-to-ps5` restarts into the PS5 OS once.
:::
