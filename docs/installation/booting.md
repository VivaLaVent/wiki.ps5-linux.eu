---
title: Booting Linux
sidebar_position: 2
description: Plug in the USB drive, send the Linux loader and read the boot LED.
hardware: [original, slim, pro]
applies_to: all
---

# Booting Linux

With the image on the drive, booting is three things: the drive in the right port, a jailbreak, and the Linux loader sent to the console. The LED tells you what the console is doing.

## Plug the USB drive into the PS5

Use one of the fast ports:

- **Original PS5:** the **front USB-C** port or the two **rear USB-A** ports.
- **PS5 Slim:** the two **rear USB-A** ports. One of the two front USB-C ports is the slow one, so the rear ports are the safe choice.

Every PS5 has one slow USB 2.0 port (on the original PS5, the front USB-A port). It boots too, but everything that reads from the drive takes much longer; use it for a controller or keyboard instead. Keep hubs, keyboards and mice off the fast ports until Linux is running: they can stop the console from entering rest mode, see [Known issues](/troubleshooting/known-issues#rest-mode-error-back-to-the-ps5-login-screen).

## Jailbreak the PS5

Jailbreak your PS5 with the exploit for your firmware (see [Supported firmware](/getting-started/prerequisites#firmware)). Jailbreaking itself is not covered by this wiki.

:::danger[Send the Linux loader as the only payload]
etaHEN, kstuff and other payloads change the console in ways the Linux loader can't undo, so Linux doesn't boot after them. If one has already run, **restart the PS5**, jailbreak again and send only the Linux loader.

With an autoloader, put only the Linux loader `.elf` in `autoloader.txt`. Some setups are more reliable with an older autoloader version than with the newest.
:::

There is no permanent jailbreak: the console starts clean every time, so every Linux session begins with the exploit. Once the exploit has run, the PS5 listens on port `9021` for the Linux loader.

## Which loader

The Linux loader is the payload that boots Linux. The [official loader](https://github.com/ps5-linux/ps5-linux-loader/releases/) covers every supported console and firmware: the original PS5, the Slim and the Pro. Its README lists the versions; the Pro support and the newer firmware versions began as community forks and have been merged.

| Loader | For |
| --- | --- |
| [ps5-linux/ps5-linux-loader](https://github.com/ps5-linux/ps5-linux-loader/releases/) | Everything: original PS5, Slim and Pro. Use this one. For a PS5 Pro, build it from `main`: only `main` dumps the Pro's GPU firmware, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware). |
| [rmuxwashere/ps5-linux-loader](https://github.com/rmuxwashere/ps5-linux-loader/releases) | Fork that [PS5 Bazzite Deck](/choose/bazzite-deck) was tested with. Its newer-firmware and Pro fixes have been sent upstream; it doesn't dump the Pro's GPU firmware. |
| [gzimbric/ps5-linux-loader](https://github.com/gzimbric/ps5-linux-loader), [Wigglez-sudo/12.xx-linux-loader](https://github.com/Wigglez-sudo/12.xx-linux-loader) | Older forks for the Pro and for newer firmware. Merged upstream; kept here for reference. |

The pinned messages in the `#loader` channel on [Discord](https://discord.gg/ps5linux) point to the current payload.

## Send the Linux loader

Download `ps5-linux-loader.elf` from one of the loaders above, or build the official one yourself (the same commit always gives the same file, so the SHA-256 of your build can be compared with one someone else tested):

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
| White straight to solid orange, no blinking | Rest mode was refused; the power button starts the PS5 OS, see [Known issues](/troubleshooting/known-issues#rest-mode-error-back-to-the-ps5-login-screen) |
| Back to the PS5 OS | You pressed the power button too early, or USB power in rest mode is not enabled |

The front light bar can also be controlled from Linux, see [LED control](/hardware/peripherals#led).

## Black screen?

Try these first:

- Remove `video=DP-1:1920x1080@60` from `cmdline.txt` on the FAT32 partition.
- Add `amdgpu.force_1080p=1` to `cmdline.txt`.
- Turn HDCP off in the PS5 settings, or on if it was off.
- Try a different monitor or capture card.
- Ask on [Discord](https://discord.gg/ps5linux) and include your EDID, see [Display recovery](/hardware/hdmi#decode-the-edid).

See [Display output](/hardware/hdmi#troubleshooting-a-black-screen) for the full troubleshooting list.

Next: [First boot](/installation/first-boot).

## Next steps

**[First boot](/installation/first-boot)**.
