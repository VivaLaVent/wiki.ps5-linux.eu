---
title: "After installing: other images"
sidebar_label: Other images
sidebar_position: 4
description: What the official images and self-built installs need set up by hand that PS5 Bazzite Deck does for you, and the commands per distro.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# After installing: other images

:::note[Not for PS5 Bazzite Deck]
PS5 Bazzite Deck sets all of this up. Its users can skip this page.
:::

Do these after [All images](/post-install/all-distros), on the official images and on installs you built yourself.

## 1. Update the kernel

The official release images run an older kernel than the current packages. Add the [package repository](/post-install/package-repository) once, then update the kernel with your package manager. On self-built installs, see [Kernel setup](/post-install/kernel).

## 2. Stop the distro from replacing the kernel

The PS5 kernel comes from `ps5-linux-patches`, not from your distro. A distro upgrade that installs a stock kernel into the boot partition leaves you with a system that doesn't boot. On Ubuntu and Debian, hold the stock kernel packages:

```bash
sudo apt-mark hold linux-generic linux-generic-hwe-24.04 linux-generic-hwe-26.04 \
  linux-image-generic linux-image-generic-hwe-24.04 linux-image-generic-hwe-26.04 \
  linux-headers-generic linux-headers-generic-hwe-24.04 linux-headers-generic-hwe-26.04
```

On Arch and Fedora, the `linux-ps5` package from the [package repository](/post-install/package-repository) is the kernel; don't install the distro's `linux` or `kernel` package alongside it.

## 3. Fan, boost and clocks

What you do here depends on the kernel, see [Kernel setup](/post-install/kernel):

- **rmuxnet's kernel:** the fan follows a temperature curve and the GPU clock scales by itself. Turn the CPU boost on if you want it: `echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost` (put it in a systemd unit to keep it). Don't install `ps5-linux-tools` for the boost on this kernel.

- **Upstream kernels:** the CPU stays at 3.2 GHz until `ps5_control --boost on`. Current packages run the fan curve and the GPU governor by themselves; older ones also need `ps5_control --fan on`. [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) adds both as services; on a distro with the [package repository](/post-install/package-repository), `ps5-linux-tools` is a package that does the same:

```bash
git clone https://github.com/ps5-linux/ps5-linux-tools
cd ps5-linux-tools
sudo ./install.sh
```

`install.sh` builds `ps5_control`, installs it to `/usr/local/sbin/ps5_control`, and enables two services:

| Service | Runs | Does |
| --- | --- | --- |
| `ps5fan.service` | `ps5_control --fan on` | Fan control through the console's thermal controller |
| `ps5boost.service` | `ps5_control --boost on` | Boost mode for the CPU and GPU |

Check them with `sudo systemctl status ps5fan ps5boost`, and turn either off with `sudo systemctl disable --now ps5fan.service` (or `ps5boost.service`). How the fan works is on [Fan control](/troubleshooting/fan), the clocks on [Clocks and boost](/troubleshooting/gpu#clocks-and-boost).

## 4. Wi-Fi and Bluetooth

- **MediaTek (most Slims, the PS5 Pro):** Wi-Fi works with the in-kernel driver in every current kernel. Bluetooth needs fixes that only PS5 Bazzite Deck carries so far.
- **Marvell IW620 (most original PS5s):** Wi-Fi needs the out-of-tree driver.

On the IW620, a kernel from the package repository or rmuxnet's release bundles the driver; with any other kernel, install it after every kernel update, see [Wi-Fi](/troubleshooting/wifi). Ethernet works out of the box. Bluetooth details are on [Bluetooth](/troubleshooting/bluetooth).

## 5. PS5 Pro: the GPU firmware

The Pro's GPU needs its own firmware in the initrd. The `linux-ps5` package stages it; otherwise see [PS5 Pro](/troubleshooting/ps5-pro).

## 6. Tune cmdline.txt

Two parameters on the boot partition are worth a look, see [Boot options](/post-install/other-boot-options):

- `video=DP-1:1920x1080@60`: the safe boot mode. Keep it, and set your real resolution from the desktop.
- `amdgpu.force_1080p=1`: caps output at 1080p60. Remove it unless you need it to get a picture at all.

## 7. Steam and Mesa

:::warning[Don't use the Snap version of Steam (Ubuntu)]
Ubuntu's Snap package of Steam runs in a sandbox that gets in the way on the PS5 images. Install Steam from apt instead (or the `.deb` from [store.steampowered.com/about](https://store.steampowered.com/about/)):

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install steam
```
:::

**Newer Mesa (Ubuntu only):** the PS5's GPU (GFX1013) picks up fixes in newer Mesa releases, and Ubuntu's own packages lag behind. The kisak PPA is the usual source there: `sudo add-apt-repository ppa:kisak/kisak-mesa` then `sudo apt upgrade`. Arch and Fedora ship recent Mesa already, and on Bazzite it comes with the image.

## Package manager per distro {#distro-notes}

Only the package manager differs between distros; the steps above are the same everywhere.

| Distro | Package manager | Add the PS5 repository | Update the kernel |
| --- | --- | --- | --- |
| Ubuntu, Debian | `apt` | [Package repository](/post-install/package-repository#add-the-repository-once) | `sudo apt update && sudo apt upgrade` |
| Arch, CachyOS | `pacman` | [Package repository](/post-install/package-repository#add-the-repository-once) | `sudo pacman -Syu` |
| Fedora | `dnf` | [Package repository](/post-install/package-repository#add-the-repository-once) | `sudo dnf upgrade` |

The repository's install script detects which one you use: `curl -fsSL https://repo.etawen.dev/install.sh | sudo sh`.

### Distro specifics

**Arch:** the image with the least running in the background; Sway leaves the most memory for games.

**CachyOS:** `sudo pacman -S cachyos-handheld` converts a plain install into a Gamescope-first setup with a "switch to desktop" option.

**Ubuntu:** install Steam from Steam's own package, not the Snap version, see [Steam and Mesa](#7-steam-and-mesa).

**Upstream's Bazzite images:** Bazzite is an image-based system; install software as [Bazzite's documentation](https://docs.bazzite.gg/Installing_and_Managing_Software/) describes, and add the PS5 kernel packages with `rpm-ostree` as the repository's install script prints.
