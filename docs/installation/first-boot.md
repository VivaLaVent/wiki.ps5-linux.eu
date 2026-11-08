---
title: First boot
sidebar_position: 3
description: What to expect the first time Linux starts on the PS5, on every image, then on PS5 Bazzite Deck and on the other images.
hardware: [original, slim, pro]
applies_to: all
---

# First boot

The first start takes longer than later ones: the root partition grows to fill the drive, and some images run a setup screen for the time zone, host name and password.

1. If the screen stays black for more than a few minutes, switch TTY (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>) before assuming the boot failed, see [Display recovery](/troubleshooting/display#display-recovery).
2. Check that the root partition has grown: `df -h /` should show the drive's size, not a few GB. If not, see [USB and storage](/troubleshooting/storage).
3. Change the default password with `passwd` right after the first login: SSH with password login is on by default on most images, see [Get in over SSH](/troubleshooting/getting-help#ssh).

The user, the password and what else to expect depend on your image:

- **[PS5 Bazzite Deck](/installation/first-boot-bazzite-deck)**
- **[Other images](/installation/first-boot-other-images)**

## Next steps

Continue with **[After installing: all images](/post-install/all-distros)**, then:

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [After installing: other images](/post-install/not-bazzite-deck)
