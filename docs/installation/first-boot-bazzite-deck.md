---
title: "First boot: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "What to expect the first time PS5 Bazzite Deck starts: the password, Steam's first update, the resolution and Desktop Mode."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# First boot: PS5 Bazzite Deck

- **Be patient:** the first start can stay black for a few minutes, longer on a slow USB stick or hard drive. On a USB SSD, more than **10 minutes** without a picture or a blinking cursor means something is wrong: power off and see [Display recovery](/troubleshooting/display#display-recovery).
- **User and password:** both `ps5`. SSH is on: `ssh ps5@<your PS5's IP>`.

  :::warning
  **Change the password** with `passwd`: anyone on your network can try `ps5`.
  :::

- **It starts in Desktop Mode.** **Return to Gaming Mode** on the desktop opens Game Mode; to start there every time, see [Game Mode and Desktop Mode](/post-install/bazzite#game-mode-and-desktop-mode).
- **After you join Wi-Fi, Steam updates itself**, often behind a blank screen that looks frozen, for several minutes. Don't power off: that is the most common cause of a broken first start. If the console restarts by itself after the network setup, power off and start with the loader again.
- **Resolution:** it starts at your display's own resolution at 60 Hz. Change it under Game Mode → Settings → Display. On a 4K TV games render at 4K too; 1080p gives higher frame rates. If the screen stays dark, add `amdgpu.force_1080p=1` to `cmdline.txt` on the boot partition from a PC.
- Set **RGB range** to **Full**, in Game Mode and on the desktop.
