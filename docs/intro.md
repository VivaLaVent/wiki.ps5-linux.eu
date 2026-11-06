---
slug: /
sidebar_label: Welcome
title: Linux on the PS5
description: A community wiki for running a full Linux desktop on the PS5, from the first boot to troubleshooting.
hardware: [original, slim, pro]
applies_to: all
---

# Linux on the PS5

This wiki documents how to run Linux on the **PS5**. A jailbroken console hands control to a small payload, the Linux loader, which starts a patched Linux kernel with a full desktop.

Linux lives on a USB drive or on an M.2 SSD. The internal SSD is never written to, so the PS5 OS keeps working as before. Nothing is installed on the console itself: you run the exploit and the loader each time you want Linux, and a normal power-on starts the PS5 OS.

The ready-made images are a convenience, not a requirement: the PS5 kernel is stock Linux plus one patch set (see [Kernel setup](/post-install/kernel)), so any distro can be made to run, and people have brought up their own from scratch.

:::tip[New here?]
Start with [Getting started](/getting-started/overview). It lists what you need and walks you through every step in order. Not sure which image to pick? [Which image should I use?](/getting-started/which-image)
:::

The wiki follows the order you need it in: **Before you install** (firmware, [hardware status](/getting-started/hardware), drives, loader and image), **Install**, **After installing** (for every image, for PS5 Bazzite Deck, and for the other distros), and **Troubleshooting**, with one page per component and one for [error messages](/troubleshooting/error-messages).

## Resources

- [ps5-linux GitHub organisation](https://github.com/ps5-linux)
- [ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader): the payload that boots Linux
- [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches): the patched kernel (official repository, packaged releases)
- [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1): rmuxnet's fork with its own releases, see [Kernel setup](/post-install/kernel)
- [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools): fan, boost and M.2 tools
- [ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex): internal Wi-Fi driver
- [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image): ready-made distro images
- [PS5 Bazzite Deck](https://github.com/VivaLaVent/ps5-bazzite-deck): Bazzite with Steam Gaming Mode
- [repo.etawen.dev](https://repo.etawen.dev): package repository for the kernel and tools
- [Discord server](https://discord.gg/ps5linux): help, tips, development and bug reports
- [Video guide by Modded Warfare](https://www.youtube.com/watch?v=4Iix8SaJtaM)
- [PS4 Linux guide](https://github.com/DionKill/ps4-linux-tutorial/)

Spotted a mistake or have something to add? Every page has an **Edit this page** link at the bottom. Corrections are welcome.
