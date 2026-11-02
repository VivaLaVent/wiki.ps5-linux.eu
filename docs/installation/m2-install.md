---
title: Install to an M.2 SSD
sidebar_label: Install to M.2
sidebar_position: 6
description: Move your Linux install to the PS5's M.2 slot for better speed and capacity.
---

# Install to an M.2 SSD

Requires firmware **4.00 or later**. The M.2 drive is used for Linux only: you cannot store PS5 games on it at the same time.

Before you buy a drive, read [M.2 drives](/hardware/usb-storage#m2-drives): only NVMe drives work, and Gen3 drives need an [unlock](/hardware/usb-storage#gen3-nvme-unlock).

:::note[PS5 Bazzite Deck]
Bazzite mounts the boot partition somewhere else and uses different labels. Follow [its own M.2 steps](/installation/bazzite-deck#install-to-the-internal-m2) instead.
:::

## 1. Install the drive

Install the M.2 drive following [Sony's official guide](https://www.playstation.com/en-us/support/hardware/ps5-install-m2-ssd). If it was previously used for games, format it first: **Settings → Storage → M.2 SSD Storage**.

## 2. Initialise the drive from Linux

Boot Linux from USB as usual, then run:

```bash
cd ps5-linux-tools
sudo ./m2_init
sudo reboot
```

If the PS5 asks you to format the M.2 drive again after the reboot, report it on [Discord](https://discord.gg/ps5linux) with the drive's model and size.

## 3. Install the Linux image onto the drive

```bash
cd ps5-linux-tools
chmod +x ./m2_install.sh
sudo ./m2_install.sh --install /path/to/ps5-ubuntu2604.img
```

## 4. Boot from the drive

```bash
cd ps5-linux-tools
chmod +x ./m2_exec.sh
sudo ./m2_exec.sh
```

To boot from M.2 every time, edit `/boot/efi/cmdline.txt` and change `root=LABEL=ubuntu2604` to `root=LABEL=ubuntu2604-m2`.

:::note
You still need the USB drive plugged in: the loader reads its FAT32 partition at boot.
:::

:::warning[Kernel updates on M.2]
Updating the kernel on an M.2 install can cause a black screen. Stay on kernel **7.0.10** for now, see [Known issues](/troubleshooting/known-issues#kernel-update-breaks-m2-boot).
:::

## Switching distros

You don't need to reformat from the PS5 OS. Formatting the M.2 drive from the PS5 settings only does a "soft" format: it overwrites the blocks the PS5 itself needs and leaves your Linux partition alone. To switch distros, reformat the Linux partition from Linux (`sudo mkfs.ext4 /dev/nvme0n1p1`, the partition `m2_init` created) and reinstall.

## No 64 GB USB drive?

If your USB drive is too small for the full image, use the community rsync-based script instead of `m2_install.sh`: [github.com/g4caos/ps5-linux-script](https://github.com/g4caos/ps5-linux-script). It copies your running Linux session straight onto the M.2 drive, so you don't need a pre-built image file.
