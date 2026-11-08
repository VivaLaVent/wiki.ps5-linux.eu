---
title: "Updating: other images"
sidebar_label: Other images
sidebar_position: 2
description: "Keep the PS5 kernel current on the official and self-built images, update the distro safely, and go back to an earlier kernel."
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Updating: other images

The distro updates itself like on any PC; the PS5 kernel comes from the [package repository](/post-install/package-repository) or from [Kernel setup](/post-install/kernel), not from the distro.

## Update the kernel {#update-the-kernel}

:::warning[M.2 installs]
A kernel update on an M.2 install has left some users with a black screen or a kernel that doesn't match its modules. Read [Kernel update breaks M.2 boot](/troubleshooting/error-messages#kernel-update-breaks-m2-boot) first.
:::

One command for any distro:

```bash
curl -fsSL https://repo.etawen.dev/update-kernel.sh | sudo sh
```

It detects your package manager (pacman, apt, dnf, dnf5 or rpm-ostree), adds the repository first if needed, skips `ps5-linux-mwifiex` when your kernel already includes the driver, and only reboots if the kernel actually changed. Add `-s -- --no-reboot` after `sh` to skip the reboot.

On rmuxnet's kernel, install the new release the same way as the first time, see [Install rmuxnet's release](/post-install/kernel#install-rmuxnets-release).

## Update the distro {#update-the-distro}

Update with your package manager as usual, with the stock kernel held so that the distro doesn't replace the PS5 kernel, see [Hold the stock kernel](/post-install/not-bazzite-deck#hold-the-stock-kernel).

## Go back to an earlier kernel {#install-a-specific-kernel-version}

Every tagged upstream release is mirrored, so you can go back to an earlier kernel, for example after a [kernel update that broke an M.2 install](/troubleshooting/error-messages#kernel-update-breaks-m2-boot).

**Arch:** the pacman database only lists the newest version, so install older ones by URL. Browse [repo.etawen.dev/arch](https://repo.etawen.dev/arch/) for the file name:

```bash
sudo pacman -U https://repo.etawen.dev/arch/linux-ps5-<version>-x86_64.pkg.tar.zst
```

**Debian / Ubuntu:**

```bash
apt-cache madison linux-ps5
sudo apt install linux-ps5=<version>
```

**Fedora / Bazzite:**

```bash
dnf --showduplicates list linux-ps5
sudo dnf install --setopt=gpgcheck=0 linux-ps5-<version>
```
