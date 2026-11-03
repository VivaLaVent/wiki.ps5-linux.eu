---
title: "After installing: other images"
sidebar_label: Other images
sidebar_position: 2
description: What the official images and self-built installs need set up by hand that PS5 Bazzite Deck does for you.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# After installing: other images

:::note[Not for PS5 Bazzite Deck]
PS5 Bazzite Deck sets all of this up. Its users can skip this page.
:::

Do these after [All distros](/post-install/all-distros). Package-manager commands for your distro are on [Distro notes](/post-install/distro-notes).

## 1. Update the kernel

The official release images run an older kernel than the current packages. Add the [package repository](/advanced/package-repository) once, then update the kernel with your package manager. On self-built installs, see [Kernel setup](/advanced/kernel).

## 2. Fan and boost

Upstream kernels don't run the fan or the CPU boost by themselves. [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) adds both as services:

```bash
git clone https://github.com/ps5-linux/ps5-linux-tools
cd ps5-linux-tools
sudo ./install.sh
```

`install.sh` builds `ps5_control`, installs it to `/usr/local/sbin/ps5_control`, and enables two services:

| Service | Runs | Does |
| --- | --- | --- |
| `ps5fan.service` | `ps5_control --fan on` | Fan control through the console's thermal controller |
| `ps5boost.service` | `ps5_control --boost on` | Boost mode for the CPU and GPU |

Turn either off with `sudo systemctl disable --now ps5fan.service` (or `ps5boost.service`). How the fan works is on [Fan control](/hardware/fan).

## 3. Wi-Fi and Bluetooth

- **MediaTek (most Slims, the PS5 Pro):** Wi-Fi works with the in-kernel driver in every current kernel. Bluetooth needs fixes that only PS5 Bazzite Deck carries so far.
- **Marvell IW620 (most original PS5s):** Wi-Fi needs the out-of-tree driver, which the `linux-ps5` package includes. Set it up after every kernel update you do by hand.

Details and troubleshooting: [Wi-Fi, Ethernet and Bluetooth](/hardware/wifi-bluetooth).

## 4. PS5 Pro: the GPU firmware

The Pro's GPU needs its own firmware in the initrd. The `linux-ps5` package stages it; otherwise see [PS5 Pro](/hardware/ps5-pro).
