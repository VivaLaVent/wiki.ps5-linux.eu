---
title: Common problems on PS5 Bazzite Deck
sidebar_label: Common problems
sidebar_position: 2
description: First steps for PS5 Bazzite Deck when the screen, Game Mode, Bluetooth or Wi-Fi misbehave, starting with getting in over SSH.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Common problems on PS5 Bazzite Deck

The first steps for the problems reported most often. Each section links to the page with the full details. When none of it helps, ask in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) with the file `ps5-report` saves.

## Get in over SSH

When the screen stays black, the console is often still running. SSH is on in PS5 Bazzite Deck: from a PC on the same network, run `ssh ps5@<ps5-ip>` (password `ps5`). The steps to find the IP address are on [Getting help](/troubleshooting/getting-help#find-your-ps5s-ip-address).

Over SSH you can collect a report even without a picture:

```bash
ps5-report
```

`REMOTE HOST IDENTIFICATION HAS CHANGED!` after a reflash or a switch to another install is expected, see [Connect over SSH](/troubleshooting/getting-help#connect-over-ssh).

## Switch between Game Mode and Desktop Mode

| From | To | How |
| --- | --- | --- |
| Game Mode | Desktop Mode | **Steam** button → **Power** → **Switch to Desktop** |
| Desktop Mode | Game Mode | **Return to Gaming Mode** on the desktop |
| SSH | Desktop Mode | `steamos-session-select plasma` |
| SSH | Game Mode | `steamos-session-select gamescope` |

From v2.6, PS5 Bazzite Deck starts in Desktop Mode. To start in Game Mode instead, change the default session in Steam's settings in Game Mode, or run `ujust set-default-game-mode` (and `ujust set-default-desktop` to go back).

:::warning[Switching to the desktop breaks the picture]
On some TVs, the picture doesn't come back after **Switch to Desktop**. Power off and start with the loader: with Desktop Mode as the default, the console starts there without a switch.
:::

## Display

- **No picture at all:** follow [Display recovery](/hardware/hdmi#display-recovery). The quickest fix is `amdgpu.force_1080p=1` in `cmdline.txt`, added from a PC.
- **The desktop, Steam or a browser stay at 1080p:** the HDMI driver marks 1080p at 60 Hz as the preferred mode, so the first start always has a picture, and the desktop keeps it until you choose another. Set the resolution and refresh rate in **System Settings → Display & Monitor**; Game Mode has its own in Steam's **Settings → Display**.
- **Colours look washed out or too dark:** set the TV's HDMI black level to match the console, see [RGB range](/hardware/hdmi#rgb-range).
- **No 120 Hz, 4K120 or VRR:** these need the FLAVA3 HDMI chip and a display that supports them, see [HDMI and display](/hardware/hdmi). HDMI 2.1 (FRL) is only used for 4K at 120 Hz (and 100 Hz); every other mode fits HDMI 2.0. `sudo dmesg | grep -e 4K120 -e 'over FRL'` shows whether your TV allows it (`4K120 possible`) and whether it is in use (`3840x2160@120 over FRL`).
- **100 Hz:** PS5 Bazzite Deck v2.6 offers 1080p, 1440p and 4K at 100 Hz on FLAVA3 consoles with `hdmi.modes_100hz=1` in `cmdline.txt`.
- **The screen goes black in a game on a PS5 Pro, and SSH still works:** a GPU hang that the Pro can't recover from. Restart over SSH as shown on [PS5 Pro](/hardware/ps5-pro#starting-linux-fails-on-the-pro); on v2.5.1 and older, see [Command-processor microcode](/hardware/ps5-pro#cp-microcode).

## Bluetooth

1. Check that the adapter is there and powered: `bluetoothctl show` should list a controller with `Powered: yes`.
2. Pair the DualSense with Linux once, on another PS5 profile than the one you use in the PS5 OS, see [One DualSense for the PS5 and Linux](/hardware/wifi-bluetooth#one-dualsense-for-the-ps5-and-linux). `ps5-bt-address status` shows the Linux-only address.
3. After a warm restart without Bluetooth, power off and start with the loader.

Chip-specific fixes are on [Bluetooth](/hardware/wifi-bluetooth#bluetooth).

## Wi-Fi

1. `nmcli device` lists the Wi-Fi device; `ps5-report` names the chip on its **Wi-Fi** line.
2. No Wi-Fi device: the IW620 chip (most original PS5s) needs its out-of-tree driver, which PS5 Bazzite Deck includes; after a warm restart, `ps5-wifi-repair` reloads it, and a power off fixes it for sure.
3. Slow or dropping Wi-Fi: power saving is off by default (`ps5-perf wifi` switches it off again).

Everything else is on [Wi-Fi troubleshooting](/hardware/wifi-bluetooth#troubleshooting). Ethernet works without setup.

## Next steps

- [Getting help](/troubleshooting/getting-help): SSH and logs for a bug report
- [Known issues](/troubleshooting/known-issues)
- [Recovery](/troubleshooting/recovery)
