---
title: Flash the image to USB
sidebar_label: Flash to USB
sidebar_position: 1
description: Write the downloaded image to a USB drive, from Windows, macOS or Linux.
hardware: [original, slim, pro]
applies_to: all
---

# Flash the image to USB

You have an image file from [Choose your image](/getting-started/which-image): `ps5-bazzite-deck.img`, or an official `.img.xz`.

The drive must be **32 GB or larger for PS5 Bazzite Deck, 64 GB or larger for the official images**; an external SSD makes everything faster. Flashing erases the drive.

**Linux or macOS:**

```bash
# Find your drive first with lsblk (Linux) or diskutil list (macOS)
sudo dd if=ps5-ubuntu2604.img of=/dev/sdX bs=4M status=progress conv=fsync
```

On Linux you can also flash a compressed `.img.xz` directly, without decompressing it first:

```bash
xzcat ps5-ubuntu2604.img.xz | sudo dd of=/dev/sdX bs=4M status=progress conv=fsync
sync
```

:::danger
Double-check the target device. `dd` overwrites whatever you point it at without asking.
:::

**Windows:** use [Rufus](https://rufus.ie/). balenaEtcher, which some READMEs suggest, has produced drives that don't boot with these images.

## Plug the drive into the PS5

Use a fast port, see [USB ports](/hardware/storage#usb-ports); the slow USB 2.0 port is for a controller or keyboard.

## Optional: edit cmdline.txt from Windows


The kernel command line lives in `cmdline.txt` on the FAT32 partition of the USB drive. See [Kernel parameters](/post-install/boot-options) for what you can put in it.

**Without WSL:** use [Explorer++](https://explorerplusplus.com/) (run it as administrator). It can open the FAT32 EFI partition where `cmdline.txt` lives.

**With WSL:** attach the drive to WSL, then edit the file from Linux.

```powershell
# In PowerShell as administrator: find the drive number
Get-CimInstance -Query "SELECT * from Win32_DiskDrive"

# Attach partition 1 of that drive to WSL
wsl --mount \\.\PHYSICALDRIVE1 --partition 1 --type vfat
```

```bash
# Then, inside WSL
ls /mnt/wsl/PHYSICALDRIVE1p1/
nano /mnt/wsl/PHYSICALDRIVE1p1/cmdline.txt
```

Next: [Booting Linux](/installation/booting).

## Next steps

**[Start Linux with the loader](/installation/booting)**.
