---
title: PS5 Bazzite Deck
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "The recommended image: Bazzite in Steam Deck mode for the PS5. What works, what you need, and how to download it."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# PS5 Bazzite Deck

[Bazzite](https://bazzite.gg) in Steam Deck mode for the PS5. It starts in the KDE desktop with **Game Mode** (the Steam Deck interface) one click away, runs from a USB drive or the M.2 slot, and is started by the Linux loader. The PS5 itself isn't changed: restart or power off, and it starts its own system.

- **Download:** [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases)
- **Help:** [Discord](https://discord.gg/ps5linux), channel `#bazzite-problems`
- **Donate:** [Ko-fi](https://ko-fi.com/vivalavent)

:::tip[Which version?]
Use the release marked **Latest**; **Pre-release** builds are for testing. `sudo bootc rollback` undoes an update.
:::

## Built with bootc

The whole system is one image, built by GitHub Actions like Bazzite itself.

- Updates download in the background and apply at the next start; a power cut can't leave a half-installed system.
- The previous version stays on the drive: `sudo bootc rollback` ([Rolling back](/updating/bootc#rolling-back)).
- Games, settings and files are kept.

Start it with **bazzite-bootc-loader** from the same release ([Which loader](/getting-started/loader#which-loader)); it starts other images too.

:::note[Installed before v2.5?]
That is the **Legacy** form (`legacy` on the Install line of `ps5-report`), no longer updated: [switch to bootc](/updating/legacy).
:::

## What works on your console

It depends on the HDMI chip, the Wi-Fi/Bluetooth chip and the model; `ps5-report` shows all three ([Hardware status](/getting-started/hardware#console-models-and-chips)).

**By HDMI chip:**

| Feature | FLAVA3 (most consoles) | VERDE (some later models) |
| --- | :---: | :---: |
| 1080p, 1440p and 4K at 60 Hz; 1080p at 120 Hz | ✅ | ✅ |
| 1440p at 100 and 120 Hz; 1080p at 100 Hz | ✅ | ✅ |
| Other modes the display lists (144 or 165 Hz, ultrawide) | ✅ | ❌ |
| 4K at 120 Hz (HDMI 2.1 TV and cable) | ✅ | ❌ |
| HDR (1080p60, 4K60) | ✅ | ❌ |
| VRR (HDMI VRR or FreeSync) | ✅ | ❌ |

It starts at the display's own resolution at 60 Hz; choose another under Game Mode → Settings → Display ([Display](/troubleshooting/display#supported-resolutions)).

**By Wi-Fi/Bluetooth chip:**

| Feature | IW620 | MediaTek (Slim) | MediaTek (Pro) |
| --- | :---: | :---: | :---: |
| One DualSense for the PS5 and Linux ([DualSense](/post-install/dualsense-bazzite-deck)) | own Linux pairing | shared pairing | own Linux pairing |
| Wi-Fi after a warm reboot (`ps5-warm-reboot on`) | ⚠️ | ✅ | ✅ |

IW620: while Linux has its own Bluetooth address (the default), restarts go through the PS5 OS. If Wi-Fi is missing after a warm reboot, power off and start with the loader.

**PS5 Pro:** all 60 compute units, with the Pro's own GPU firmware, which the loader dumps on most system software versions ([PS5 Pro](/troubleshooting/ps5-pro)).

**Controllers, wheels and streaming** (from v2.16):

| Device | Driver |
| --- | --- |
| Xbox Wireless Adapter | xone (controllers on a cable keep the kernel's driver) |
| Xbox controllers over Bluetooth | xpadneo |
| Racing wheels with force feedback | Logitech (new-lg4ff), Thrustmaster (hid-tmff2, T150/TMX), Fanatec |
| GameCube controller adapter | gcadapter-oc |
| OBS virtual camera | v4l2loopback |
| Razer devices | openrazer |

## What you need for this image

- An original PS5, Slim or Pro on a [supported firmware](/getting-started/prerequisites#firmware), and [bazzite-bootc-loader](/getting-started/loader#which-loader).
- etaHEN and kstuff off: with the Linux loader they cause freezes.
- A USB drive of 64 GB or more; an external SSD is much faster than a stick.
- A PC to flash the image. A USB keyboard helps with the first setup.
- The [PS5 settings](/installation/booting#required-ps5-settings): USB power in rest mode **Always**, HDMI Device Link **off**.

## Download and extract

1. Download the `ps5-bazzite-deck-bootc-vX.Y.img.7z.00*` files, the `.sha256` file and `bazzite-bootc-loader-vX.Y.elf` from the [release marked Latest](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) into one folder.
2. Check them: `sha256sum -c --ignore-missing <file>.img.sha256` on Linux, or `Get-FileHash <file> -Algorithm SHA256` per volume on Windows.
3. Extract the `.001` file with [7-Zip](https://7-zip.org) (Windows), Keka (macOS) or `7z x` (Linux). The `.img` is what you flash.

Already installed? `sudo bootc upgrade` ([Updating](/updating/bootc#updating)).

## Next steps

[Flash the image](/installation/flash), then start Linux.
