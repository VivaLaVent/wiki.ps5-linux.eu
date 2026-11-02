---
title: Hardware overview
sidebar_label: Overview
sidebar_position: 1
description: The PS5's SoC, storage, video, networking, audio and USB hardware, and their Linux status.
---

# Hardware overview

## SoC

The PS5 uses a custom **AMD Oberon** APU.

- **CPU:** 8 cores / 16 threads, Zen 2 at 3.5 GHz (boost through `ps5_control`). Uses the `schedutil` cpufreq governor by default.
- **GPU:** RDNA2, 36–40 active compute units (CUs) depending on the unit. Disabled CUs can be unlocked with a kernel parameter. PCI ID `1002:13fb`. Boosts to 2.23 GHz through `ps5_control`. See [GPU](./gpu.md).
- **RAM:** 16 GB of unified GDDR6. About 14 GB is usable by the OS; the rest is reserved for firmware and VRAM.

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
| `0x12xxxxx` | Salina rev2 (MediaTek on most units, but some rev2 boards are still Marvell) | ❌ Not supported yet, driver work in progress |

## Audio

- **HDMI audio:** AMD/ATI `1002:13ea`. Working. See [Audio](/using-linux/audio).
- **HD Audio coprocessor:** AMD Ariel `1022:13eb`. Status unknown.

## USB

- **USB-A (2 ports, USB 3.1 Gen 2):** AMD Ariel `1022:13ee`
- **USB-C (1 port, USB 3.1 Gen 2 with DisplayPort Alt Mode):** AMD Ariel `1022:13ed`
- The **front bottom USB-C** port is the recommended boot port.
- The **rear USB-A** ports work for booting and for peripherals.

See [USB and storage](./usb-storage.md) for port speeds, hubs and adapters.

## Equivalent PC hardware

| Component | Roughly equivalent to |
| --- | --- |
| GPU | AMD Radeon RX 6700 (non-XT): 36 CUs, similar clocks |
| CPU | AMD Ryzen 7 2700 (a down-clocked Zen 2, 8 cores / 16 threads) |
