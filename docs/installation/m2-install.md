---
title: Install to an M.2 SSD
sidebar_label: Install to M.2
sidebar_position: 6
description: Move your Linux install to the PS5's M.2 slot for better speed and capacity.
hardware: [original, slim, pro]
applies_to: all
---

# Install to an M.2 SSD

An NVMe drive in the console's M.2 slot gives Linux a fast, large home. It needs a firmware with M.2 support (every version except the oldest, see [Supported firmware](/getting-started/prerequisites#firmware)), and while Linux lives on the drive the PS5 OS can't use it for games.

Before you buy a drive, read [M.2 drives](/hardware/storage#m2-drives): only NVMe drives work, and Gen3 drives need an [unlock](/hardware/storage#gen3-nvme-unlock).

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

Should the PS5 OS ask to format the drive again after that reboot, say so on [Discord](https://discord.gg/ps5linux) with the drive's model and size: that combination hasn't been seen before.

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
The USB drive stays in the console: the loader reads the kernel from its FAT32 partition at every boot.
:::

:::warning[Kernel updates on M.2]
A kernel update on an M.2 install has left some users with a black screen or a kernel that doesn't match its modules. Read [Known issues](/troubleshooting/known-issues#kernel-update-breaks-m2-boot) before you update.
:::

## Switching distros

There is no need to format the drive from the PS5 OS again. The PS5's format only rewrites the blocks it uses itself and leaves the Linux partition as it is. To change distro, format the Linux partition from Linux (`sudo mkfs.ext4 /dev/nvme0n1p1`, the partition `m2_init` created) and install the new image.

## No 64 GB USB drive?

A USB drive too small for the full image can still get you onto the M.2: the community script at [github.com/g4caos/ps5-linux-script](https://github.com/g4caos/ps5-linux-script) copies the running Linux system to the M.2 drive with rsync, so no image file is needed on the USB side.
