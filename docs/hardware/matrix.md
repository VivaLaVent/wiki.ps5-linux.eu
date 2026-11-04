---
title: Hardware status
sidebar_label: Hardware status
sidebar_position: 1
description: "What works on each PS5 model under Linux: one table for every component, then the chips in detail."
hardware: [original, slim, pro]
applies_to: all
---

# Hardware status

One table for every component, then what is inside the console. Each row links to the component's own page, where its setup and troubleshooting live.

✅ Working · 🧪 Experimental · 🚧 Work in progress · ❌ Unsupported · **BD** = only on PS5 Bazzite Deck so far

## Status by component {#status}

| Component | Original PS5 | PS5 Slim | PS5 Pro | Details |
| --- | --- | --- | --- | --- |
| CPU, boost to 3.5 GHz | ✅ | ✅ | ✅ clocks set by the console's firmware | [GPU](/hardware/gpu) |
| GPU | ✅ 36 CUs | ✅ 36 CUs | ✅ 60 CUs with the loader's firmware dump (11.60, 13.20, 13.60); 36 otherwise | [GPU](/hardware/gpu), [PS5 Pro](/hardware/ps5-pro) |
| 40 CU unlock | 🧪 | 🧪 | ❌ | [GPU](/hardware/gpu) |
| GPU recovery after a fault | ✅ light reset | ✅ light reset | ❌ full reset doesn't recover | [PS5 Pro](/hardware/ps5-pro) |
| HDMI 1080p/1440p 60 Hz, 4K 60 Hz, audio | ✅ | ✅ | ✅ | [HDMI and display](/hardware/hdmi) |
| 1080p/1440p 120 Hz, HDR | ✅ FLAVA3 chip | ✅ FLAVA3 chip | ✅ | [HDMI and display](/hardware/hdmi) |
| 4K 120 Hz | 🧪 FLAVA3, depends on the TV | 🧪 FLAVA3, depends on the TV | 🧪 | [HDMI and display](/hardware/hdmi) |
| VRR (HDMI VRR displays) | ✅ FLAVA3, BD | ✅ FLAVA3, BD | ✅ BD | [HDMI and display](/hardware/hdmi) |
| VERDE HDMI chip | ✅ up to 1080p120, 1440p60, 4K60; no HDR or VRR | same | n/a | [HDMI and display](/hardware/hdmi) |
| USB-C DisplayPort | 🧪 off by default | 🧪 | 🧪 | [HDMI and display](/hardware/hdmi) |
| Video decode and encode (VCN) | ✅ HEVC encode with I-frames only | ✅ | ✅ | [GPU](/hardware/gpu#video-engine) |
| Ethernet | ✅ | ✅ | ✅ | [Wi-Fi, Ethernet and Bluetooth](/hardware/wifi-bluetooth#ethernet) |
| Wi-Fi | ✅ IW620, out-of-tree driver | ✅ MediaTek | ✅ MediaTek | [Wi-Fi, Ethernet and Bluetooth](/hardware/wifi-bluetooth#wifi) |
| Bluetooth | ✅ IW620 | ✅ BD | ✅ BD | [Wi-Fi, Ethernet and Bluetooth](/hardware/wifi-bluetooth#bluetooth) |
| One DualSense for the PS5 OS and Linux | ✅ BD | ✅ BD | ✅ BD | [DualSense](/using-linux/dualsense) |
| Fan control | ✅ | ✅ | ✅ | [Fan control](/hardware/fan) |
| Sleep (suspend-to-idle) | ✅ BD; 🚧 elsewhere | ✅ BD; 🚧 elsewhere | ✅ BD | [PS5 Bazzite Deck](/choose/bazzite-deck) |
| Restart straight into Linux (warm reboot) | 🧪 | 🧪 | 🧪 | [Restart straight into Linux](/advanced/warm-reboot) |
| USB drives, internal M.2 | ✅ | ✅ | ✅ | [Storage](/hardware/storage) |
| Blu-ray drive | ✅ | ✅ (disc models) | ✅ (disc drive attached) | below |
| Light bar, buzzer | see page | see page | see page | [Peripherals](/hardware/peripherals) |
| HD Audio coprocessor | unknown | unknown | unknown | below |

## Console models and chips

Linux runs on the original PS5, the PS5 Slim and the PS5 Pro. Within those models, three parts decide what works:

| Part | Variants | How to check |
| --- | --- | --- |
| **HDMI chip** | FLAVA3 (most consoles), VERDE (some later models) | `sudo dmesg \| grep "HDMI IC Type"` |
| **Wi-Fi/Bluetooth chip** | Marvell IW620 (most original PS5s, `1b4b:2b56`), MediaTek MT7961 (most Slims, `14c3:7961`), MediaTek MT7925 (PS5 Pro, `14c3:7925`) | `lspci -nn \| grep -i -e 1b4b -e 14c3` |
| **Model** | PS5 or Slim, PS5 Pro (GPU `1002:13da` or `1002:13dc`) | `lspci -nn \| grep -e 1002:13da -e 1002:13dc` |

On [PS5 Bazzite Deck](/choose/bazzite-deck), `ps5-report` shows all three on its first lines.

- **HDMI chip:** VERDE consoles don't get 1440p at 120 Hz, 4K at 120 Hz, HDR or VRR. How the chip works and why is on [HDMI chip](/hardware/hdmi); the feature table is on [PS5 Bazzite Deck](/choose/bazzite-deck#what-works-on-your-console).
- **Wi-Fi/Bluetooth chip:** the IW620 uses the out-of-tree `mwifiex` port, built into rmuxnet's kernel, the `linux-ps5` package and PS5 Bazzite Deck, see [Wi-Fi](/hardware/wifi-bluetooth#wifi). The MediaTek chips use the in-kernel `mt7921e` (Slim) and `mt7925e` (Pro) drivers, which every current kernel builds; their Bluetooth needs fixes that PS5 Bazzite Deck has, see [Bluetooth](/hardware/wifi-bluetooth#bluetooth).
- **PS5 Pro:** supported by the loader (see [Which loader](/getting-started/loader#which-loader)). Its GPU ("Viola") needs its own firmware, which the loader dumps when it is built from the official repository's `main` branch, as bazzite-bootc-loader is; the kernel package and PS5 Bazzite Deck stage it into the initrd at boot. The GPU has 60 active compute units, so the [40 CU unlock](/hardware/gpu#40-cu-unlock) doesn't apply. Details on [PS5 Pro](/hardware/ps5-pro).

## SoC (original PS5 and Slim)

The console is built around a custom AMD APU called **Oberon**: CPU, GPU and memory controller on one die.

- **CPU:** eight Zen 2 cores with 16 threads. The firmware starts it at 3.2 GHz; the boost to 3.5 GHz is a kernel driver (`ps5-cpufreq`) on rmuxnet's kernel and PS5 Bazzite Deck, and `ps5_control` on upstream kernels, see [Clocks and boost](/hardware/gpu#clocks-and-boost). The `schedutil` governor is the default.
- **GPU:** RDNA2 with 36 to 40 active compute units depending on the unit, PCI ID `1002:13fb`, up to 2.23 GHz. The disabled compute units can be switched on with a kernel parameter.
- **RAM:** 16 GB of GDDR6 shared by CPU and GPU. About 14 GB is left for the operating system; the firmware keeps the rest. The GPU's memory comes out of those 14 GB, see [Memory, VRAM and swap](/post-install/all-distros#memory-and-swap).

The PS5 Pro has a bigger GPU and a different wireless chip, see [PS5 Pro](/hardware/ps5-pro).

## Storage

- **Internal NVMe:** the console's own drive. Linux never writes to it.
- **M.2 slot:** takes standard NVMe SSDs on every firmware except the oldest, which can't boot with a drive in the slot. See [Install to M.2](/installation/m2-install) and [M.2 drives](/hardware/storage#m2-drives).
- **Blu-ray drive:** on a Salina AHCI controller (`104d:9105` / `104d:9106`) with the `ahci_salina` driver. Working.

## Video

- **HDMI 2.1 through the console's HDMI chip:** 1080p and 1440p at 60 and 120 Hz and 4K at 60 Hz on FLAVA3 consoles, 4K at 120 Hz on TVs that take the console's FRL link; VERDE consoles stop at 1080p120, 1440p60 and 4K60. See [Display output](/hardware/hdmi#display-settings) and [HDMI chip](/hardware/hdmi).
- **Hardware video decode and encode (VCN):** working; HEVC encoding only with I-frames. See [Hardware video (VCN)](/hardware/gpu#video-engine).

## Networking

- **Ethernet:** MediaTek Star GbE / Salina GBE (`104d:9104`) with the `mts` driver, full gigabit, works out of the box. See [Ethernet](/hardware/wifi-bluetooth#ethernet).
- **Wi-Fi:** Marvell IW620 (`1b4b:2b56`) with the `moal` driver on most original PS5s, MediaTek on most Slims and the Pro. See [Wi-Fi](/hardware/wifi-bluetooth#wifi).

### Salina chip revision

The wireless combo chip hangs off one of two revisions of the Salina chip, and the revision is not tied to the model: it varies from unit to unit. Check yours with:

```bash
dmesg | grep spcie
```

| Output | Revision | Wi-Fi/Bluetooth |
| --- | --- | --- |
| `0x11xxxxx` | Salina rev1 (Marvell) | ✅ Supported with the out-of-tree Wi-Fi driver and the Bluetooth quirks |
| `0x12xxxxx` | Salina rev2 (MediaTek on most units, Marvell on some) | ✅ Wi-Fi with the in-kernel drivers in every current kernel; Bluetooth with the fixes in PS5 Bazzite Deck |

## Audio

- **HDMI audio:** AMD/ATI `1002:13ea`. Working. See [Audio](/using-linux/audio).
- **HD Audio coprocessor:** AMD Ariel `1022:13eb`. Status unknown.

## USB

- **USB-A (2 ports, USB 3.1 Gen 2):** AMD Ariel `1022:13ee`
- **USB-C (1 port, USB 3.1 Gen 2 with DisplayPort Alt Mode):** AMD Ariel `1022:13ed`
- Original PS5: the **front USB-C** port and the **rear USB-A** ports are fast and good for booting.
- PS5 Slim: boot from the **rear USB-A** ports.
- **Front USB-C DisplayPort output:** off by default in every current kernel. Turn it on with `usbc_dp.enable=1` for USB-C displays and the PS VR2; don't use this when your boot drive is in the front USB-C port.

See [USB and storage](/hardware/storage#usb-drives) for port speeds, hubs and adapters.

## Equivalent PC hardware

| Component | Roughly equivalent to |
| --- | --- |
| GPU | A 36 CU RDNA2 desktop card of the RX 6700 class, at similar clocks |
| CPU | An eight-core Zen 2 desktop CPU at reduced clocks |

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
