---
title: Which image should I use?
sidebar_label: Which image
sidebar_position: 4
description: Why PS5 Bazzite Deck is the least work for most people, when a general Linux image is the better choice, and what each path commits you to.
---

# Which image should I use?

There are two ways to run Linux on a PS5, and the choice decides how much of this wiki you need to read.

## The console path: PS5 Bazzite Deck

[PS5 Bazzite Deck](/installation/bazzite-deck) boots into Steam's Gaming Mode, with a KDE desktop one click away. It is the least work because the PS5-specific fixes documented on this wiki are already applied in the image:

| Problem on a general image | On PS5 Bazzite Deck |
| --- | --- |
| Internal Wi-Fi needs a driver install, and again after every kernel update | Built in, for the Marvell IW620 and the MediaTek chips on the Slim and the Pro |
| CPU boost is off until you install `ps5-linux-tools` (upstream kernels) | On by default (`ps5-perf`) |
| DualSense pairs once and then won't reconnect | Fixed, and one controller keeps separate pairings for the PS5 OS and Linux |
| Black screens from the internal display link | Link locked at full rate at every boot |
| 1440p120, 4K120, HDR, VRR, HDMI CEC | Working on FLAVA3 consoles |
| Kernel updates mean rebuilding or repackaging | Updates in place with one command, with an undo |
| PS5 Pro GPU firmware | Staged into the initrd automatically |
| Sleep and wake | Suspend-to-idle |

You still need a jailbreak and the loader, like any other image. What you give up: it is Fedora-based and immutable, so installing software outside Flatpak and the desktop's own tools takes extra steps, and it is tuned for Steam first.

## The general path: a distro of your choice

Pick Ubuntu, Arch, Fedora, Debian, Alpine, Proxmox or any of the other [images](/installation/linux-image), and you get a normal Linux system that happens to run on a PS5. This is the right choice if you want a server, a desktop that isn't built around Steam, a specific distro, or to build your own kernel.

The cost is that you apply the PS5-specific pieces yourself. The [Post-install checklist](/installation/post-install) lists them in order; most take a few minutes each, and the [package repository](/advanced/package-repository) does the kernel and Wi-Fi driver for you on apt, pacman and dnf systems.

## Recommendation

- **You want to play games and have it work:** PS5 Bazzite Deck.
- **You want a desktop or a server:** one of mia's [community images](/installation/linux-image#community-images-mias-builds), which grow the root partition by themselves and take kernel updates from the package repository. Ubuntu is the usual first choice.
- **You want to build images or kernels:** start from the [official builder](/installation/linux-image#official-images) or [build an image](/advanced/image-build).

## Where to go next

- [Get a Linux image](/installation/linux-image)
- [PS5 Bazzite Deck](/installation/bazzite-deck)
- [Post-install checklist](/installation/post-install)
