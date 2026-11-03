---
title: Which image should I use?
sidebar_label: Which image
sidebar_position: 4
description: How the PS5 images differ, what each one bundles and what you set up yourself, and which kernel each one runs.
hardware: [original, slim, pro]
applies_to: all
---

# Which image should I use?

There are three ways to run Linux on a PS5. Order reflects the recommendation.

1. **[PS5 Bazzite Deck](/installation/bazzite-deck)**: a Steam console. Boots into Steam Gaming Mode with a KDE desktop one click away; Wi-Fi, Bluetooth, the fan, the PS5 Pro and the display fixes on this wiki are set up, and updates are one command.
2. **[An official image](/installation/linux-image#official-images)**: Ubuntu 26.04, Arch, CachyOS, Fedora 44, Debian 12 or upstream's Bazzite builds, from the ps5-linux project. A normal distro you set up yourself; update its kernel right after installing.
3. **[Build it yourself](/installation/linux-image#build-your-own-image)**: the official builder from current sources, or your own [kernel](/advanced/kernel).

Every image is a normal distro plus the same PS5 parts: a patched kernel on the boot partition, the Wi-Fi driver and a few services. They differ in how much of that is set up for you. The kernel can be swapped on any of them.

:::info[Who writes this wiki]
This wiki is maintained by Gilles (VivaLaVent), who also makes PS5 Bazzite Deck. It is recommended first because its kernel had the fixes first; treat the table below as a snapshot, the other images catch up with each kernel release.
:::

## What is bundled where

Most differences are kernel differences, so the third column says where the same thing stands for the other images:

| Topic | PS5 Bazzite Deck | Other images |
| --- | --- | --- |
| Internal Wi-Fi (IW620) | Built in | In the `linux-ps5` package and in rmuxnet's release; by hand on other kernels, and again after a kernel update |
| MediaTek Wi-Fi (Slim, Pro) | Built in | In every current kernel |
| MediaTek Bluetooth (Slim, Pro) | Built in | rmuxnet's release carries a different patch, reported broken by its author; not upstream |
| Fan | Firmware control, 80 °C | Curve by default in rmuxnet's release and in the current upstream packages |
| CPU boost | On (`ps5-perf`) | A sysfs switch on rmuxnet's release; `ps5_control` on upstream kernels |
| GPU clock | Governor with a thermal limit | The same governor upstream; rmuxnet's own driver on his release |
| DualSense reconnects, one controller for the PS5 OS and Linux | Set up | Services from the image repository that run on any distro, see [DualSense](/using-linux/dualsense) |
| 4K120, HDR, HDMI CEC | On FLAVA3 consoles | In every current kernel |
| VRR, display link lock | On FLAVA3 consoles | Not upstream yet |
| PS5 Pro GPU firmware | Staged into the initrd automatically | The `linux-ps5` package stages it; by hand otherwise, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware) |
| Sleep and wake | Suspend-to-idle | An open pull request on rmuxnet's repository |
| Kernel updates | In place, one command, with an undo | Package repository on apt, pacman and dnf; rmuxnet's `install.sh`; or by hand |

You still need a jailbreak and the loader, whichever image you pick.

## Where to go next

- [Get a Linux image](/installation/linux-image)
- [PS5 Bazzite Deck](/installation/bazzite-deck)
- [After installing](/post-install/all-distros)
