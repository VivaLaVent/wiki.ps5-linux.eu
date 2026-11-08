---
title: "Install to the M.2: other images"
sidebar_label: Other images
sidebar_position: 2
description: Install an official or self-built PS5 Linux image onto the PS5's M.2 SSD with ps5-linux-tools, and start it from there.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Install to the M.2: other images

The image is written to the M.2 as a fresh install, so you set it up again there. First [install the drive and run `m2_init`](/installation/m2-install), and put the image's `.img` file somewhere the running system can read it.

## Install the image onto the drive

```bash
cd ~/ps5-linux-tools
chmod +x ./m2_install.sh
sudo ./m2_install.sh --install /path/to/ps5-ubuntu2604.img
```

## Start from the drive

```bash
cd ~/ps5-linux-tools
chmod +x ./m2_exec.sh
sudo ./m2_exec.sh
```

To start from the M.2 every time, edit `/boot/efi/cmdline.txt` and change `root=LABEL=ubuntu2604` to `root=LABEL=ubuntu2604-m2`, see [Boot options](/post-install/boot-options#edit-cmdlinetxt).

## Switching distros

There is no need to format the drive from the PS5 OS again. The PS5's format only rewrites the blocks it uses itself and leaves the Linux partition as it is. To change distro, format the Linux partition from Linux (`sudo mkfs.ext4 /dev/nvme0n1p1`, the partition `m2_init` created) and install the new image.

## No 64 GB USB drive? {#no-64-gb-usb-drive}

A USB drive too small for the full image can still get you onto the M.2: the community script at [github.com/g4caos/ps5-linux-script](https://github.com/g4caos/ps5-linux-script) copies the running Linux system to the M.2 drive with rsync, so no image file is needed on the USB side.
