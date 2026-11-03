---
slug: /
sidebar_label: What is this?
title: Linux on the PlayStation 5
description: A community wiki for running a full Linux desktop on the PlayStation 5.
hardware: [original, slim, pro]
applies_to: all
---

# Linux on the PlayStation 5

This wiki documents how to run Linux on the **PlayStation 5**. A jailbroken console hands control to a small payload, the Linux loader, which starts a patched Linux kernel with a full desktop.

Linux lives on a USB drive or on an M.2 SSD. The internal SSD is never written to, so the PS5 OS keeps working as before.

The ready-made images are a convenience, not a requirement: the PS5 kernel is stock Linux plus one patch set (see [Kernel setup](/advanced/kernel)), so any distro can be made to run, and people have brought up their own from scratch.

:::tip[New here?]
Start with [Getting started](/getting-started/overview). It lists what you need and walks you through every step in order. Not sure which image to pick? [Which image should I use?](/getting-started/which-image)
:::

## Hardware status

"Every current kernel" means the upstream patch set, rmuxnet's kernel and PS5 Bazzite Deck; see [Kernel setup](/advanced/kernel#what-is-where) for which kernel has what.

### Consoles

| Model | Status | Notes |
| --- | --- | --- |
| Original PS5 | ✅ Working | |
| PS5 Slim | ✅ Working | MediaTek Wi-Fi and Bluetooth on most units, see below |
| PS5 Pro | ✅ Working | The GPU needs its own firmware, dumped by the loader, see [PS5 Pro](/hardware/ps5-pro) |

### Processor, GPU and cooling

| Component | Status | Where |
| --- | --- | --- |
| AMD GPU (amdgpu, RDNA2) | ✅ Working | Every kernel |
| CPU boost (3.5 GHz) | ✅ Working | In the kernel as `ps5-cpufreq` (rmuxnet's kernel, PS5 Bazzite Deck through `ps5-perf`); `ps5_control` on upstream kernels, see [Clocks and boost](/hardware/gpu#clocks-and-boost) |
| GPU clock (up to 2.23 GHz, 2.35 GHz on the Pro) | ✅ Working | A governor in every current kernel (500 to 2,230 MHz on the original PS5 and the Slim, 500 to 2,350 MHz on the Pro, 85 °C thermal limit); `ps5_control` on older kernels |
| GPU compute unit unlock (up to 40 CUs) | ⚠️ Original PS5 and Slim only | Every kernel. Silicon lottery: artefacts on some consoles. Not for the Pro, see [40 CU unlock](/hardware/gpu#40-cu-unlock) |
| Fan | ✅ Working | A temperature curve in the kernel by default on upstream and rmuxnet's kernels, firmware control on PS5 Bazzite Deck, see [Fan control](/hardware/fan) |

### Display and audio

| Component | Status | Where |
| --- | --- | --- |
| HDMI video and audio: 1080p60, 1080p120, 1440p60, 4K60 | ✅ Working | Every kernel, every console |
| 1440p120 | ✅ FLAVA3 consoles | Every current kernel |
| 4K120 over HDMI 2.1 FRL | ⚠️ FLAVA3 consoles, some TVs | Works on some TVs and falls back on others. Every current kernel; PS5 Bazzite Deck has its own 4K120 path |
| HDR | ✅ FLAVA3 consoles | Every current kernel |
| VRR (HDMI VRR displays) | ✅ FLAVA3 consoles | PS5 Bazzite Deck only |
| HDMI CEC | ✅ Working | Every current kernel |
| USB-C DisplayPort output | ⚠️ Off by default | Every current kernel, `usbc_dp.enable=1` |
| Hardware video decode (VCN) | ✅ Working | Every current kernel, see [Hardware video](/hardware/gpu#video-engine) |
| Hardware video encode (VCN) | ⚠️ H.264 only | HEVC only with I-frames |

Resolutions and refresh rates are detailed on [HDMI chip](/hardware/hdmi#why-only-certain-modes-exist).

### Networking, Bluetooth and controllers

| Component | Status | Where |
| --- | --- | --- |
| Ethernet (`mts`) | ✅ Working | Every kernel; full gigabit in every current kernel |
| Wi-Fi, Marvell IW620 (most original PS5s) | ⚠️ Working, some instability | Out-of-tree driver; built into rmuxnet's kernel, the `linux-ps5` package and PS5 Bazzite Deck, see [Wi-Fi](/hardware/wifi-bluetooth#wifi) |
| Wi-Fi, MediaTek (most Slims and the Pro) | ✅ Working | In-kernel drivers, every current kernel including the official one |
| Bluetooth, Marvell IW620 | ✅ Working | Quirks in every current kernel; the reconnect fixes in rmuxnet's kernel and PS5 Bazzite Deck, see [Bluetooth](/hardware/wifi-bluetooth#bluetooth) |
| Bluetooth, MediaTek (Slim and Pro) | ✅ Working | PS5 Bazzite Deck. rmuxnet's kernel carries a different Bluetooth patch that its author reports as broken |
| DualSense (USB and Bluetooth) | ✅ Working | Bluetooth on every chip; one controller for the PS5 OS and Linux, see [DualSense](/using-linux/dualsense) |

### Storage and USB

| Component | Status | Notes |
| --- | --- | --- |
| USB ports | ✅ Working | One port on every model is USB 2.0, see [USB and storage](/hardware/storage#usb-drives) |
| M.2 SSD | ✅ Working | Not on the oldest firmware, see [Install to M.2](/installation/m2-install) |
| Blu-ray drive (`ahci_salina`) | ✅ Working | Every kernel |

### Power

| Feature | Status | Where |
| --- | --- | --- |
| Restart straight into Linux (kexec) | ✅ Working | Any image, see [Warm reboot](/advanced/warm-reboot) |
| Sleep and wake (suspend-to-idle) | ⚠️ Not upstream | An open pull request on rmuxnet's repository; PS5 Bazzite Deck includes it |

See [Known issues](/troubleshooting/known-issues) for details and workarounds.

## Resources

- [ps5-linux GitHub organisation](https://github.com/ps5-linux)
- [ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader): the payload that boots Linux
- [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches): the patched kernel (official repository, packaged releases)
- [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1): rmuxnet's fork with its own releases, see [Kernel setup](/advanced/kernel)
- [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools): fan, boost and M.2 tools
- [ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex): internal Wi-Fi driver
- [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image): ready-made distro images
- [PS5 Bazzite Deck](https://github.com/VivaLaVent/ps5-bazzite-deck): Bazzite with Steam Gaming Mode
- [repo.etawen.dev](https://repo.etawen.dev): package repository for the kernel and tools
- [Discord server](https://discord.gg/ps5linux): help, tips, development and bug reports
- [Video guide by Modded Warfare](https://www.youtube.com/watch?v=4Iix8SaJtaM)
- [PS4 Linux guide](https://github.com/DionKill/ps4-linux-tutorial/)

Spotted a mistake or have something to add? Every page has an **Edit this page** link at the bottom. Corrections are welcome.
