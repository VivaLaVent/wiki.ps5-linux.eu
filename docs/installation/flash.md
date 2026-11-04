---
title: Flash the image to USB
sidebar_label: Flash to USB
sidebar_position: 1
description: Write the downloaded image to a USB drive, from Windows, macOS or Linux.
hardware: [original, slim, pro]
applies_to: all
---

# Flash the image to USB

You have an image file from [Choose your image](/getting-started/which-image): a PS5 Bazzite Deck `.img`, or an official `.img.xz`.

The drive must be **64 GB or larger**; an external SSD makes everything faster. Flashing erases the drive.

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

**Windows:** use [balenaEtcher](https://etcher.balena.io/):

1. **Flash from file** → pick the `.img` (an `.img.xz` works too, without unpacking it first).
2. **Select target** → pick the USB drive. Check its size: everything on it is erased.
3. **Flash!**, then wait until it has also checked the written drive.

When Windows then offers to format the drive, choose **Cancel**: the Linux partitions are fine, Windows just can't read them.

## Plug the drive into the PS5

Use a fast port, see [USB ports](/hardware/storage#usb-ports); the slow USB 2.0 port is for a controller or keyboard.

## Optional: edit cmdline.txt from Windows

The kernel command line lives in `cmdline.txt` on the small FAT32 boot partition of the USB drive. See [Boot options](/post-install/boot-options) for what you can put in it.

Windows doesn't give that partition a drive letter, and File Explorer refuses to open it even when it has one (on the bootc form it is an EFI system partition). Give it a letter with `diskpart`, then edit it with Explorer++.

:::warning[Windows offers to format the drive]
When you plug in a Linux drive, Windows may ask to format a disk it can't read. Always choose **Cancel**: formatting erases the Linux install.
:::

1. **Open diskpart.** Start → type `cmd` → **Run as administrator**, then:

   ```text
   diskpart
   list disk
   ```

2. **Select the USB drive.** Find it in the list by its size, and use its number in place of `<n>`:

   ```text
   select disk <n>
   list partition
   ```

   Check the size twice: selecting the wrong disk gives the letter to a partition of your PC's own drive.

3. **Give the boot partition a letter.** It is the small partition of a few hundred MB, often listed as **System**. Use its number in place of `<n>`:

   ```text
   select partition <n>
   assign letter=P
   exit
   ```

4. **Edit cmdline.txt with Explorer++.** Download [Explorer++](https://explorerplusplus.com/) (it runs without installing), right-click `Explorer++.exe` → **Run as administrator**, and open `P:\`. Right-click `cmdline.txt` → **Open With** → **Notepad**. Keep it on **one single line**, add or remove the option, and save.

5. **Remove the letter again** before you unplug the drive. In an administrator Command Prompt:

   ```text
   diskpart
   select volume P
   remove letter=P
   exit
   ```

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
