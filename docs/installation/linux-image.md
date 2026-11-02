---
title: Get and flash a Linux image
sidebar_label: Get a Linux image
sidebar_position: 1
description: Choose a distro, download or build a PS5 Linux image, and flash it to a USB drive.
---

# Get and flash a Linux image

## Available distros

| Distro | Desktop | Notes |
| --- | --- | --- |
| Ubuntu 26.04 (default) | GNOME | Recommended for beginners |
| Arch | Sway | Low overhead, about 750 MiB RAM at idle |
| CachyOS | Gamescope + Steam Big Picture, KDE Plasma (no SDDM) | Gaming-focused. [Currently broken](/troubleshooting/known-issues#cachyos-currently-broken). |
| Fedora | GNOME (Wayland) | |
| Debian 12 | Xfce | Successor to the old Kali-based image |
| Proxmox VE 8 | None (headless) | Runs the PS5 as a hypervisor |
| Bazzite | Gamescope + Steam | uBlue gaming Fedora, ostree-flattened |
| Bazzite Deck | Gamescope + Steam, Steam Deck-style UI | Bazzite's Steam Deck interface variant |
| Batocera | Retro emulation front end | Pre-built squashfs root filesystem |

You can also build a **multi-distro image** that switches between Ubuntu, Arch and CachyOS on the same USB drive using kexec.

### Distro-specific notes

**Arch:** the lowest-overhead option. With Sway as the window manager, idle RAM usage stays around 750 MiB, which leaves the most headroom for games and applications.

```text title="fastfetch on a PS5 running Arch"
                  -`                     ps5@archlinux
                 .o+`                    OS: Arch Linux x86_64
                `ooo/                    Host: PlayStation 5 (CFI-1016B 01Y)
               `+oooo:                   Kernel: Linux 7.1.0
              `+oooooo:                  Packages: 719 (pacman)
              -+oooooo+:                 Shell: fish 4.7.1
            `/:-:++oooo+:                CPU: 100-000000189 (16) @ 3.49 GHz
           `/++++/+++++++:               GPU: AMD Device 13FB
          `/++++++++++++++:              Memory: 750.04 MiB / 15.00 GiB (5%)
         `/+++ooooooooooooo/`            Disk (/): 29.04 GiB / 468.33 GiB (6%)
        ./ooosssso++osssssso+`           Local IP (wlp64s0f7): 192.168.1.81/24
       .oossssso-````/ossssss+`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  `/ossssso+/:-        -:/+osssso+-
 `+sso+:-`                 `.-/+oso:
`++:.                           `-/+/
.`                                 `/
```

**CachyOS:** running `sudo pacman -S cachyos-handheld` turns a normal CachyOS install into a Gamescope-first handheld setup with a "switch to desktop" option, so you don't have to set it up by hand.

**Batocera:** if you get a network connection but no display output on v43, that release ships Mesa 25.3.6 **without** the PS5 display patches. Either wait for a Batocera build with a newer Mesa, or rebuild Mesa yourself with the PS5 patches applied. This is a missing driver patch in the distro, not a `cmdline.txt` or EDID problem.

**Autologin on tty1 straight into Gamescope** (no SDDM or other display manager): add a systemd getty drop-in that autologins on tty1 only. Then make `~/.bash_profile` check that it is running on `/dev/tty1`, kill any leftover Steam helpers, and `exec` Gamescope with `steam -gamepadui`. Because the check is limited to tty1, SSH and other logins are unaffected. This avoids the black screen that some desktop-mode setups hit when switching sessions through SDDM.

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

# Single distro: ubuntu2604, arch, cachyos, fedora, debian, proxmox,
# bazzite, bazzite-deck, batocera
./build_image.sh --distro ubuntu2604
./build_image.sh --distro cachyos

# Multi-distro (Ubuntu + Arch + CachyOS, 32 GB image)
./build_image.sh --distro all

# Build only the kernel packages (.deb / .pkg.tar.zst), no image
./build_image.sh --kernel-only

# Build against a specific ps5-linux-patches branch, tag or commit
./build_image.sh --distro arch --patches-ref main
```

Images are written to `output/`; kernel-only builds go to `linux-bin/`. Later runs reuse the cached kernel and root filesystem automatically. Add `--clean` to wipe the cache and start fresh.

:::tip[WSL running out of memory during the build?]
Create or edit `C:\Users\<you>\.wslconfig` and raise the memory limit:

```ini title="C:\Users\<you>\.wslconfig"
[wsl2]
memory=8GB
```

Then restart WSL with `wsl --shutdown`.
:::

## Flash the image to USB

The drive must be **64 GB or larger**. An external SSD is strongly recommended.

**Linux or macOS:**

```bash
# Find your drive first with lsblk (Linux) or diskutil list (macOS)
sudo dd if=ps5-ubuntu2604.img of=/dev/sdX bs=4M status=progress conv=fsync
```

:::danger
Double-check the target device. `dd` overwrites whatever you point it at without asking.
:::

**Windows:** use [Rufus](https://rufus.ie/). balenaEtcher has known problems flashing PS5 images.

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
