---
title: Install to an M.2 SSD
sidebar_label: Install to the M.2
sidebar_position: 4
description: Move Linux to the PS5's M.2 slot for more speed and space. What every image needs, then the steps for PS5 Bazzite Deck and for the other images.
hardware: [original, slim, pro]
applies_to: all
---

# Install to an M.2 SSD

An NVMe drive in the console's M.2 slot gives Linux a fast, large home. It needs a firmware with M.2 support (every version except the oldest, see [Supported firmware](/getting-started/prerequisites#firmware)), and while Linux lives on the drive the PS5 OS can't use it for games.

The USB drive stays plugged in: it keeps the boot files the loader starts Linux from, so you still start Linux the same way. Only the system itself runs from the M.2.

Before you buy a drive, read [M.2 drives](/getting-started/drives#m2-drives): only NVMe drives work, and Gen3 drives need an [unlock](/getting-started/drives#gen3-nvme-unlock).

## Install and empty the drive

Install the M.2 drive following [Sony's official guide](https://www.playstation.com/en-us/support/hardware/ps5-install-m2-ssd). If it held games, move the ones you want to keep to the console storage, then format it in the PS5 OS: **Settings → Storage → M.2 SSD Storage**.

## Prepare it for Linux

Start Linux from the USB drive as usual, then build [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) once and run `m2_init`. It adds a Linux partition the PS5 OS leaves alone:

```bash
git clone https://github.com/ps5-linux/ps5-linux-tools ~/ps5-linux-tools && make -C ~/ps5-linux-tools
cd ~/ps5-linux-tools && sudo ./m2_init
lsblk /dev/nvme0n1
```

`lsblk` should list `nvme0n1p1`, the new partition; if it doesn't, restart and start Linux again. Otherwise you can carry on straight away. Restarting into the PS5 OS once is a check that it accepts the drive: should it ask to format the drive again, say so on [Discord](https://discord.gg/ps5linux) with the drive's model and size, because that combination hasn't been seen before.

## Put Linux on it

This step depends on your image:

- **[PS5 Bazzite Deck](/installation/m2-bazzite-deck):** one command moves the system you are running, with your games, settings and files, so nothing needs setting up again.
- **[Other images](/installation/m2-other-images):** a fresh copy of the image goes onto the M.2, and the boot line points at it.

## PS5 Bazzite Deck {#ps5-bazzite-deck}

See **[Install to the M.2: PS5 Bazzite Deck](/installation/m2-bazzite-deck)**.

## Next steps

- [After installing](/post-install/all-distros)
- [Drives and USB ports](/getting-started/drives#m2-ssds): which M.2 drives work
