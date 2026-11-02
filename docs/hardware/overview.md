---
title: Hardware overview
sidebar_label: Overview
sidebar_position: 1
description: The PS5's SoC, storage, video, networking, audio and USB hardware, and their Linux status.
---

# Hardware overview

## Console models and chips

Linux runs on the original PS5, the PS5 Slim and the PS5 Pro. Within those models, three parts decide what works:

| Part | Variants | How to check |
| --- | --- | --- |
| **HDMI chip** | FLAVA3 (most consoles), VERDE (some later models) | `sudo dmesg \| grep "HDMI IC Type"` |
| **Wi-Fi/Bluetooth chip** | Marvell IW620 (most original PS5s, `1b4b:2b56`), MediaTek MT7961 (most Slims, `14c3:7961`), MediaTek MT7925 (PS5 Pro, `14c3:7925`) | `lspci -nn \| grep -i -e 1b4b -e 14c3` |
| **Model** | PS5 or Slim, PS5 Pro (GPU `1002:13da`) | `lspci -nn \| grep 1002:13da` |

On [PS5 Bazzite Deck](/installation/bazzite-deck), `ps5-report` shows all three on its first lines.

- **HDMI chip:** VERDE consoles don't get 1440p at 120 Hz, 4K at 120 Hz, HDR or VRR. How the chip works and why is on [HDMI chip](./hdmi.md); the feature table is on [PS5 Bazzite Deck](/installation/bazzite-deck#what-works-on-your-console).
- **Wi-Fi/Bluetooth chip:** the IW620 uses the out-of-tree `mwifiex` port, see [Wi-Fi](/using-linux/networking/wifi). The MediaTek chips use the in-kernel `mt7921e` and `mt7925e` drivers, built by the official config since kernel release 7.2.3; the Slim's Bluetooth also needs an endpoint fix, see [Bluetooth](/using-linux/bluetooth#mediatek-on-the-slim), which PS5 Bazzite Deck includes by default.
- **PS5 Pro:** supported by the official loader from firmware 11.00 (see [Which loader](/installation/booting#which-loader)). Its GPU (`1002:13da`, "Viola") needs its own firmware, which the loader dumps on 13.20 and 13.60 and the kernel package stages at boot. The GPU has 60 active compute units, so the [40 CU unlock](./gpu.md#40-cu-unlock) doesn't apply. Details on [PS5 Pro](./ps5-pro.md).

## SoC (original PS5 and Slim)

The PS5 uses a custom **AMD Oberon** APU.

- **CPU:** 8 cores / 16 threads, Zen 2 at 3.5 GHz (boost through `ps5_control`). Uses the `schedutil` cpufreq governor by default.
- **GPU:** RDNA2, 36–40 active compute units (CUs) depending on the unit. Disabled CUs can be unlocked with a kernel parameter. PCI ID `1002:13fb`. Boosts to 2.23 GHz through `ps5_control`. See [GPU](./gpu.md).
- **RAM:** 16 GB of unified GDDR6. About 14 GB is usable by the OS; the rest is reserved by the firmware. VRAM comes out of that 14 GB, see [Memory, VRAM and swap](/using-linux/memory-and-swap).

## Storage

- **Internal NVMe:** 825 GB. Not touched by a Linux install.
- **M.2 slot:** takes standard NVMe SSDs (firmware 4.00 or later only). See [Install to M.2](/installation/m2-install).
- **Blu-ray drive:** Salina AHCI controller (`104d:9105` / `104d:9106`) with the `ahci_salina` driver. Working.

## Video

- **HDMI 2.1:** 1080p, 1440p and 2160p at 60 Hz are broadly supported. 1440p at 120 Hz is confirmed on a Dell S3225QC.
- The `amdgpu` driver handles display output. See [Display output](/using-linux/display).
- **Hardware video decode and encode (VCN):** working; HEVC encoding only works with I-frames. See [Hardware video (VCN)](./vcn.mdx).

## Networking

- **Ethernet:** MediaTek Star GbE / Salina GBE (`104d:9104`) with the `mts` driver. Works out of the box. See [Ethernet](/using-linux/networking/ethernet).
- **Wi-Fi:** Marvell IW620 (`1b4b:2b56`) with the `moal` driver. See [Wi-Fi](/using-linux/networking/wifi).

### Salina chip revision

Boards use one of two revisions of the Salina chip for wireless. This is not tied to a specific console model; it varies from unit to unit. Check yours with:

```bash
dmesg | grep spcie
```

| Output | Revision | Wi-Fi/Bluetooth status |
| --- | --- | --- |
| `0x11xxxxx` | Salina rev1 (Marvell) | ✅ Supported |
| `0x12xxxxx` | Salina rev2 (MediaTek on most units, but some rev2 boards are still Marvell) | ⚠️ Drivers in the official kernel since release 7.2.3; confirmed on PS5 Bazzite Deck |

## Audio

- **HDMI audio:** AMD/ATI `1002:13ea`. Working. See [Audio](/using-linux/audio).
- **HD Audio coprocessor:** AMD Ariel `1022:13eb`. Status unknown.

## USB

- **USB-A (2 ports, USB 3.1 Gen 2):** AMD Ariel `1022:13ee`
- **USB-C (1 port, USB 3.1 Gen 2 with DisplayPort Alt Mode):** AMD Ariel `1022:13ed`
- Original PS5: the **front USB-C** port and the **rear USB-A** ports are fast and good for booting.
- PS5 Slim: boot from the **rear USB-A** ports.
- **Front USB-C DisplayPort output:** off by default. PS5 Bazzite Deck can turn it on with `usbc_dp.enable=1` (v1.6.1+) for USB-C displays and the PS VR2; don't use this when your boot drive is in the front USB-C port.

See [USB and storage](./usb-storage.md) for port speeds, hubs and adapters.

## Equivalent PC hardware

| Component | Roughly equivalent to |
| --- | --- |
| GPU | AMD Radeon RX 6700 (non-XT): 36 CUs, similar clocks |
| CPU | AMD Ryzen 7 2700 (a down-clocked Zen 2, 8 cores / 16 threads) |
