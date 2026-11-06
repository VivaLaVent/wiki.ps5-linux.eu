---
title: Choose your image
sidebar_label: Choose your image
sidebar_position: 6
description: How the PS5 images differ, what each one bundles and what you set up yourself, and which kernel each one runs.
hardware: [original, slim, pro]
applies_to: all
---

# Choose your image

There are three ways to run Linux on a PS5. Order reflects the recommendation.

1. **[PS5 Bazzite Deck](/choose/bazzite-deck)**: a Steam console. Boots into Steam Gaming Mode with a KDE desktop one click away; Wi-Fi, Bluetooth, the fan, the PS5 Pro and the display fixes on this wiki are set up, and updates are one command.
2. **[An official image](/choose/official-images)**: Ubuntu 26.04, Arch, CachyOS, Fedora 44, Debian 12 or upstream's Bazzite builds, from the ps5-linux project. A normal distro you set up yourself; update its kernel right after installing.
3. **[Build it yourself](/choose/build-your-own)**: an official image, PS5 Bazzite Deck, or only the kernel, from current sources.

Every image is a normal distro plus the same PS5 parts: a patched kernel on the boot partition, the Wi-Fi driver and a few services. They differ in how much of that is set up for you: PS5 Bazzite Deck skips most of [After installing](/post-install/all-distros), the others work through it.

:::info[Who writes this wiki]
This wiki is maintained by Gilles (VivaLaVent), who also makes PS5 Bazzite Deck. It is recommended first because its kernel had the fixes first; the other images catch up with each kernel release, see [Status by kernel](/getting-started/hardware#by-kernel).
:::

## Next steps

Pick one and download it:

- **[PS5 Bazzite Deck](/choose/bazzite-deck)** (recommended)
- **[Official images](/choose/official-images)**
- **[Build your own](/choose/build-your-own)**

All three continue with **[Flash the image to USB](/installation/flash)**.
