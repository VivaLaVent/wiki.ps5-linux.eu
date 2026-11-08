---
title: Get a PS5 Linux loader
sidebar_label: Get a Linux loader
sidebar_position: 5
description: Which Linux loader to use on the PS5, where to download it, and what it does on the Slim and the Pro.
hardware: [original, slim, pro]
applies_to: all
---

# Get a PS5 Linux loader

The Linux loader is the payload that boots Linux after the jailbreak. It supports the firmware versions listed under [Firmware](/getting-started/prerequisites#firmware).

## Which loader {#which-loader}

All three start Linux from the USB drive the same way: they read `bzImage`, `initrd.img`, `cmdline.txt` and `vram.txt` from its FAT32 partition. They differ in the firmware versions they support and in whether they dump the PS5 Pro's GPU firmware.

| Loader | What it is | Pick it when |
| --- | --- | --- |
| **bazzite-bootc-loader**, on every [PS5 Bazzite Deck release](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) | From v2.6.1: soniciso1's loader below, built for each release, plus `path-override.txt` for `cmdline.txt` and `vram.txt` (used for a [manual rollback](/updating/bootc#rolling-back)). Up to v2.5.1 it was built from the official loader. | You run PS5 Bazzite Deck. It starts every other image too. |
| [soniciso1/ps5-linux-loader](https://github.com/soniciso1/ps5-linux-loader/releases) | The official loader plus offsets for more firmware versions, including the Pro's GPU firmware dump on most Pro firmware versions, see [GPU firmware](/troubleshooting/ps5-pro#gpu-firmware). | Any other image, especially on a PS5 Pro. |
| [rmuxwashere/ps5-linux-loader](https://github.com/rmuxwashere/ps5-linux-loader/releases) | An earlier fork of the official loader; its fixes have gone upstream. It doesn't dump the Pro's GPU firmware. | Only if a newer loader doesn't start on your console. |

Download the `.elf` and its `.sha256` file. For PS5 Bazzite Deck, take `bazzite-bootc-loader-vX.Y.elf` from the same release as your image.

:::tip[PS5 Pro]
Without the GPU firmware dump, the Pro runs as a base PS5 with 36 compute units instead of 60. The dump depends on the Pro's firmware version, see [PS5 Pro](/troubleshooting/ps5-pro#gpu-firmware).
:::

## Next steps

**[Choose your image](/getting-started/which-image)**.
