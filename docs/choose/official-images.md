---
title: Official images
sidebar_label: Official images
sidebar_position: 2
description: "The ps5-linux project's own images: Ubuntu, Arch, CachyOS, Fedora, Debian and two Bazzite builds. Download and verify."
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Official images

Normal distros with the PS5 kernel, built by the ps5-linux project. You set up more yourself after installing than on PS5 Bazzite Deck; the steps are on [After installing](/post-install/all-distros).

The [ps5-linux-image release](https://github.com/ps5-linux/ps5-linux-image/releases/tag/latest) has these images:

| Distro | Desktop | Notes |
| --- | --- | --- |
| Ubuntu 26.04 | GNOME | The usual first choice |
| Arch | Sway | The lightest: a few hundred MB of RAM at idle |
| CachyOS | Gamescope + Steam Big Picture, KDE Plasma (no SDDM) | Gaming-focused. [Currently broken](/troubleshooting/error-messages#cachyos-image-doesnt-boot). |
| Fedora 44 | GNOME (Wayland) | |
| Debian 12 | | |
| Bazzite (KDE gaming) | KDE Plasma | Upstream's Bazzite build |
| Bazzite Deck UI | Steam Gaming Mode | Upstream's own build, **not** [PS5 Bazzite Deck](/choose/bazzite-deck) |

:::warning[Update the kernel after installing]
The release images are not rebuilt often: the current set was built on 31 July 2026 with kernel 7.1.4, which predates the PS5 Pro's GPU support and the Slim's Wi-Fi. After the first boot, update the kernel with the [package repository](/post-install/package-repository#update-the-kernel-later).
:::

The builder can also make a **multi-distro image** with Ubuntu, Arch and CachyOS side by side on one drive, switched with kexec.

## Download


Download an image from the [ps5-linux-image releases](https://github.com/ps5-linux/ps5-linux-image/releases/tag/latest). Pick the `.img.xz` file for your distro and decompress it.

## Verify the download


An image that won't boot is often an image that didn't download completely. Compare the checksum of your file with the one on the release page.

```bash
sha256sum ps5-ubuntu2604.img.xz
```

On Windows, run `Get-FileHash ps5-ubuntu2604.img.xz -Algorithm SHA256` in PowerShell. The values must match exactly.

## Next steps

**[Flash the image to USB](/installation/flash)**, then start Linux and work through the first boot.
