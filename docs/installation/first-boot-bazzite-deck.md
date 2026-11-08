---
title: "First boot: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "What to expect the first time PS5 Bazzite Deck starts: the password, Steam's first update, the resolution and Desktop Mode."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# First boot: PS5 Bazzite Deck

- The user is `ps5`, and the password is **`ps5`** too. You need it for anything that requires admin rights. SSH is on: `ssh ps5@<your PS5's IP>`.

  :::warning
  **Change the password** with `passwd`: anyone on your network can try `ps5`.
  :::

- **After you join Wi-Fi, Steam updates itself** in the background, often behind a blank screen with a blinking cursor (or a grey mouse pointer) that looks frozen, for several minutes, and for much longer on a hard drive. The same can happen later when Steam updates while a game downloads. Don't power off during this: it is the most common cause of a broken first start. The console can also restart once by itself after the network setup; cold boot and run the loader again.
- The first start is at **1080p60**. Choose your resolution under Game Mode → Settings → Display; it is remembered.
- Set **RGB range** to **Full**, both in Game Mode and on the desktop.

- **Be patient:** the first start can stay black for a few minutes, and much longer on a hard drive or a slow USB stick. On a USB SSD, more than **10 minutes** without a picture or a blinking cursor means something is wrong: power off and see [Display recovery](/troubleshooting/display#display-recovery) and [Storage and USB](/troubleshooting/storage).
- **It starts in Desktop Mode** (from v2.6.1). **Return to Gaming Mode** on the desktop opens Steam's Game Mode; to start there every time, see [Game Mode and Desktop Mode](/post-install/bazzite#game-mode-and-desktop-mode).
