---
title: Hardware status
sidebar_label: Hardware status
sidebar_position: 3
description: "What works on each PS5 model under Linux: one table for every component, then the chips in detail."
hardware: [original, slim, pro]
applies_to: all
---

# Hardware status

What works on each model, which kernel has it, and what is inside the console. Each row links to the component's page under Troubleshooting, where its setup and problems are described.

✅ Working · 🧪 Experimental · 🚧 Work in progress · ❌ Unsupported · **BD** = only on PS5 Bazzite Deck so far

## Status by component {#status}

| Component | Original PS5 | PS5 Slim | PS5 Pro | Details |
| --- | --- | --- | --- | --- |
| CPU, boost to 3.5 GHz | ✅ | ✅ | ✅ clocks set by the console's firmware | [GPU](/troubleshooting/gpu) |
| GPU | ✅ 36 CUs | ✅ 36 CUs | ✅ 60 CUs with the loader's firmware dump (depends on the loader and firmware version); 36 otherwise | [GPU](/troubleshooting/gpu), [PS5 Pro](/troubleshooting/ps5-pro#gpu-firmware) |
| 40 CU unlock | 🧪 | 🧪 | ❌ | [GPU](/troubleshooting/gpu) |
| GPU recovery after a fault | ✅ light reset | ✅ light reset | ❌ full reset doesn't recover | [PS5 Pro](/troubleshooting/ps5-pro) |
| HDMI 1080p/1440p 60 Hz, 4K 60 Hz, audio | ✅ | ✅ | ✅ | [Display and HDMI](/troubleshooting/display) |
| 1080p/1440p 120 Hz, HDR | ✅ FLAVA3 chip | ✅ FLAVA3 chip | ✅ | [Display and HDMI](/troubleshooting/display) |
| 4K 120 Hz | 🧪 FLAVA3, depends on the TV | 🧪 FLAVA3, depends on the TV | 🧪 | [Display and HDMI](/troubleshooting/display) |
| VRR (HDMI VRR displays; FreeSync-only from v2.7.1) | ✅ FLAVA3, BD | ✅ FLAVA3, BD | ✅ BD | [Display and HDMI](/troubleshooting/display) |
| VERDE HDMI chip | ✅ up to 1080p120, 1440p60, 4K60 (PS5 Bazzite Deck from v2.7: also 100 Hz and 1440p120); no HDR or VRR | same | n/a | [Display and HDMI](/troubleshooting/display) |
| USB-C DisplayPort | 🧪 off by default | 🧪 | 🧪 | [Display and HDMI](/troubleshooting/display) |
| Video decode and encode (VCN) | ✅ HEVC encode with I-frames only | ✅ | ✅ | [GPU](/troubleshooting/gpu#video-engine) |
| Ethernet | ✅ | ✅ | ✅ | [Ethernet](/troubleshooting/ethernet) |
| Wi-Fi | ✅ IW620, out-of-tree driver | ✅ MediaTek | ✅ MediaTek | [Wi-Fi](/troubleshooting/wifi) |
| Bluetooth | ✅ IW620 | ✅ BD | ✅ BD | [Bluetooth](/troubleshooting/bluetooth) |
| One DualSense for the PS5 OS and Linux | ✅ BD | ✅ BD | ✅ BD | [DualSense](/post-install/dualsense) |
| Fan control | ✅ | ✅ | ✅ | [Fan control](/troubleshooting/fan) |
| Sleep (suspend-to-idle) | ✅ BD; 🚧 elsewhere | ✅ BD; 🚧 elsewhere | ✅ BD | [PS5 Bazzite Deck](/choose/bazzite-deck) |
| Warm reboots (warm reboot) | 🧪 | 🧪 | 🧪 | [Warm reboots](/post-install/warm-reboot) |
| USB drives, internal M.2 | ✅ | ✅ | ✅ | [Drives and USB ports](/getting-started/drives) |
| Blu-ray drive | ✅ | ✅ (disc models) | ✅ (disc drive attached) | below |
| Light bar, buzzer | see page | see page | see page | [LED, buzzer and capture cards](/troubleshooting/peripherals) |
| HD Audio coprocessor | unknown | unknown | unknown | below |

## Status by kernel {#by-kernel}

"Every current kernel" means the upstream patch set, rmuxnet's kernel and PS5 Bazzite Deck; see [Kernel setup](/post-install/kernel#what-is-where) for which kernel has what.

### Consoles

| Model | Status | Notes |
| --- | --- | --- |
| Original PS5 | ✅ Working | |
| PS5 Slim | ✅ Working | MediaTek Wi-Fi and Bluetooth on most units, see below |
| PS5 Pro | ✅ Working | The GPU needs its own firmware, dumped by the loader, see [PS5 Pro](/troubleshooting/ps5-pro) |

### Processor, GPU and cooling

| Component | Status | Where |
| --- | --- | --- |
| AMD GPU (amdgpu, RDNA2) | ✅ Working | Every kernel |
| CPU boost (3.5 GHz) | ✅ Working | In the kernel as `ps5-cpufreq` (rmuxnet's kernel, PS5 Bazzite Deck through `ps5-perf`); `ps5_control` on upstream kernels, see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost) |
| GPU clock (up to 2.23 GHz, 2.35 GHz on the Pro) | ✅ Working | A governor in every current kernel (500 to 2,230 MHz on the original PS5 and the Slim, 500 to 2,350 MHz on the Pro, 85 °C thermal limit); `ps5_control` on older kernels |
| GPU compute unit unlock (up to 40 CUs) | ⚠️ Original PS5 and Slim only | Every kernel. Silicon lottery: artefacts on some consoles. Not for the Pro, see [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) |
| Fan | ✅ Working | A temperature curve in the kernel by default on upstream and rmuxnet's kernels, firmware control on PS5 Bazzite Deck, see [Fan control](/troubleshooting/fan) |

### Display and audio

| Component | Status | Where |
| --- | --- | --- |
| HDMI video and audio: 1080p60, 1080p120, 1440p60, 4K60 | ✅ Working | Every kernel, every console |
| 1440p120 | ✅ FLAVA3 consoles | Every current kernel; VERDE on PS5 Bazzite Deck from v2.7 |
| 100 Hz, and on FLAVA3 other modes the display lists (144 or 165 Hz, ultrawide) | ⚠️ New | PS5 Bazzite Deck from v2.7 |
| 4K120 over HDMI 2.1 FRL | ⚠️ FLAVA3 consoles, some TVs | Works on some TVs and falls back on others. Every current kernel; PS5 Bazzite Deck has its own 4K120 path |
| HDR | ✅ FLAVA3 consoles | Every current kernel |
| VRR (HDMI VRR displays; FreeSync-only from v2.7.1) | ✅ FLAVA3 consoles | PS5 Bazzite Deck only |
| HDMI CEC | ✅ Working | Every current kernel |
| USB-C DisplayPort output | ⚠️ Off by default | Every current kernel, `usbc_dp.enable=1` |
| Hardware video decode (VCN) | ✅ Working | Every current kernel, see [Hardware video](/troubleshooting/gpu#video-engine) |
| Hardware video encode (VCN) | ⚠️ H.264 only | HEVC only with I-frames |

Resolutions and refresh rates are detailed on [Display and HDMI](/troubleshooting/display#why-only-certain-modes-exist).

### Networking, Bluetooth and controllers

| Component | Status | Where |
| --- | --- | --- |
| Ethernet (`mts`) | ✅ Working | Every kernel; full gigabit in every current kernel |
| Wi-Fi, Marvell IW620 (most original PS5s) | ⚠️ Working, some instability | Out-of-tree driver; built into rmuxnet's kernel, the `linux-ps5` package and PS5 Bazzite Deck, see [Wi-Fi](/troubleshooting/wifi) |
| Wi-Fi, MediaTek (most Slims and the Pro) | ✅ Working | In-kernel drivers, every current kernel including the official one |
| Bluetooth, Marvell IW620 | ✅ Working | Quirks in every current kernel; the reconnect fixes in rmuxnet's kernel and PS5 Bazzite Deck, see [Bluetooth](/troubleshooting/bluetooth) |
| Bluetooth, MediaTek (Slim and Pro) | ✅ Working | PS5 Bazzite Deck. rmuxnet's kernel carries a different Bluetooth patch that its author reports as broken |
| DualSense (USB and Bluetooth) | ✅ Working | Bluetooth on every chip; one controller for the PS5 OS and Linux, see [DualSense](/post-install/dualsense) |

### Storage and USB

| Component | Status | Notes |
| --- | --- | --- |
| USB ports | ✅ Working | One port on every model is USB 2.0, see [Drives and USB ports](/getting-started/drives#usb-drives) |
| M.2 SSD | ✅ Working | Not on the oldest firmware, see [Install to M.2](/installation/m2-install) |
| Blu-ray drive (`ahci_salina`) | ✅ Working | Every kernel |

### Power

| Feature | Status | Where |
| --- | --- | --- |
| Warm reboots (kexec) | ✅ Working | Any image, see [Warm reboot](/post-install/warm-reboot) |
| Sleep and wake (suspend-to-idle) | ⚠️ Not upstream | An open pull request on rmuxnet's repository; PS5 Bazzite Deck includes it |

Linux can't resume from the console's own rest mode: shutting Linux down puts the PS5 into rest mode, and the next power-up starts the PS5 OS. Suspend-to-idle sleeps and wakes without leaving Linux, and the warm reboot skips the PS5 OS and the loader; both are experimental.

Problems and their workarounds are under [Troubleshooting](/troubleshooting/getting-help), one page per component.

## Console models and chips

Linux runs on the original PS5, the PS5 Slim and the PS5 Pro. Within those models, three parts decide what works:

| Part | Variants | How to check |
| --- | --- | --- |
| **HDMI chip** | FLAVA3 (most consoles), VERDE (some later models) | `sudo dmesg \| grep "HDMI IC Type"` |
| **Wi-Fi/Bluetooth chip** | Marvell IW620 (most original PS5s, `1b4b:2b56`), MediaTek MT7961 (most Slims, `14c3:7961`), MediaTek MT7925 (PS5 Pro, `14c3:7925`) | `lspci -nn \| grep -i -e 1b4b -e 14c3` |
| **Model** | PS5 or Slim, PS5 Pro (GPU `1002:13da` or `1002:13dc`) | `lspci -nn \| grep -e 1002:13da -e 1002:13dc` |

On [PS5 Bazzite Deck](/choose/bazzite-deck), `ps5-report` shows all three on its first lines.

- **HDMI chip:** VERDE consoles don't get 4K at 120 Hz, HDR or VRR, and get 1440p at 120 Hz only on PS5 Bazzite Deck from v2.7. How the chip works and why is on [Display and HDMI](/troubleshooting/display); the feature table is on [PS5 Bazzite Deck](/choose/bazzite-deck#what-works-on-your-console).
- **Wi-Fi/Bluetooth chip:** the IW620 uses the out-of-tree `mwifiex` port, built into rmuxnet's kernel, the `linux-ps5` package and PS5 Bazzite Deck, see [Wi-Fi](/troubleshooting/wifi). The MediaTek chips use the in-kernel `mt7921e` (Slim) and `mt7925e` (Pro) drivers, which every current kernel builds; their Bluetooth needs fixes that PS5 Bazzite Deck has, see [Bluetooth](/troubleshooting/bluetooth).
- **PS5 Pro:** supported by the loader (see [Which loader](/getting-started/loader#which-loader)). Its GPU ("Viola") needs its own firmware, which the loader dumps on the firmware versions it has offsets for, see [GPU firmware](/troubleshooting/ps5-pro#gpu-firmware); the kernel package and PS5 Bazzite Deck stage it into the initrd at boot. The GPU has 60 active compute units, so the [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) doesn't apply. Details on [PS5 Pro](/troubleshooting/ps5-pro).

## SoC (original PS5 and Slim)

The console is built around a custom AMD APU called **Oberon**: CPU, GPU and memory controller on one die.

- **CPU:** eight Zen 2 cores with 16 threads. The firmware starts it at 3.2 GHz; the boost to 3.5 GHz is a kernel driver (`ps5-cpufreq`) on rmuxnet's kernel and PS5 Bazzite Deck, and `ps5_control` on upstream kernels, see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost). The `schedutil` governor is the default.
- **GPU:** RDNA2 with 36 to 40 active compute units depending on the unit, PCI ID `1002:13fb`, up to 2.23 GHz. The disabled compute units can be switched on with a kernel parameter.
- **RAM:** 16 GB of GDDR6 shared by CPU and GPU. About 14 GB is left for the operating system; the firmware keeps the rest. The GPU's memory comes out of those 14 GB, see [Memory, VRAM and swap](/post-install/all-distros#memory-and-swap).

The PS5 Pro has a bigger GPU and a different wireless chip, see [PS5 Pro](/troubleshooting/ps5-pro).

## Storage

- **Internal NVMe:** the console's own drive. Linux never writes to it.
- **M.2 slot:** takes standard NVMe SSDs on every firmware except the oldest, which can't boot with a drive in the slot. See [Install to M.2](/installation/m2-install) and [M.2 drives](/getting-started/drives#m2-drives).
- **Blu-ray drive:** on a Salina AHCI controller (`104d:9105` / `104d:9106`) with the `ahci_salina` driver. Working.

## Video

- **HDMI 2.1 through the console's HDMI chip:** 1080p and 1440p at 60 and 120 Hz and 4K at 60 Hz on FLAVA3 consoles, 4K at 120 Hz on TVs that take the console's FRL link; VERDE consoles stop at 1080p120, 1440p60 and 4K60 (PS5 Bazzite Deck from v2.7: also 100 Hz and 1440p120). See [Display output](/troubleshooting/display#display-settings) and [Display and HDMI](/troubleshooting/display).
- **Hardware video decode and encode (VCN):** working; HEVC encoding only with I-frames. See [Hardware video (VCN)](/troubleshooting/gpu#video-engine).

## Networking

- **Ethernet:** MediaTek Star GbE / Salina GBE (`104d:9104`) with the `mts` driver, full gigabit, works out of the box. See [Ethernet](/troubleshooting/ethernet).
- **Wi-Fi:** Marvell IW620 (`1b4b:2b56`) with the `moal` driver on most original PS5s, MediaTek on most Slims and the Pro. See [Wi-Fi](/troubleshooting/wifi).

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

- **HDMI audio:** AMD/ATI `1002:13ea`. Working. See [Audio](/troubleshooting/audio).
- **HD Audio coprocessor:** AMD Ariel `1022:13eb`. Status unknown.

## USB

- **USB-A (2 ports, USB 3.1 Gen 2):** AMD Ariel `1022:13ee`
- **USB-C (1 port, USB 3.1 Gen 2 with DisplayPort Alt Mode):** AMD Ariel `1022:13ed`
- Original PS5: the **front USB-C** port and the **rear USB-A** ports are fast and good for booting.
- PS5 Slim: boot from the **rear USB-A** ports.
- **Front USB-C DisplayPort output:** off by default in every current kernel. Turn it on with `usbc_dp.enable=1` for USB-C displays and the PS VR2; don't use this when your boot drive is in the front USB-C port.

See [Drives and USB ports](/getting-started/drives#usb-drives) for port speeds, hubs and adapters.

## Equivalent PC hardware

| Component | Roughly equivalent to |
| --- | --- |
| GPU | A 36 CU RDNA2 desktop card of the RX 6700 class, at similar clocks |
| CPU | An eight-core Zen 2 desktop CPU at reduced clocks |

## Next steps

**[Drives and USB ports](/getting-started/drives)**: which drive to install to.
