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

| Component | Status |
| --- | --- |
| HDMI video + audio | ✅ 1080p60, 1080p120, 1440p60, 4K60 on every console |
| USB ports | ✅ Working |
| Ethernet (custom driver) | ✅ Working |
| AMD GPU (amdgpu / RDNA2) | ✅ Working |
| M.2 SSD | ✅ Working (firmware 4.00 or later) |
| CPU boost (3.5 GHz) | ✅ Working: a cpufreq switch on rmuxnet's 7.3.1 kernel, `ps5-perf` on PS5 Bazzite Deck, `ps5_control` on older kernels, see [Clocks and boost](/hardware/gpu#clocks-and-boost) |
| GPU boost (2.23 GHz, 2.35 GHz on the Pro) | ✅ Working: automatic on rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck, `ps5_control` on older kernels |
| Fan | ✅ Temperature curve by default on rmuxnet's 7.3.1 kernel, firmware control on PS5 Bazzite Deck, `ps5_control` on older kernels, see [Fan control](/hardware/fan) |
| GPU CU unlock (up to 40 CUs) | ✅ Working |
| Wi-Fi (IW620 / mwifiex) | ⚠️ Working, with some instability. Built into rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck |
| Wi-Fi/Bluetooth (MediaTek, most Slims and the Pro) | ✅ Wi-Fi drivers in kernel 7.2.3 and later, rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck; the Bluetooth fixes in the last two, see [Bluetooth](/using-linux/bluetooth) |
| PS5 Slim / PS5 Pro | ✅ Both supported by the official loader (Pro from firmware 11.00) |
| Blu-ray drive (`ahci_salina`) | ✅ Working |
| DualSense (USB) | ✅ Working |
| Hardware video decode (VCN) | ✅ Working since kernel release 7.2.3, in rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck |
| Hardware video encode (VCN) | ⚠️ H.264 works, HEVC only with I-frames |
| 1440p120 | ✅ FLAVA3 consoles. Included by default in PS5 Bazzite Deck ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-hdmi-modes.patch)); upstream since Oct 2026 |
| 4K120 over HDMI 2.1 FRL | ⚠️ FLAVA3 consoles, works on some TVs and falls back on others. PS5 Bazzite Deck ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-hdmi-frl-4k120.patch)); upstream 7.2.3 and rmuxnet's 7.3.1 kernel (#63, #67, with ALLM) |
| HDR | ✅ FLAVA3 consoles. Upstream #49, in every current kernel |
| VRR (HDMI VRR displays) | ✅ FLAVA3 consoles. PS5 Bazzite Deck only ([patch](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-vrr.patch)) |
| HDMI CEC | ✅ Upstream #53, in every current kernel |
| USB-C DisplayPort output | ⚠️ Upstream #57, in every current kernel, off by default (`usbc_dp.enable=1`) |
| Restart straight into Linux (kexec) | ✅ Any image, see [Warm reboot](/advanced/warm-reboot) |
| Sleep and wake (suspend-to-idle) | ⚠️ [ps5-linux-patches PR #4](https://github.com/ps5-linux/ps5-linux-patches/pull/4), not merged; included by default in PS5 Bazzite Deck |

Resolutions and refresh rates are detailed on [HDMI chip](/hardware/hdmi#why-only-certain-modes-exist). See [Known issues](/troubleshooting/known-issues) for details and workarounds.

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
