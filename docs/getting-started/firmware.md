---
title: Supported firmware
description: Which PS5 firmware versions can run Linux, and which one to choose.
sidebar_position: 2
---

# Supported firmware

:::info[Before you ask about 14.xx]
Retail firmware is already past `14.xx` (the public installer shows something like `26.06-14.10.00`), but the exploit chain stops at **13.60**. The ps5-linux project states that 14.00 and later are not going to be supported. Asking on Discord doesn't change that.
:::

## PS5 Slim and PS5 Pro

Linux also runs on the Slim and the Pro. The Slim supports the same firmware list as the original PS5. The Pro is supported from firmware 11.00 by the official loader, see [Which loader](/installation/booting#which-loader).

## Exploitable versions

Jailbreaking is not covered by this wiki; the exploit column is for reference only.

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
On 3.xx firmware, the PS5 fails to boot when an M.2 drive is installed.
:::

**PS5 Pro:** 11.00, 11.20, 11.40, 11.60; 12.00, 12.02, 12.20, 12.40, 12.60, 12.70; 13.20, 13.40, 13.42, 13.60. All with M.2 support. The Pro's own GPU firmware ("Viola") is dumped by the loader on 13.20 and 13.60, see [Hardware overview](/hardware/overview#console-models-and-chips).

## Which firmware should I be on?

There is **no performance difference** for Linux between any of the supported firmware versions. These are the community recommendations:

| Goal | Recommended firmware |
| --- | --- |
| Linux only, no M.2 | **3.00**: stay as low as possible |
| M.2 + PS5 games + Linux + FPKG | **4.03**: community favourite, full jailbreak support, backports, M.2 drives up to 4 TB, FPKG support |
| M.2 + PS5 games + Linux + FPKG | **5.00–7.61**: fine to stay, no downsides for Linux |
| M.2 + PS5 games + Linux | **8.00–10.60**: update to 11.00–11.60 if you want Linux and FPKG as soon as possible |
| M.2 + PS5 games + Linux + FPKG | **11.00–11.60**: fine to stay, no downsides for Linux |
| M.2 + PS5 games + Linux | **12.00–13.60**: fine to stay, no downsides for Linux |

## Check your firmware

Go to **Settings → System → System Software → System Software Version**.

## Update to a specific firmware

Download the matching PUP file from [darthsternie.net/ps5-firmwares](https://darthsternie.net/ps5-firmwares/) and follow [Sony's official reinstall guide](https://www.playstation.com/en-us/support/hardware/reinstall-playstation-system-software-safe-mode).

:::warning
You cannot downgrade. Only ever update to the exact version you want.
:::
