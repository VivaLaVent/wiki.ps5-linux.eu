---
title: First boot
sidebar_position: 3
description: What to expect the first time Linux starts on the PS5, on every image, then on PS5 Bazzite Deck and on the other images.
hardware: [original, slim, pro]
applies_to: all
---

# First boot

The first start takes longer than later ones: the root partition grows to fill the drive, and some images run a setup screen for the time zone, host name and password.

1. If the screen stays black for more than a few minutes, [switch TTY](/troubleshooting/display#tty-switch) before assuming the boot failed.
2. Check that the root partition has grown: `df -h /` should show the drive's size, not a few GB. If not, see [USB and storage](/troubleshooting/storage).
3. Change the default password right after the first login, see [Change the password](/post-install/all-distros#change-the-password-and-check-ssh).

The user, the password and what else to expect depend on your image:

- **[PS5 Bazzite Deck](/installation/first-boot-bazzite-deck)**
- **[Other images](/installation/first-boot-other-images)**

## Next steps

Continue with **[After installing: all images](/post-install/all-distros)**, then:

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [After installing: other images](/post-install/not-bazzite-deck)
