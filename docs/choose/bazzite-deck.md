---
title: PS5 Bazzite Deck
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "The recommended image: Bazzite in Steam Deck mode for the PS5. What works, what you need, and how to download it."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# PS5 Bazzite Deck

[PS5 Bazzite Deck](https://github.com/VivaLaVent/ps5-bazzite-deck) turns the PS5 into a Steam console. It is [Bazzite](https://bazzite.gg) in Steam Deck mode, adapted for the PS5: it boots straight into **Steam Gaming Mode** (the Steam Deck interface), and a full KDE desktop is one click away.

It runs from a USB drive (or the M.2 slot) and is started by the Linux loader, like any other image. The PS5 itself is not modified: when you restart or power off, the PS5 starts its own system again, even with the drive still plugged in.

- **Download:** [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases)
- **Help and testing:** [Discord](https://discord.gg/ps5linux), channel `#bazzite-problems`
- **Support the project:** [Ko-fi](https://ko-fi.com/vivalavent)

:::tip[Which version?]
Use the release marked **Latest**. Releases marked **Pre-release** are test builds, even when their version number is higher. If the Latest release gives you trouble, the previous stable version stays available: [v1.8.9](https://github.com/VivaLaVent/ps5-bazzite-deck/releases/tag/v1.8.9).
:::

## Legacy or bootc

PS5 Bazzite Deck comes in two forms. Each release's notes have a section for each, with a new install and updating. `ps5-report` shows which one you run on its **Install** line.

| | Legacy | bootc (experimental) |
| --- | --- | --- |
| What it is | The install most people have: flashed from a full image, then updated in place. | The whole system as one image, the way Bazzite itself is built. |
| New install | Flash the full image of [v1.8.9](https://github.com/VivaLaVent/ps5-bazzite-deck/releases/tag/v1.8.9), then update to the Latest release. | Flash the bootc disk image of the Latest release. |
| Updating | The update command in the release notes. | Steam's update button, or `sudo bootc upgrade`. |
| Going back | The undo command the update prints, or v1.8.9. | `sudo bootc rollback`. |
| Linux loader | Any [Linux loader](/installation/booting#which-loader). | **bazzite-bootc-loader** from the same release. |
| Drive | 32 GB or more. | 64 GB or more. |

**Why bootc is the better way to update.** A Legacy update replaces the kernel, drivers and settings file by file on the running system, so consoles drift apart over time, and going back means undoing those files. The bootc form, developed by VivaLaVent, builds the complete system as one image with GitHub Actions from the [PS5 Bazzite Deck repository](https://github.com/VivaLaVent/ps5-bazzite-deck), and checks it before release:

- **Every console runs the same system.** The PS5 kernel, drivers and fixes are part of the image.
- **Updates download in the background** and take over at the next start. A power cut during an update doesn't leave a half-installed system.
- **The previous version stays on the drive.** `sudo bootc rollback` and a restart take you back.
- **Games, settings and your files are kept** across updates and rollbacks.

**bazzite-bootc-loader** is the official Linux loader built from its `main` branch for every release, with support for the boot entries bootc uses to choose and roll back versions. It starts Legacy installs and other images exactly like the official loader, so one loader works for both.

bootc is experimental: it hasn't been tested on many consoles yet. For a console you use every day, Legacy is the safer choice for now.

## What works on your console


One image runs on every supported PS5. What you get depends on three parts of the console; `ps5-report` shows all three. See [Hardware overview](/hardware/matrix#console-models-and-chips) for how to check them by hand.

**By HDMI chip:**

| Feature | FLAVA3 (most consoles) | VERDE (some later models) | Notes |
| --- | :---: | :---: | --- |
| 1440p at 120 Hz | ✅ | ❌ | |
| 4K at 120 Hz | ✅ | ❌ | Needs an HDMI 2.1 TV and cable. Only offered when the TV can take it, and falls back to 4K60 by itself if the link fails. |
| HDR (1080p60, 4K60) | ✅ | ❌ | Game Mode → Settings → Display |
| VRR (displays with HDMI VRR) | ✅ | ❌ | At every resolution: Game Mode → Settings → Display → Enable VRR. Like on the PS5 OS, not on monitors that only have FreeSync. |

Both chips support 1080p60, 1080p120, 1440p60 and 4K60, when the display can do them. Other resolutions and refresh rates (ultrawide, 165 Hz and so on) are not offered: the HDMI chip only has setups for these.

**By Wi-Fi/Bluetooth chip:**

| Feature | IW620 | MediaTek (Slim) | MediaTek (Pro) | Notes |
| --- | :---: | :---: | :---: | --- |
| One DualSense for the PS5 and Linux | ✅ | ✅ | ✅ | On by default, see [DualSense](/using-linux/dualsense#one-dualsense-for-the-ps5-and-linux). |
| Wi-Fi after restarting straight into Linux (`ps5-warm-reboot on`) | ⚠️ | ✅ | ✅ | IW620: repaired automatically. If Wi-Fi is still missing, power off and run the loader. |
| Bluetooth finds new devices | ✅ | ✅ | ✅ | IW620: broken in some earlier releases (a paired DualSense kept working). Update if the settings find nothing. |

**PS5 Pro:** the GPU runs with its 60 compute units and the Pro's own firmware, Wi-Fi and Bluetooth work from a cold boot, and overlays show the GPU load. The GPU firmware has to be dumped by the Linux loader, which only a loader built from the official repository's `main` branch does; see [PS5 Pro](/hardware/ps5-pro#gpu-firmware) for which loaders do and what to expect after an update. Not supported on the Pro: the 40 CU unlock. Reports are welcome in `#bazzite-ps5-pro-tests`.

## What you need for this image


- A PS5 on a firmware the [Linux loader](/installation/booting#which-loader) supports.
- An original PS5, a PS5 Slim or a PS5 Pro.
- **etaHEN and kstuff off:** they don't work together with the Linux loader (freezes, especially when going to sleep).
- A USB drive of **32 GB or more** for Legacy, **64 GB or more** for bootc, ideally an external SSD (much faster than a stick).
- A PC to download and flash the image. A USB keyboard is handy for the first setup.
- The [required PS5 settings](/getting-started/prerequisites#required-ps5-settings): USB power in rest mode set to **Always**, and HDMI Device Link **off** (otherwise you'll usually get a black screen).

## Download and extract

1. **Download** into one folder:
   - **Legacy:** all `ps5-bazzite-deck-v1.8.9.img.7z.00*` files and the `.sha256` file from [v1.8.9](https://github.com/VivaLaVent/ps5-bazzite-deck/releases/tag/v1.8.9). After the first start, you update to the Latest release.
   - **bootc:** all `ps5-bazzite-deck-bootc-vX.Y.img.7z.00*` files, the `.sha256` file and `bazzite-bootc-loader-vX.Y.elf` from the [release marked Latest](https://github.com/VivaLaVent/ps5-bazzite-deck/releases).
2. **Verify** the download: the checksums of the `.7z.00*` files must match the `.sha256` file. On Linux, `sha256sum -c <file>.sha256`; on Windows, `Get-FileHash <file> -Algorithm SHA256` in PowerShell for each volume.
3. **Extract** the `.001` file with [7-Zip](https://7-zip.org) (Windows), Keka (macOS) or `7z x` (Linux). You get an `.img` file: that is the file you flash.

Already installed? Update in place instead of reflashing, see [After installing: PS5 Bazzite Deck](/post-install/bazzite#updating).

## Next steps

**[Flash the image to USB](/installation/flash)**, then start Linux and work through the first boot.
