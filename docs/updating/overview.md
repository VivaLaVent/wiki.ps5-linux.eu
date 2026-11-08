---
title: Updating
sidebar_label: Updating
slug: /updating
sidebar_position: 1
description: "How PS5 Linux is updated: the system and its kernel, and separately the loader. Then the steps for PS5 Bazzite Deck and for the other images."
hardware: [original, slim, pro]
applies_to: all
---

# Updating

An update has two parts that come from different places:

- **The system and its PS5 kernel.** They live on your drive and update from Linux: PS5 Bazzite Deck as one image, the other images through their package manager and the PS5 kernel packages.
- **The loader.** The `.elf` you send from the PS5 isn't part of any update. Replace it only when your image's release notes or the [loader page](/getting-started/loader) say so.

How to update depends on your image:

- **[PS5 Bazzite Deck](/updating/bazzite-deck):** one command, Stable or Beta, rolling back.
- **[Other images](/updating/other-images):** the kernel, the distro, and going back to an earlier kernel.
