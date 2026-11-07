---
title: First boot
sidebar_position: 3
description: What to expect the first time Linux starts on the PS5, and the one thing to do before anything else on Ubuntu.
hardware: [original, slim, pro]
applies_to: all
---

# First boot

The first start takes longer than later ones: the root partition grows to fill the drive, and some images run a setup screen for the time zone, host name and password.

:::warning[Ubuntu: black screen before you create a user]
The Ubuntu image creates its user during the first-boot setup. Until that is done there is no account, so if the screen goes black before you finish, you can't SSH in either. The way out is to create the user from another Linux system with chroot, see [Recovery via chroot](/troubleshooting/error-messages#recovery-via-chroot).
:::

1. Create your user account and password where the image asks for it, and remember them.
2. If the screen stays black for more than a few minutes, switch TTY (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>) before assuming the boot failed, see [Display recovery](/troubleshooting/display#display-recovery).
3. Check that the root partition has grown: `df -h /` should show the drive's size, not a few GB. If not, see [USB and storage](/troubleshooting/storage).

Then work through [After installing](/post-install/all-distros): the PS5-specific steps every image needs, then the ones for your image.

## Default user and password

It depends on the image. The official CachyOS image logs in as `steam` with the password `steam` and the hostname `ps5`. PS5 Bazzite Deck uses `ps5` for both. Ubuntu asks you to create a user on the first boot. Change the password with `passwd` right after the first login: SSH with password login is on by default on most images, see [Get in over SSH](/troubleshooting/getting-help#ssh).

## PS5 Bazzite Deck


- The default password is **`ps5`**. You need it for anything that requires admin rights. SSH is on: `ssh ps5@<your PS5's IP>`.

  :::warning
  **Change the password** with `passwd`: anyone on your network can try `ps5`.
  :::

- **After you join Wi-Fi, Steam updates itself** in the background, often behind a blank screen with a blinking cursor (or a grey mouse pointer) that looks frozen, for several minutes, and for much longer on a hard drive. The same can happen later when Steam updates while a game downloads. Don't power off during this: it is the most common cause of a broken first start. The console can also restart once by itself after the network setup; cold boot and run the loader again.
- The first start is at **1080p60**. Choose your resolution under Game Mode → Settings → Display; it is remembered.
- Set **RGB range** to **Full**, both in Game Mode and on the desktop.

- **Be patient:** the first start can stay black for a few minutes, and much longer on a hard drive or a slow USB stick. On a USB SSD, more than **10 minutes** without a picture or a blinking cursor means something is wrong: power off and see [Display recovery](/troubleshooting/display#display-recovery) and [Storage and USB](/troubleshooting/storage).
- **It starts in Desktop Mode** (from v2.6.1). **Return to Gaming Mode** on the desktop opens Steam's Game Mode; to start there every time, see [Game Mode and Desktop Mode](/post-install/bazzite#game-mode-and-desktop-mode).

## Next steps

Continue with **[After installing: all images](/post-install/all-distros)**, then:

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [After installing: other distros](/post-install/not-bazzite-deck)
