---
title: Which image should I use?
sidebar_label: Which image
sidebar_position: 4
description: How the PS5 images differ, what each one bundles and what you set up yourself, and which kernel each one runs.
---

# Which image should I use?

Every PS5 image is a normal Linux distro plus the same PS5 parts: a patched kernel on the boot partition, the Wi-Fi driver and a few services. The images differ in the distro, in how much of that is already set up, and in which kernel they run. The kernel is the part that moves fastest, and it can be swapped on any image, see [Kernel setup](/advanced/kernel).

:::info[Who writes this wiki]
This wiki is maintained by Gilles (VivaLaVent), who also makes [PS5 Bazzite Deck](/installation/bazzite-deck). Where the image is recommended below, that is why it exists: its kernel had the fixes first. Treat the comparison as a snapshot; the other images catch up with each kernel release.
:::

## A distro of your choice

Pick Ubuntu, Arch, Fedora, Debian, Alpine, Proxmox or any of the other [images](/installation/linux-image), and you get a normal Linux system that happens to run on a PS5. This is the right choice if you want a server, a desktop that isn't built around Steam, a specific distro, or to build your own kernel.

You apply the PS5-specific pieces yourself. The [Post-install checklist](/installation/post-install) lists them in order; most take a few minutes each. On apt, pacman and dnf systems the [package repository](/advanced/package-repository) installs and updates the upstream kernel with the Wi-Fi driver, and [rmuxnet's release](/advanced/kernel#install-rmuxnets-release) installs with one script on any of them.

## A ready-made gaming image: PS5 Bazzite Deck

[PS5 Bazzite Deck](/installation/bazzite-deck) boots into Steam's Gaming Mode, with a KDE desktop one click away, and ships with the PS5 fixes applied. What you give up: it is Fedora-based and immutable, so installing software outside Flatpak and the desktop's own tools takes extra steps, it is tuned for Steam first, and its kernel is its own build, updated with the image.

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

## Recommendation

- **A Steam console with the least setup:** PS5 Bazzite Deck.
- **A desktop or a server:** one of mia's [community images](/installation/linux-image#community-images-mias-builds), which grow the root partition by themselves and take kernel updates from the package repository. Ubuntu is the usual first choice.
- **Your own distro, image or kernel:** start from the [official builder](/installation/linux-image#official-images), then [Kernel setup](/advanced/kernel) and [Kernel sources and patches](/advanced/kernel-sources).

## Where to go next

- [Get a Linux image](/installation/linux-image)
- [PS5 Bazzite Deck](/installation/bazzite-deck)
- [Post-install checklist](/installation/post-install)
