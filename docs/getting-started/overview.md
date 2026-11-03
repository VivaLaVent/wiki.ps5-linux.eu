---
title: Getting started
sidebar_label: Overview
description: What you need to run Linux on a PS5 and the steps to get there.
sidebar_position: 1
---

# Getting started

Linux on the PS5 is six steps: set two console settings, pick and flash an image, jailbreak, send the loader, and finish the first boot. This page is the map; each step has its own page.

:::note[Scope of this wiki]
This wiki assumes your PS5 is **already jailbroken**. It covers everything after that: booting Linux and getting the hardware working properly.
:::

:::info[Check your firmware first]
Linux only runs on exploitable system software versions. Read [Supported firmware](./firmware.md) before you buy anything or change any settings.
:::

## What you need

**Required:**

- A PS5 on a [supported firmware](./firmware.md)
- A USB drive of **64 GB or more** (32 GB for [PS5 Bazzite Deck](/installation/bazzite-deck)); an external SSD is much faster than a flash drive
- A USB keyboard and mouse

**Optional:**

- An M.2 SSD for a dedicated Linux install (not on the oldest firmware, see [Supported firmware](./firmware.md))
- A USB Wi-Fi adapter, for internet access before the internal Wi-Fi driver is set up

## Steps

1. [Configure your PS5 settings](./prerequisites.md)
2. [Choose an image](./which-image.md): a distro of your choice, or the ready-made gaming image
3. [Get and flash the image](/installation/linux-image)
4. Jailbreak your PS5 (not covered by this wiki)
5. [Send the Linux loader payload](/installation/booting#send-the-linux-loader)
6. [First boot](/installation/first-boot), then the [Post-install checklist](/installation/post-install)

[PS5 Bazzite Deck](/installation/bazzite-deck) has its own, shorter install steps and skips most of the post-install work.

Once Linux is running, you can optionally [move it to an M.2 SSD](/installation/m2-install).
