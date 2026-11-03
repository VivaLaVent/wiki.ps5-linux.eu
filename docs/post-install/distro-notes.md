---
title: "After installing: distro notes"
sidebar_label: Distro notes
sidebar_position: 3
description: Package-manager commands for the PS5 packages on Ubuntu, Debian, Arch, CachyOS and Fedora.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# After installing: distro notes

:::note[Not for PS5 Bazzite Deck]
PS5 Bazzite Deck updates with its own command, see [PS5 Bazzite Deck](/choose/bazzite-deck).
:::

Only the package manager differs between distros. The hardware steps are the same everywhere and live on [All distros](/post-install/all-distros) and [Other images](/post-install/not-bazzite-deck).

| Distro | Package manager | Add the PS5 repository | Update the kernel |
| --- | --- | --- | --- |
| Ubuntu, Debian | `apt` | [Package repository](/advanced/package-repository#add-the-repository-once) | `sudo apt update && sudo apt upgrade` |
| Arch, CachyOS | `pacman` | [Package repository](/advanced/package-repository#add-the-repository-once) | `sudo pacman -Syu` |
| Fedora | `dnf` | [Package repository](/advanced/package-repository#add-the-repository-once) | `sudo dnf upgrade` |

The repository's install script detects which one you use: `curl -fsSL https://repo.etawen.dev/install.sh | sudo sh`.

## Distro specifics

**Arch:** the image with the least running in the background; Sway leaves the most memory for games.

**CachyOS:** `sudo pacman -S cachyos-handheld` converts a plain install into a Gamescope-first setup with a "switch to desktop" option.

**Ubuntu:** install Steam from Steam's own package, not the Snap version, see [Gaming performance](/post-install/all-distros#gaming-performance).

**Upstream's Bazzite images:** Bazzite is an image-based system; install software as [Bazzite's documentation](https://docs.bazzite.gg/Installing_and_Managing_Software/) describes, and add the PS5 kernel packages with `rpm-ostree` as the repository's install script prints.

## Next steps

- [DualSense](/using-linux/dualsense): one controller for the PS5 system and Linux
- [Hardware status](/hardware/matrix): what works on your console
- [Troubleshooting & help](/troubleshooting/getting-help)
