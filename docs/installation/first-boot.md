---
title: First boot
sidebar_position: 4
description: What to expect the first time Linux starts on the PS5, and the one thing to do before anything else on Ubuntu.
hardware: [original, slim, pro]
applies_to: all
---

# First boot

The first start takes longer than later ones: the root partition grows to fill the drive, and some images run a setup screen for the time zone, host name and password.

:::warning[Ubuntu: black screen before you create a user]
The Ubuntu image creates its user during the first-boot setup. Until that is done there is no account, so if the screen goes black before you finish, you can't SSH in either. The way out is to create the user from another Linux system with chroot, see [Recovery via chroot](/troubleshooting/recovery).
:::

1. Create your user account and password where the image asks for it, and remember them.
2. If the screen stays black for more than a few minutes, switch TTY (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>) before assuming the boot failed, see [Display recovery](/hardware/hdmi#display-recovery).
3. Check that the root partition has grown: `df -h /` should show the drive's size, not a few GB. If not, see [USB and storage](/hardware/storage#usb-drive-required).

Then work through the [Post-install checklist](/post-install/all-distros): it holds the PS5-specific steps (kernel hold, fan and boost, GPU memory, Wi-Fi driver) that every image needs.

## Where to go next

- [Post-install checklist](/post-install/all-distros)
- [Move Linux to an M.2 SSD](/installation/m2-install)
