---
title: Boot to the desktop or Gaming Mode
sidebar_position: 7
description: Choose whether the next boot starts the KDE desktop or Steam Gaming Mode, and avoid the switch that breaks HDMI.
hardware: [original, slim, pro]
applies_to: all
---

# Boot to the desktop or Gaming Mode

Some SteamOS-style images start in Gaming Mode (Gamescope) by default. On these images you can choose the session the next boot starts.

:::warning[Switching from Gaming Mode to the desktop can break HDMI]
Choosing **Switch to Desktop** inside Steam's Gaming Mode can leave the display dead until the next full restart. Switching the other way, from the desktop to Gaming Mode, works. Set the session before you boot instead of switching while Linux runs.
:::

:::note[Not tested]
This was reported on the official CachyOS image. [PS5 Bazzite Deck](/choose/bazzite-deck) has its own session handling, see [Built-in commands](/post-install/bazzite#built-in-commands).
:::

## Choose the next session

The image reads a one-word file at boot. Run this on the PS5 in Linux:

```bash
echo plasma > ~/.config/ps5-next-session
```

To return to Gaming Mode:

```bash
echo gamescope > ~/.config/ps5-next-session
```

Restart, then run your jailbreak and the Linux loader again. Linux returns to the PS5 OS on every restart, see [Booting Linux](/installation/booting).

## Set it before the first boot

While the drive is connected to a PC with a Linux system, mount the root partition (partition 1) and create `home/steam/.config/ps5-next-session` containing `plasma`. The file must be owned by user ID 1000.

## Log out of the desktop

Logging out of Plasma returns to Gaming Mode and resets the file to `gamescope`. Write `plasma` to the file again before the next boot. A restart or shutdown from the desktop keeps the setting.

Steam Big Picture still runs inside the desktop session.

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
