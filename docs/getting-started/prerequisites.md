---
title: What you need
sidebar_label: What you need
description: Console firmware, loader, drive, display and network you need before installing Linux on a PS5.
hardware: [original, slim, pro]
applies_to: all
---

# What you need

Two console settings, a drive, and a PC to prepare it: that is all Linux on the PS5 needs. Get the settings right first, because a wrong one costs you the most time later.

## Required PS5 settings

Change these in the PS5 OS **before** you jailbreak and send the Linux loader. A settings reset or a firmware reinstall clears them, so check them again after either. A missing setting here is behind most "Linux won't boot" reports.

1. **Supply power to USB in rest mode** (required to boot):
   **Settings → System → Power Saving → Features Available in Rest Mode → Supply Power to USB Ports → Always**
2. **Disable HDMI Device Link** (required):
   **Settings → HDMI → Enable HDMI Device Link → Off**

**Recommended:**

- Disable automatic updates: **Settings → System → System Software → System Software Update and Settings**
- Disable automatic error reporting: **Settings → System → System Software → Report System Software Errors Automatically**

## Hardware

- A USB drive of 64 GB or more for the official and community images (32 GB for [PS5 Bazzite Deck](/choose/bazzite-deck)). An external SSD boots and loads much faster than a flash drive. Flashing erases the drive, so its current contents and format don't matter.
- A USB keyboard and mouse for the first setup.

## Host machine

A PC that can write the image to the drive and send the loader: Linux, or Windows with WSL. You need `dd` (or Rufus on Windows) for the image and `socat` for the loader. Docker is only needed if you [build an image yourself](/choose/build-your-own).

## Linux knowledge

You will spend time in a terminal: editing a file on the boot partition, running an install script, reading a log. Nothing here needs more than the command line basics, but if those are new to you, an introductory shell tutorial such as [learnshell.org](https://www.learnshell.org/) pays for itself before you start.

## Firmware and loader {#firmware}

Whether your PS5 can run Linux depends on its system software version, because the jailbreak and the Linux loader need an exploitable version. Check yours before you change anything on the console.

:::info[Newer firmware]
Sony's current retail firmware is beyond the newest exploitable version, and the ps5-linux project has said that versions past the current exploit chain won't be supported. If your console is already on a newer version, there is nothing to do but wait for a new exploit; asking on Discord won't speed that up.
:::

### PS5 Slim and PS5 Pro

The Slim runs the same firmware versions as the original PS5 and is supported on all of them. The Pro shipped with newer firmware, so its list starts later; the official loader covers it, see [Which loader](/installation/booting#which-loader). The Pro's GPU firmware is dumped by the loader on the versions it has offsets for, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

### Exploitable versions

The authoritative list is the README of the [Linux loader](https://github.com/ps5-linux/ps5-linux-loader). At the time of writing it reads as follows; jailbreaking itself is not covered by this wiki, and the exploit column is for orientation only.

| Firmware | M.2 support | Exploit |
| --- | --- | --- |
| 3.00, 3.10, 3.20, 3.21 | ❌ | WebKit + umtx2 |
| 4.00, 4.02, 4.03, 4.50, 4.51 | ✅ | WebKit + umtx2 |
| 5.00, 5.02, 5.10, 5.50 | ✅ | WebKit + umtx2 |
| 6.00, 6.02, 6.50 | ✅ | Y2JB + Lapse |
| 7.00, 7.01, 7.20, 7.40, 7.60, 7.61 | ✅ | Y2JB + Lapse |
| 11.00, 11.20, 11.40, 11.60 | ✅ | Y2JB Relapse / WebKit Relapse |
| 12.00, 12.02, 12.20, 12.40, 12.60, 12.70 | ✅ | Y2JB Relapse / WebKit Relapse |
| 13.00, 13.20, 13.40, 13.42, 13.60 | ✅ | Y2JB Relapse / WebKit Relapse |

:::info[Why no M.2 on 3.xx?]
A console on 3.xx firmware doesn't start with a drive in the M.2 slot, so Linux on 3.xx is USB only.
:::

**PS5 Pro:** 11.00, 11.20, 11.40, 11.60; 12.00, 12.02, 12.20, 12.40, 12.60, 12.70; 13.20, 13.40, 13.42, 13.60. All with M.2 support.

### Which firmware should I be on?

Linux runs the same on every supported version: there is nothing to gain for Linux by updating or by staying low. The choice is about what else you want from the console:

| Goal | Recommended firmware |
| --- | --- |
| Linux only, no M.2 | The lowest version you have; 3.xx is fine |
| M.2, PS5 games, Linux and FPKG | 4.03 is the community's long-time favourite: full jailbreak support, backports, M.2 drives up to 4 TB |
| Already on 5.xx to 7.xx | Stay. No downside for Linux |
| On 8.xx to 10.xx | Update to the 11.xx version you want: Linux and FPKG both work there |
| Already on 11.xx to 13.xx | Stay. No downside for Linux |

### Check your firmware

Go to **Settings → System → System Software → System Software Version**.

### Update to a specific firmware

Download the matching PUP file from [darthsternie.net/ps5-firmwares](https://darthsternie.net/ps5-firmwares/) and follow [Sony's reinstall guide](https://www.playstation.com/en-us/support/hardware/reinstall-playstation-system-software-safe-mode).

:::warning
A PS5 can't be downgraded. Only ever update to the exact version you want.
:::

## Next steps

**[Choose your image](/getting-started/which-image)**.
