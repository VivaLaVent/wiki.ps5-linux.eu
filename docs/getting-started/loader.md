---
title: Get a PS5 Linux loader
sidebar_label: Get a Linux loader
sidebar_position: 3
description: Which Linux loader to use on the PS5, where to download it, and what it does on the Slim and the Pro.
hardware: [original, slim, pro]
applies_to: all
---

# Get a PS5 Linux loader

The Linux loader is the payload that boots Linux after the jailbreak. It supports the firmware versions listed under [Firmware](/getting-started/prerequisites#firmware).

## Which loader {#which-loader}

Download it now, together with your image.

| Loader | For |
| --- | --- |
| **bazzite-bootc-loader**, on every [PS5 Bazzite Deck release](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) since v2.5 | The official loader built from `main` for each release, plus support for the boot entries of PS5 Bazzite Deck's bootc form. Needed for bootc; starts every other image like the official loader. |
| [rmuxwashere/ps5-linux-loader](https://github.com/rmuxwashere/ps5-linux-loader/releases) | Fork that PS5 Bazzite Deck was tested with up to v1.8.9. Its newer-firmware and Pro fixes have been sent upstream; it doesn't dump the Pro's GPU firmware. |

Download `bazzite-bootc-loader-vX.Y.elf` and its `.sha256` file from the same release as your image. On a PS5 Pro, it also dumps the Pro's GPU firmware, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

## PS5 Slim and PS5 Pro

The Slim runs the same firmware versions as the original PS5 and is supported on all of them. The Pro shipped with newer firmware, so its list starts later; bazzite-bootc-loader supports it. The Pro's GPU firmware is dumped by the loader on the versions it has offsets for, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

## Next steps

**[Choose your image](/getting-started/which-image)**.
