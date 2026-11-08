---
title: "First boot: other images"
sidebar_label: Other images
sidebar_position: 2
description: "What to expect the first time an official or self-built PS5 Linux image starts: the default users, and creating the user on Ubuntu."
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# First boot: other images

## Default user and password

- **CachyOS** (official image): logs in as `steam` with the password `steam`; the hostname is `ps5`.
- **Ubuntu** (official image): asks you to create a user and password during the first-boot setup. Remember them.
- **Self-built installs:** the user you created when you built it.

## Ubuntu: create the user before anything else

:::warning[Ubuntu: black screen before you create a user]
The Ubuntu image creates its user during the first-boot setup. Until that is done there is no account, so if the screen goes black before you finish, you can't SSH in either. The way out is to create the user from another Linux system with chroot, see [Recovery via chroot](/troubleshooting/error-messages#recovery-via-chroot).
:::
