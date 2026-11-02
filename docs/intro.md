---
slug: /
sidebar_label: What is this?
title: Linux on the PlayStation 5
description: A community wiki for running a full Linux desktop on the PlayStation 5.
---

# Linux on the PlayStation 5

This is a community wiki for running Linux on the **PlayStation 5**. It uses patched hypervisor (HV) vulnerabilities to boot a full Linux desktop.

Linux runs from a USB drive or an M.2 SSD. The internal SSD is never touched, so you can keep using the PS5 OS normally.

It is not limited to the ready-made images either: the kernel is one patch on stock Linux (see [Kernel setup](/advanced/kernel)), and Gentoo has been run on a PS5 with [rmux's patches](https://github.com/rmuxnet/ps5-linux-patches-1).

:::tip[New here?]
Start with [Getting started](/getting-started/overview). It lists what you need and walks you through every step in order. Not sure which image to pick? [Which image should I use?](/getting-started/which-image)
:::

## Hardware status

Status on 2 November 2026. "Every current kernel" means upstream 7.2.3, rmuxnet's 7.3.1 release and PS5 Bazzite Deck; see [Kernel setup](/advanced/kernel#what-is-where) for which kernel has what.

### Consoles

| Model | Status | Notes |
| --- | --- | --- |
| Original PS5 | ✅ Working | |
| PS5 Slim | ✅ Working | MediaTek Wi-Fi and Bluetooth on most units, see below |
| PS5 Pro | ✅ Working | Official loader from firmware 11.00; the GPU needs its own firmware, see [PS5 Pro](/hardware/ps5-pro) |

### Processor, GPU and cooling

| Component | Status | Where |
| --- | --- | --- |
| AMD GPU (amdgpu, RDNA2) | ✅ Working | Every kernel |
| CPU boost (3.5 GHz) | ✅ Working | A cpufreq switch on rmuxnet's 7.3.1 kernel, `ps5-perf` on PS5 Bazzite Deck, `ps5_control` on upstream kernels, see [Clocks and boost](/hardware/gpu#clocks-and-boost) |
| GPU boost (2.23 GHz, 2.35 GHz on the Pro) | ✅ Working | Automatic on rmuxnet's 7.3.1 kernel, upstream 7.2.3 and PS5 Bazzite Deck; `ps5_control` on older kernels |
| GPU compute unit unlock (up to 40 CUs) | ✅ Working | Every kernel, silicon lottery, see [40 CU unlock](/hardware/gpu#40-cu-unlock) |
| Fan | ✅ Working | Temperature curve by default on rmuxnet's 7.3.1 kernel and upstream 7.2.3, firmware control on PS5 Bazzite Deck, see [Fan control](/hardware/fan) |

### Display and audio

| Component | Status | Where |
| --- | --- | --- |
| HDMI video and audio: 1080p60, 1080p120, 1440p60, 4K60 | ✅ Working | Every kernel, every console |
| 1440p120 | ✅ FLAVA3 consoles | PS5 Bazzite Deck ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-hdmi-modes.patch)); upstream since October 2026 |
| 4K120 over HDMI 2.1 FRL | ⚠️ FLAVA3 consoles, some TVs | Works on some TVs and falls back on others. PS5 Bazzite Deck ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-hdmi-frl-4k120.patch)); upstream 7.2.3 and rmuxnet's 7.3.1 kernel (#63, #67, with ALLM) |
| HDR | ✅ FLAVA3 consoles | Every current kernel (upstream #49) |
| VRR (HDMI VRR displays) | ✅ FLAVA3 consoles | PS5 Bazzite Deck only ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-vrr.patch)) |
| HDMI CEC | ✅ Working | Every current kernel (upstream #53) |
| USB-C DisplayPort output | ⚠️ Off by default | Every current kernel (upstream #57), `usbc_dp.enable=1` |
| Hardware video decode (VCN) | ✅ Working | Every current kernel, see [Hardware video](/hardware/vcn) |
| Hardware video encode (VCN) | ⚠️ H.264 only | HEVC only with I-frames |

Resolutions and refresh rates are detailed on [HDMI chip](/hardware/hdmi#why-only-certain-modes-exist).

### Networking, Bluetooth and controllers

| Component | Status | Where |
| --- | --- | --- |
| Ethernet (`mts`) | ✅ Working | Every kernel; full gigabit since upstream 7.2.3 |
| Wi-Fi, Marvell IW620 (most original PS5s) | ⚠️ Working, some instability | Out-of-tree driver; built into rmuxnet's 7.3.1 kernel, the `linux-ps5` package and PS5 Bazzite Deck, see [Wi-Fi](/using-linux/networking/wifi) |
| Wi-Fi, MediaTek (most Slims and the Pro) | ✅ Working | In-kernel drivers, every current kernel |
| Bluetooth, Marvell IW620 | ✅ Working | Quirks in every current kernel; the reconnect fixes in rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck, see [Bluetooth](/using-linux/bluetooth) |
| Bluetooth, MediaTek (Slim and Pro) | ✅ Working | rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck only |
| DualSense (USB and Bluetooth) | ✅ Working | One controller for the PS5 OS and Linux, see [DualSense](/using-linux/dualsense) |

### Storage and USB

| Component | Status | Notes |
| --- | --- | --- |
| USB ports | ✅ Working | The front USB-A port is USB 2.0, see [USB and storage](/hardware/usb-storage) |
| M.2 SSD | ✅ Working | Firmware 4.00 or later, see [Install to M.2](/installation/m2-install) |
| Blu-ray drive (`ahci_salina`) | ✅ Working | Every kernel |

### Power

| Feature | Status | Where |
| --- | --- | --- |
| Restart straight into Linux (kexec) | ✅ Working | Any image, see [Warm reboot](/advanced/warm-reboot) |
| Sleep and wake (suspend-to-idle) | ⚠️ Not upstream | [ps5-linux-patches PR #4](https://github.com/ps5-linux/ps5-linux-patches/pull/4), not merged; PS5 Bazzite Deck includes it |

See [Known issues](/troubleshooting/known-issues) for details and workarounds.

## Resources

- [ps5-linux GitHub organisation](https://github.com/ps5-linux)
- [ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader): the payload that boots Linux
- [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches): the patched kernel (official repository, 7.2.3 packages)
- [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1): rmux's fork with the 7.3.1 releases, see [Kernel setup](/advanced/kernel)
- [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools): fan, boost and M.2 tools
- [ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex): internal Wi-Fi driver
- [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image): ready-made distro images
- [ps5-linux-image (mia's builds)](https://git.etawen.dev/mia/ps5-linux-image): many more distros
- [PS5 Bazzite Deck](https://github.com/VivaLaVent/ps5-bazzite-deck): Bazzite with Steam Gaming Mode
- [repo.etawen.dev](https://repo.etawen.dev): package repository for the kernel and tools
- [Discord server](https://discord.gg/ps5linux): help, tips, development and bug reports
- [Video guide by Modded Warfare](https://www.youtube.com/watch?v=4Iix8SaJtaM)
- [PS4 Linux guide](https://github.com/DionKill/ps4-linux-tutorial/)

Spotted a mistake or have something to add? Every page has an **Edit this page** link at the bottom. Corrections are welcome.
