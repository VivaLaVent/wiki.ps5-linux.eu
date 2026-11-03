---
title: Ethernet
sidebar_position: 1
description: The PS5's built-in Ethernet port under Linux, using the mts driver.
---

# Ethernet

The wired port (PCI ID `104d:9104`) is handled by the `mts` driver, which every PS5 kernel builds and loads by itself. Plug in a cable and the connection is there; nothing on this page is required for a normal setup.

## Background

The controller is a MediaTek Star Ethernet MAC (`mtk_star_emac`) inside the console's Salina chip. The `mts` driver was written for the PS5 on top of an earlier community base and is part of the PS5 patch set, built as a module:

```text
CONFIG_MTS=m
```

## Troubleshooting

If the interface doesn't come up after the first boot, disable and re-enable the wired connection in your network manager.

### USB Ethernet adapters keep disconnecting

A USB Ethernet adapter that connects and disconnects in a loop is a driver problem of that adapter, not of the console, and there is no fix beyond another adapter or cable. The internal port works on every supported firmware, so use it where you can. For a new adapter, choose one with the **RTL8156B** chipset.

### Slow speed, high CPU use and no IPv6 on old kernels

Early versions of `mts` had three faults: the port topped out around 300 Mbps while a USB adapter on the same cable did full gigabit, one CPU core sat at 100%, and incoming IPv6 didn't work. All three came from the interrupt and filter setup. The interrupt mask was written with the wrong polarity and interrupts were only partly acknowledged, so the status bits stayed set, the MSI stopped firing and the driver fell back to polling every 10 ms; and the multicast filter was never programmed, so neighbour discovery and router advertisements were dropped.

The current driver matches what Sony's own does: correct mask polarity, full interrupt acknowledgement, the same interrupt moderation timer, a hash-based multicast filter with promiscuous mode, and NAPI stopped before DMA on shutdown. It does full gigabit in both directions at around 13% of one core, gets a global IPv6 address through router advertisements, and shows RX drop and CRC counters in `ip -s -s link`.

:::note[Which kernels have it]
Every current kernel: the upstream packages, rmuxnet's kernel and PS5 Bazzite Deck, see [Kernel setup](/advanced/kernel). On an old kernel, update, or use a USB adapter for full gigabit speed.
:::
