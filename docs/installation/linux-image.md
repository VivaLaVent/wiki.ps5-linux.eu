---
title: Get and flash a Linux image
sidebar_label: Get a Linux image
sidebar_position: 1
description: Choose a distro, download or build a PS5 Linux image, and flash it to a USB drive.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Get and flash a Linux image

Three sources make PS5 images, and all of them boot the same way. This page helps you pick one, get it onto a drive, and edit its boot settings.

:::note[Not for PS5 Bazzite Deck]
This page is about the other images. PS5 Bazzite Deck users: your image has its own page, [PS5 Bazzite Deck](/installation/bazzite-deck).
:::

## Choose an image

Every image is a normal distro plus the same three PS5 parts: the patched kernel on the boot partition, the Wi-Fi driver and a few services. All of them are booted by the same [Linux loader](/installation/booting), and the kernel can be replaced on any of them, see [Kernel setup](/advanced/kernel). So the choice is mostly about the distro and how much is set up for you:

| Source | What you get | Kernel and updates |
| --- | --- | --- |
| [PS5 Bazzite Deck](/installation/bazzite-deck) (recommended) | Bazzite in Steam Deck mode with a KDE desktop; Wi-Fi, Bluetooth, the Slim's, the Pro's and the HDMI fixes from this wiki set up. | Its own kernel, updated in place with one command. |
| [Official images](#official-images) | The ps5-linux project's own builder: Ubuntu, Arch, CachyOS, Fedora, Debian and two Bazzite variants. The reference setup for other distros. | The upstream `linux-ps5` kernel; update it with the [package repository](/advanced/package-repository). |
| [Build your own](#build-your-own-image) | Any of the official images, built from current sources. | Whatever you build. |

:::info[Who writes this wiki]
This wiki is maintained by Gilles (VivaLaVent), who also makes PS5 Bazzite Deck. The image exists because its kernel carries fixes (VRR, the display link lock, the Slim's and Pro's Bluetooth, the Pro's GPU firmware staging) that the official patches didn't have at the time, so for a gaming console it is the least work. Those fixes are being merged into [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches) and [rmuxnet's fork](https://github.com/rmuxnet/ps5-linux-patches-1) over time, and every other image gets them with a kernel update. Nothing on this wiki needs that image: [Kernel setup](/advanced/kernel) and [Kernel sources and patches](/advanced/kernel-sources) apply to all of them.
:::

Not sure? [Which image should I use?](/getting-started/which-image) weighs the choice.

## Official images

The [ps5-linux-image release](https://github.com/ps5-linux/ps5-linux-image/releases/tag/latest) has these images:

| Distro | Desktop | Notes |
| --- | --- | --- |
| Ubuntu 26.04 | GNOME | The usual first choice |
| Arch | Sway | The lightest: a few hundred MB of RAM at idle |
| CachyOS | Gamescope + Steam Big Picture, KDE Plasma (no SDDM) | Gaming-focused. [Currently broken](/troubleshooting/known-issues#cachyos-image-doesnt-boot). |
| Fedora 44 | GNOME (Wayland) | |
| Debian 12 | | |
| Bazzite (KDE gaming) | KDE Plasma | Upstream's Bazzite build |
| Bazzite Deck UI | Steam Gaming Mode | Upstream's own build, **not** [PS5 Bazzite Deck](/installation/bazzite-deck) |

:::warning[Update the kernel after installing]
The release images are not rebuilt often: the current set was built on 31 July 2026 with kernel 7.1.4, which predates the PS5 Pro's GPU support and the Slim's Wi-Fi. After the first boot, update the kernel with the [package repository](/advanced/package-repository#update-the-kernel-later).
:::

The builder can also make a **multi-distro image** with Ubuntu, Arch and CachyOS side by side on one drive, switched with kexec.

### Distro-specific notes

**Arch:** the image with the least running in the background. Sway as the window manager leaves the most memory for games and applications.

**CachyOS:** `sudo pacman -S cachyos-handheld` converts a plain CachyOS install into the Gamescope-first setup with a "switch to desktop" option, so you don't have to put it together by hand.

**Autologin on tty1 straight into Gamescope** (no display manager): add a systemd getty drop-in that logs in on tty1 only, and make `~/.bash_profile` check for `/dev/tty1`, kill any leftover Steam helpers and `exec` Gamescope with `steam -gamepadui`. Because the check is limited to tty1, SSH and other logins aren't touched. This sidesteps the black screen that session switches through SDDM can cause.

## Download a pre-built image

Download an image from the [ps5-linux-image releases](https://github.com/ps5-linux/ps5-linux-image/releases/tag/latest). Pick the `.img.xz` file for your distro and decompress it.

## Build your own image

You need Docker and about 30 GB of free disk space.

```bash
# On Windows, run this inside WSL (install it first with: wsl --install)
sudo apt update && sudo apt install docker.io -y
sudo service docker start
sudo usermod -aG docker $USER
newgrp docker

git clone https://github.com/ps5-linux/ps5-linux-image
cd ps5-linux-image
chmod +x ./build_image.sh

# Single distro: ubuntu2604, arch, cachyos or fedora
./build_image.sh --distro ubuntu2604
./build_image.sh --distro cachyos

# Multi-distro (Ubuntu + Arch + CachyOS, 32 GB image)
./build_image.sh --distro all

# Build only the kernel packages (.deb / .pkg.tar.zst), no image
./build_image.sh --kernel-only

# Build against a specific ps5-linux-patches branch, tag or commit
./build_image.sh --distro arch --patches-ref main
```

Images are written to `output/`; kernel-only builds go to `linux-bin/`. A second run reuses the kernel and root filesystem from the cache; `--clean` starts from scratch.

:::tip[WSL running out of memory during the build?]
Create or edit `C:\Users\<you>\.wslconfig` and raise the memory limit:

```ini title="C:\Users\<you>\.wslconfig"
[wsl2]
memory=8GB
```

Then restart WSL with `wsl --shutdown`.
:::

## Verify the download

An image that won't boot is often an image that didn't download completely. Compare the checksum of your file with the one on the release page.

```bash
sha256sum ps5-ubuntu2604.img.xz
```

On Windows, run `Get-FileHash ps5-ubuntu2604.img.xz -Algorithm SHA256` in PowerShell. The values must match exactly.

## Flash the image to USB

The drive must be **64 GB or larger**, and an external SSD makes everything faster.

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

## Edit cmdline.txt from Windows

The kernel command line lives in `cmdline.txt` on the FAT32 partition of the USB drive. See [Kernel parameters](/advanced/kernel#kernel-parameters-cmdlinetxt) for what you can put in it.

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
