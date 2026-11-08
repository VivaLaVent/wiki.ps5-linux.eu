---
title: Package repository
sidebar_position: 1
description: Install and update the PS5 kernel, Wi-Fi driver and tools with your package manager (repo.etawen.dev).
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Package repository

[repo.etawen.dev](https://repo.etawen.dev) is an unofficial, community-run package repository for pacman, apt and dnf, hosted by [etawen.dev](https://etawen.dev). It provides the PS5 kernel, the Wi-Fi driver, fan/boost controls and the payload SDK, so you can install and update them with your package manager instead of running install scripts by hand.

:::note[Not for PS5 Bazzite Deck]
The repository serves Ubuntu, Arch and Fedora installs. PS5 Bazzite Deck users: your kernel and drivers come with the image and its updates; don't add this repository there.
:::

## Add the repository (once)

### Quickest (any distro)

```bash
curl -fsSL https://repo.etawen.dev/install.sh | sudo sh
```

:::warning
[Read the script](https://repo.etawen.dev/install.sh) before running it. Never pipe code you haven't checked into a shell.
:::

The script detects whether you use pacman, apt or dnf, and adds the repository and its signing key. On Bazzite it also prints the right `rpm-ostree install` command, because `dnf install` is blocked there for new packages.

### Manual setup

**Arch / CachyOS / Artix:**

```bash
curl -fsSL https://repo.etawen.dev/key.asc | sudo pacman-key --add -
sudo pacman-key --lsign-key 93AB12C4159FEDAB

echo -e "\n[ps5]\nServer = https://repo.etawen.dev/arch" \
    | sudo tee -a /etc/pacman.conf
sudo pacman -Sy
```

**Debian / Ubuntu / Mint / Devuan:**

```bash
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://repo.etawen.dev/key.asc | sudo gpg --dearmor --yes \
    -o /etc/apt/keyrings/etawen-ps5.gpg

echo "deb [signed-by=/etc/apt/keyrings/etawen-ps5.gpg] https://repo.etawen.dev/deb ./" \
    | sudo tee /etc/apt/sources.list.d/etawen-ps5.list
sudo apt update
```

**Fedora / Bazzite:**

```bash
sudo curl -fsSL https://repo.etawen.dev/key.asc \
    -o /etc/pki/rpm-gpg/RPM-GPG-KEY-etawen-ps5

sudo tee /etc/yum.repos.d/etawen-ps5.repo <<'REPO'
[etawen-ps5]
name=Etawen PS5 repo
baseurl=https://repo.etawen.dev/rpm/
enabled=1
gpgcheck=0
repo_gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-etawen-ps5
REPO
```

## Available packages

| Package | What it does |
| --- | --- |
| `linux-ps5` | The PS5 Linux kernel, mirrored from the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases) (a package for every commit on `main`; rmuxnet's release isn't packaged, see [Kernel setup](/post-install/kernel)). Its install hook builds the initramfs (it detects update-initramfs, dracut, mkinitcpio or mkinitfs), mounts `/boot/efi` if needed (from fstab, or `LABEL=boot` as a fallback), and copies the kernel and initrd to `/boot/efi/` for the loader. **It already includes the Wi-Fi driver**, so Wi-Fi works with this package alone. |
| `ps5-linux-mwifiex` | **Optional override** of the NXP IW620 Wi-Fi driver (`moal` + `mlan`). Only install it if you want a newer driver build than the one included in your kernel. It requires one exact `linux-ps5` version. The firmware (`nxp/pcieuartiw620_combo_v1.bin`) is Sony-proprietary: `linux-ps5`'s firmware service copies it into place on the first boot, from where the loader left it. |
| `ps5-linux-tools` | Fan and CPU/GPU boost control: the `ps5_control` program plus `ps5fan.service` and `ps5boost.service`, both enabled by default so the fan and boost turn on at every boot. On the current packages only the CPU boost still needs it. Not for rmuxnet's kernel, see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost). Upstream: [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools). |
| `ps5-payload-sdk` | The PS5 payload development SDK, mirrored from [ps5-payload-dev/sdk](https://github.com/ps5-payload-dev/sdk/releases). Installs to `/opt/ps5-payload-sdk/` and sets up `PS5_PAYLOAD_SDK` and your `PATH`. Pulls in clang, llvm, lld and make. |

## Install the packages

**Arch / CachyOS / Artix:**

```bash
sudo pacman -S linux-ps5 ps5-linux-tools ps5-payload-sdk
```

**Debian / Ubuntu / Mint / Devuan:**

```bash
sudo apt install linux-ps5 ps5-linux-tools ps5-payload-sdk
```

**Fedora:**

```bash
sudo dnf install --setopt=gpgcheck=0 linux-ps5 ps5-linux-tools ps5-payload-sdk
```

**Bazzite images from ps5-linux-image:** these images remove the ostree layer (`/usr` is a normal read-write ext4 root), so `rpm-ostree` doesn't work but plain `dnf install` does:

```bash
sudo dnf install linux-ps5 ps5-linux-tools
```

Bazzite's `rpm-ostree-systemctl` wrapper swallows `systemctl reboot` on these images; to restart, use `sudo sync && sudo sh -c 'echo b > /proc/sysrq-trigger'`. On older images where `dnf install` only prints a link to the Bazzite docs and exits, use `dnf5 install` instead. Later updates:

```bash
sudo dnf upgrade -y linux-ps5 ps5-linux-tools --setopt=gpgcheck=0
```

:::note
[PS5 Bazzite Deck](/choose/bazzite-deck) has its own kernel and update process; follow its release notes instead.
:::

## Update the kernel later

See [Updating: other images](/updating/other-images): one command for any distro, and how to go back to an earlier kernel.

## Fix scripts for older images

One-line fixes for older images, or when something wasn't set up properly on the first boot. All of them are safe to run more than once.

| Command | What it fixes |
| --- | --- |
| `curl -fsSL https://repo.etawen.dev/fix-wifi.sh \| sudo bash` | Copies the IW620 firmware from `/boot/efi/lib/nxp/` to `/lib/firmware/nxp/`, installs the service that does this automatically, and switches NetworkManager from `iwd` to `wpa_supplicant` (needed on Bazzite). |
| `curl -fsSL https://repo.etawen.dev/fix-bluetooth.sh \| sudo bash` | Turns off phantom `hciN` Bluetooth adapters (address all zeros), turns on the working one, and installs a service that does this at boot. |
| `curl -fsSL https://repo.etawen.dev/fix-grow-rootfs.sh \| sudo bash` | For images where the `grow-rootfs` service failed: repairs the partition table, extends the root partition to fill the drive, and resizes the filesystem without unmounting it. |
| `curl -fsSL https://repo.etawen.dev/fix-cachyos.sh \| sudo bash` | CachyOS-specific fixes for the image. |

Errors from the repository and its install script are on [Error messages](/troubleshooting/error-messages#package-repository).
