---
title: Supported firmware
description: Which PS5 firmware versions can run Linux, and which one to choose.
sidebar_position: 2
---

# Supported firmware

Whether your PS5 can run Linux depends on its system software version, because the jailbreak and the Linux loader need an exploitable version. Check yours before you change anything on the console.

:::info[Newer firmware]
Sony's current retail firmware is beyond the newest exploitable version, and the ps5-linux project has said that versions past the current exploit chain won't be supported. If your console is already on a newer version, there is nothing to do but wait for a new exploit; asking on Discord won't speed that up.
:::

## PS5 Slim and PS5 Pro

The Slim runs the same firmware versions as the original PS5 and is supported on all of them. The Pro shipped with newer firmware, so its list starts later; the official loader covers it, see [Which loader](/installation/booting#which-loader). The Pro's GPU firmware is dumped by the loader on the versions it has offsets for, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

## Exploitable versions

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

## Which firmware should I be on?

Linux runs the same on every supported version: there is nothing to gain for Linux by updating or by staying low. The choice is about what else you want from the console:

| Goal | Recommended firmware |
| --- | --- |
| Linux only, no M.2 | The lowest version you have; 3.xx is fine |
| M.2, PS5 games, Linux and FPKG | 4.03 is the community's long-time favourite: full jailbreak support, backports, M.2 drives up to 4 TB |
| Already on 5.xx to 7.xx | Stay. No downside for Linux |
| On 8.xx to 10.xx | Update to the 11.xx version you want: Linux and FPKG both work there |
| Already on 11.xx to 13.xx | Stay. No downside for Linux |

## Check your firmware

Go to **Settings → System → System Software → System Software Version**.

## Update to a specific firmware

Download the matching PUP file from [darthsternie.net/ps5-firmwares](https://darthsternie.net/ps5-firmwares/) and follow [Sony's reinstall guide](https://www.playstation.com/en-us/support/hardware/reinstall-playstation-system-software-safe-mode).

:::warning
A PS5 can't be downgraded. Only ever update to the exact version you want.
:::
