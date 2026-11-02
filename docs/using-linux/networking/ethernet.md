---
title: Ethernet
sidebar_position: 1
description: The PS5's built-in Ethernet port under Linux, using the mts driver.
---

# Ethernet

- **PCI ID:** `104d:9104`
- **Driver:** `mts` (MediaTek Star-based Gigabit Ethernet)

The internal Ethernet port works out of the box. No setup is needed after Linux boots.

## Background

The PS5's Gigabit Ethernet controller is based on the MediaTek Star Ethernet MAC (`mtk_star_emac`). The `mts` driver was written by rmuxnet, building on a base from slidybat, with extensive testing by c0w.

## Kernel config

```text
CONFIG_MTS=m
```

The ps5-linux kernel config builds the driver as a module, and it loads by itself at boot. You don't need to load it manually.

## Troubleshooting

If the interface doesn't come up after the first boot, disable and re-enable the wired connection in your network manager.

### USB Ethernet adapters keep disconnecting

Some users report that USB-C or USB-A Ethernet adapters keep dropping and reconnecting instead of staying stable. There is no fix yet. Try another adapter or cable, or use the internal port, which works on every supported firmware.

If you are buying an adapter, look for the **RTL8156B** chipset: it is confirmed to work.

### Slow speed, high CPU use and no IPv6 (fixed)

Fixed in [ps5-linux-patches #36](https://github.com/ps5-linux/ps5-linux-patches/pull/36) (commit `9322b9d`, 28 Sep 2026). Older kernels had three problems:

- **Slow:** the internal port topped out around 300 Mbps, while a USB adapter on the same line reached 940–980 Mbps.
- **A CPU core stuck at 100%:** the interrupt mask register was written with inverted polarity and interrupts were only partly acknowledged. Status bits stayed latched, the MSI stopped firing, and the driver fell back to polling every 10 ms.
- **No inbound IPv6:** the multicast filter was never programmed, so IPv6 neighbour discovery and router advertisements were dropped.

The fix brings the driver in line with Sony's own: correct mask polarity, full interrupt acknowledgement, the same interrupt moderation timer, a real multicast hash filter with promiscuous mode, and NAPI stopped before DMA on shutdown. RX drop and CRC counters now appear in `ip -s -s link`.

Measured after the fix:

- 941 Mbps TCP in each direction, 916 Mbps in both directions at once
- About 13% of one CPU core at full speed
- IPv6 gets a global address through router advertisements
- Cold boot works

:::note[In release 7.2.3 and later]
The fix is in the prebuilt kernel release **7.2.3** (1 November 2026) and later, see [Kernel setup](/advanced/kernel). On an older release kernel, update, or use a USB adapter for full gigabit speed.
:::
