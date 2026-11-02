---
slug: /
sidebar_label: What is this?
title: Linux on the PlayStation 5
description: A community wiki for running a full Linux desktop on the PlayStation 5.
---

# Linux on the PlayStation 5

This is a community wiki for running Linux on the **PlayStation 5**. It uses patched hypervisor (HV) vulnerabilities to boot a full Linux desktop.

Linux runs from a USB drive or an M.2 SSD. The internal SSD is never touched, so you can keep using the PS5 OS normally.

It is not limited to the ready-made images either: for example, Gentoo Linux has been run on a PS5 with kernel 7.3-rc6 and [rmux's patches](https://github.com/rmuxnet/ps5-linux-patches-1).

:::tip[New here?]
Start with [Getting started](/getting-started/overview). It lists what you need and walks you through every step in order.
:::

## Hardware status

| Component | Status |
| --- | --- |
| HDMI 4K60 video + audio | ✅ Working |
| USB ports | ✅ Working |
| Ethernet (custom driver) | ✅ Working |
| AMD GPU (amdgpu / RDNA2) | ✅ Working |
| M.2 SSD | ✅ Working (firmware 4.00 or later) |
| CPU boost (3.5 GHz) | ✅ Working via `ps5_control` |
| GPU boost (2.23 GHz) | ✅ Working via `ps5_control` |
| GPU CU unlock (up to 40 CUs) | ✅ Working |
| Wi-Fi (IW620 / mwifiex) | ⚠️ Working, with some instability |
| Blu-ray drive (`ahci_salina`) | ✅ Working |
| DualSense (USB) | ✅ Working |
| Hardware video decode (VCN) | ✅ Working, kernel must be built from source |
| Hardware video encode (VCN) | ⚠️ H.264 works, HEVC only with I-frames |
| Screen saver | ❌ Broken |
| CachyOS | ❌ Currently broken (kernel panic) |

See [Known issues](/troubleshooting/known-issues) for details and workarounds.

## Resources

- [ps5-linux GitHub organisation](https://github.com/ps5-linux)
- [ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader): the payload that boots Linux
- [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches): the patched kernel
- [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools): fan, boost and M.2 tools
- [ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex): internal Wi-Fi driver
- [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image): ready-made distro images
- [ps5-linux-image (mia's builds)](https://git.etawen.dev/mia/ps5-linux-image)
- [Discord server](https://discord.gg/ps5linux): help, tips, development and bug reports
- [Telegram](https://t.me/ps5linux): kernel builds and updates
- [Video guide by Modded Warfare](https://www.youtube.com/watch?v=4Iix8SaJtaM)
- [PS4 Linux guide](https://github.com/DionKill/ps4-linux-tutorial/)

Spotted a mistake or have something to add? Every page has an **Edit this page** link at the bottom. Corrections are welcome.
