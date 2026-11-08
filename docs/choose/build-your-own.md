---
title: Build your own image
sidebar_label: Build your own
sidebar_position: 3
description: Build an official image, PS5 Bazzite Deck or only the PS5 kernel yourself from current sources, and what each needs.
hardware: [original, slim, pro]
applies_to: all
---

# Build your own image

Every image is a normal distro plus the same PS5 parts: a patched kernel on the boot partition, the Wi-Fi driver and a few services. You can build any of them yourself from current sources:

| What | Build it when | Needs |
| --- | --- | --- |
| [An official image](/choose/build-other-images#official-image) | You want a distro the release doesn't have yet, or a newer kernel than the release images | Docker, about 30 GB free |
| [PS5 Bazzite Deck](/choose/image-build) | You change the image or its patches | Docker, Podman, about 60 GB free |
| [Only the kernel](/choose/build-other-images#only-the-kernel) | You already run Linux on the PS5 and want a newer or patched kernel | The distro's kernel build tools, on the PS5 or a PC |

The kernel is the part that differs between images. The steps are on two pages:

- **[PS5 Bazzite Deck](/choose/image-build):** its kernel config, patch order and bootc image.
- **[Other images](/choose/build-other-images):** the official builder, a kernel on its own, and [Kernel sources and patches](/choose/kernel-sources) for how a PS5 kernel is put together.

## Next steps

**[Flash the image to USB](/installation/flash)**, then start Linux and work through the first boot.
