---
title: First boot
sidebar_position: 3
description: Steps to complete after Linux boots for the first time (Ubuntu).
---

# First boot

These steps are for the default **Ubuntu** image.

:::warning[Ubuntu: black screen before you create a user]
Ubuntu has no default user. If the screen goes black before you finish setup, you cannot SSH in, because there is no account to log in with. Create a user from another Linux system with chroot, see [Recovery via chroot](/troubleshooting/recovery).
:::

1. Create your user account and password. Make sure you remember them.
2. Disable the screen saver. It is currently broken and cannot be dismissed once it starts.
3. Hold the kernel packages so they are not upgraded by accident:

   ```bash
   sudo apt-mark hold linux-generic linux-generic-hwe-24.04 linux-generic-hwe-26.04 \
     linux-image-generic linux-image-generic-hwe-24.04 linux-image-generic-hwe-26.04 \
     linux-headers-generic linux-headers-generic-hwe-24.04 linux-headers-generic-hwe-26.04
   ```

4. Install Firefox:

   ```bash
   sudo snap install firefox
   ```

5. Update Mesa:

   ```bash
   sudo snap refresh mesa-2404 --channel=latest/edge
   sudo add-apt-repository ppa:kisak/kisak-mesa
   sudo apt update && sudo apt upgrade
   ```

6. Install `ps5-linux-tools`:

   ```bash
   sudo apt install zlib1g-dev
   git clone https://github.com/ps5-linux/ps5-linux-tools
   cd ps5-linux-tools
   make
   ```

7. Install the internal Wi-Fi driver:

   ```bash
   git clone https://github.com/ps5-linux/ps5-linux-mwifiex
   cd ps5-linux-mwifiex
   sudo ./install.sh
   ```

8. Optional: turn on the fan and CPU/GPU boost with `ps5_control`, see [GPU boost](/hardware/gpu#boost).

## Where to go next

- [Move Linux to an M.2 SSD](/installation/m2-install)
- [Set up your display](/using-linux/display) and [audio](/using-linux/audio)
- [Get the best gaming performance](/using-linux/gaming-performance)
