---
title: "Warm reboots: other images"
sidebar_label: Other images
sidebar_position: 2
description: "Restart an official or self-built PS5 Linux image straight back into Linux with kexec, from ps5-linux-tools or by hand."
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Warm reboots: other images

What a warm reboot is and what it doesn't reset is on [Warm reboots](/post-install/warm-reboot).

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

On a system without systemd, replace the second line with `sudo kexec -e`. On a Bazzite-based image the boot partition is at `/efi`, not `/boot/efi`.

Confirmed on original PS5s and Slims with Ubuntu, Arch and PS5 Bazzite Deck. The console's LED stays white; the PS5 OS is never started.

:::tip[Test a new kernel this way]
A kernel that doesn't boot costs you a full cycle through the PS5 OS, the jailbreak and the loader. Load it with `kexec` first: if it fails, power off and the old kernel is still on the boot partition.
:::
