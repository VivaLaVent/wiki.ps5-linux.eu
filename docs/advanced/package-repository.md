---
title: Package repository
sidebar_position: 2
description: Install and update the PS5 kernel, Wi-Fi driver and tools with your package manager (repo.etawen.dev).
---

# Package repository

[repo.etawen.dev](https://repo.etawen.dev) is an unofficial, community-run package repository for pacman, apt and dnf, hosted by [etawen.dev](https://etawen.dev). It provides the PS5 kernel, the Wi-Fi driver, fan/boost controls and the payload SDK, so you can install and update them with your package manager instead of running install scripts by hand.

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
| `linux-ps5` | The PS5 Linux kernel, mirrored from the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases) (a package for every commit on `main`, 7.2.3 at the time of writing; rmuxnet's 7.3.1 release isn't packaged, see [Kernel setup](/advanced/kernel)). Its install hook builds the initramfs (it detects update-initramfs, dracut, mkinitcpio or mkinitfs), mounts `/boot/efi` if needed (from fstab, or `LABEL=boot` as a fallback), and copies the kernel and initrd to `/boot/efi/` for the loader. **It already includes the Wi-Fi driver**, so Wi-Fi works with this package alone. |
| `ps5-linux-mwifiex` | **Optional override** of the NXP IW620 Wi-Fi driver (`moal` + `mlan`). Only install it if you want a newer driver build than the one included in your kernel. It requires one exact `linux-ps5` version. The firmware (`nxp/pcieuartiw620_combo_v1.bin`) is Sony-proprietary: `linux-ps5`'s firmware service copies it into place on the first boot, from where the loader left it. |
| `ps5-linux-tools` | Fan and CPU/GPU boost control: the `ps5_control` program plus `ps5fan.service` and `ps5boost.service`, both enabled by default so the fan and boost turn on at every boot. On the current 7.2.3 packages only the CPU boost still needs it. Not for rmuxnet's 7.3.1 kernel, see [Clocks and boost](/hardware/gpu#clocks-and-boost). Upstream: [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools). |
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
sudo sync && sudo sh -c 'echo b > /proc/sysrq-trigger'
```

The sysrq reboot is needed because Bazzite's `rpm-ostree-systemctl` wrapper swallows `systemctl reboot`. On older images where `dnf install` only prints a link to the Bazzite docs and exits, use `dnf5 install` instead. Later updates:

```bash
sudo dnf upgrade -y linux-ps5 ps5-linux-tools --setopt=gpgcheck=0
```

:::note
[PS5 Bazzite Deck](/installation/bazzite-deck) has its own kernel and update process; follow its release notes instead.
:::

## Update the kernel later

One command for any distro:

```bash
curl -fsSL https://repo.etawen.dev/update-kernel.sh | sudo sh
```

It detects your package manager (pacman, apt, dnf, dnf5 or rpm-ostree), adds the repository first if needed, skips `ps5-linux-mwifiex` when your kernel already includes the driver, and only reboots if the kernel actually changed. Add `-s -- --no-reboot` after `sh` to skip the reboot.

## Install a specific kernel version

Every tagged upstream release is mirrored (for example `7.0.5`, `7.0.8`, `7.0.10`, `7.1.1` and `7.1.2`). This is useful for staying on **7.0.10** on [M.2 installs](/troubleshooting/known-issues#kernel-update-breaks-m2-boot).

**Arch:** the pacman database only lists the newest version, so install older ones by URL:

```bash
sudo pacman -U https://repo.etawen.dev/arch/linux-ps5-7.0.10-1-x86_64.pkg.tar.zst
```

**Debian / Ubuntu:**

```bash
apt-cache madison linux-ps5
sudo apt install linux-ps5=7.1.1-8
```

**Fedora / Bazzite:**

```bash
dnf --showduplicates list linux-ps5
sudo dnf install --setopt=gpgcheck=0 linux-ps5-7.1.1-8
```

## Fix scripts for older images

One-line fixes for older images, or when something wasn't set up properly on the first boot. All of them are safe to run more than once.

| Command | What it fixes |
| --- | --- |
| `curl -fsSL https://repo.etawen.dev/fix-wifi.sh \| sudo bash` | Copies the IW620 firmware from `/boot/efi/lib/nxp/` to `/lib/firmware/nxp/`, installs the service that does this automatically, and switches NetworkManager from `iwd` to `wpa_supplicant` (needed on Bazzite). |
| `curl -fsSL https://repo.etawen.dev/fix-bluetooth.sh \| sudo bash` | Turns off phantom `hciN` Bluetooth adapters (address all zeros), turns on the working one, and installs a service that does this at boot. |
| `curl -fsSL https://repo.etawen.dev/fix-grow-rootfs.sh \| sudo bash` | For images where the `grow-rootfs` service failed: repairs the partition table, extends the root partition to fill the drive, and resizes the filesystem without unmounting it. |
| `curl -fsSL https://repo.etawen.dev/fix-cachyos.sh \| sudo bash` | CachyOS-specific fixes for the image. |

## Troubleshooting

**"certificate is not yet valid" when refreshing the repository:** the PS5's clock is wrong. Force a time sync with `sudo chronyc makestep`, or set the time manually with `sudo timedatectl set-time "YYYY-MM-DD HH:MM:SS"`.

**"Could not resolve host: repo.etawen.dev" inside rpm-ostree on Bazzite:** systemd-resolved is stuck. Run `sudo systemctl restart systemd-resolved`.

**`rpm-ostree` refuses with "This system was not booted via libostree" on Bazzite:** the loader's boot chain doesn't create `/run/ostree-booted`. Run `sudo touch /run/ostree-booted`, then `sudo rpm-ostree install ...` works. To reboot, use `sudo sync && sudo sh -c 'echo b > /proc/sysrq-trigger'`, because the `rpm-ostree-systemctl` wrapper swallows `systemctl reboot`.

**"ld-linux-aarch64.so.1 not found" during `dnf upgrade`:** you have an old, badly converted RPM. Upgrade to `7.1.1-8` or newer: `sudo dnf upgrade --setopt=gpgcheck=0 linux-ps5`.

**`fatal error: linux/errno.h: No such file or directory` when compiling on Debian/Ubuntu:** newer `linux-ps5` packages no longer ship `/usr/include/linux/*`, to stop clashing with the distro's own headers. If you upgraded from a flashed image, the old headers were removed and the distro ones were never installed. Fix it with `sudo apt install linux-libc-dev`. On Arch: `sudo pacman -S linux-api-headers`. On Fedora: `sudo dnf install kernel-headers`.

**`/boot/efi exists but is not mounted, attempting to mount...` during install:** this is normal. If you also see `ERROR: could not mount EFI partition; aborting`, mount `/dev/disk/by-label/boot` at `/boot/efi` yourself and run the install again.

**No Wi-Fi networks on Bazzite (NetworkManager stuck):** Bazzite uses `iwd` as the Wi-Fi backend by default, which doesn't work with the IW620 driver. Switch back to `wpa_supplicant` with `ujust toggle-iwd` (choose "disable iwd"), then run `sudo systemctl restart NetworkManager`. Images built after 2026-06-30 already include the fix.
