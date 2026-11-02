---
title: Booting Linux
sidebar_position: 2
description: Plug in the USB drive, send the Linux loader and read the boot LED.
---

# Booting Linux

## Plug the USB drive into the PS5

Use one of the supported boot ports:

- **Original PS5:** the **front USB-C** port or the two **rear USB-A** ports.
- **PS5 Slim:** the two **rear USB-A** ports. One of the two front USB-C ports is the slow one, so the rear ports are the safe choice.

Every PS5 has one slow USB 2.0 port (on the original PS5, the front USB-A port). It works, but booting and loading are much slower; use it for a controller or keyboard instead.

## Jailbreak the PS5

Jailbreak your PS5 with the exploit for your firmware (see [Supported firmware](/getting-started/firmware)). Jailbreaking itself is not covered by this wiki.

:::danger[Send the Linux loader as the only payload]
Do not run etaHEN, kstuff or any other payload before the Linux loader. If you already have, **restart the PS5** and jailbreak again from scratch. Running other payloads first stops Linux from booting.

If you use an autoloader, point `autoloader.txt` at the Linux loader `.elf` only. Version **0.4** of the autoloader is more stable than 0.7 on some setups.
:::

There is no permanent jailbreak: you need to jailbreak again every time you want to boot into Linux. Once the exploit has run, the PS5 listens on port `9021` for the Linux loader.

## Which loader

The Linux loader is the payload that boots Linux. Use the one that matches your console and firmware:

| Loader | For |
| --- | --- |
| [ps5-linux/ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader/releases/) | The official loader |
| [rmuxwashere/ps5-linux-loader](https://github.com/rmuxwashere/ps5-linux-loader/releases) | Original PS5 and Slim. The loader [PS5 Bazzite Deck](/installation/bazzite-deck) is tested with, including firmware 13.60 (support by soniciso1). |
| [gzimbric/ps5-linux-loader](https://github.com/gzimbric/ps5-linux-loader) | PS5 Pro on 11.xx (branch `ps5-pro-11xx`) |
| [Wigglez-sudo/12.xx-linux-loader](https://github.com/Wigglez-sudo/12.xx-linux-loader) | 12.xx, including the PS5 Pro |

The pinned messages in the `#loader` channel on [Discord](https://discord.gg/ps5linux) point to the current payload.

## Send the Linux loader

Download `ps5-linux-loader.elf` from one of the loaders above, or build the official one yourself:

```bash
# ARM64 hosts only: install the cross-compilation tools first
sudo apt install gcc-x86-64-linux-gnu binutils-x86-64-linux-gnu

git clone https://github.com/ps5-linux/ps5-linux-loader
cd ps5-linux-loader
make
```

Send it to the PS5. Replace `$PS5IP` with the IP address shown on the PS5's screen:

```bash
socat -t 99999999 - TCP:$PS5IP:9021 < ps5-linux-loader.elf
```

The PS5 then goes into rest mode. Wait for the LED to turn **solid orange**, then press the power button.

:::tip[Waking the PS5 without pressing the button]
If you are testing repeatedly, you can wake the PS5 from rest mode with a DualSense or over HDMI-CEC instead of walking over to it. The [DualSense Bluetooth wake spoofer](https://github.com/deftdawg/pywakepsXonbt) lets another machine send the wake message over Bluetooth, without the real controller being in range.
:::

## Reading the LED

| LED | Meaning |
| --- | --- |
| Orange, blinking | Going into rest mode, wait |
| Orange, solid | Ready: press the power button now |
| White | Linux has booted |
| Back to the PS5 OS | You pressed the power button too early, or USB power in rest mode is not enabled |

The front light bar can also be controlled from Linux, see [LED control](/hardware/led).

## Black screen?

Try these first:

- Remove `video=DP-1:1920x1080@60` from `cmdline.txt` on the FAT32 partition.
- Add `amdgpu.force_1080p=1` to `cmdline.txt`.
- Toggle HDCP on and off in the PS5 settings (try both).
- Try a different monitor or capture card.
- Ask on [Discord](https://discord.gg/ps5linux) and include your EDID information.

See [Display output](/using-linux/display#troubleshooting-a-black-screen) for the full troubleshooting list.

Next: [First boot](/installation/first-boot).
