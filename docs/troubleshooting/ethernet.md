---
title: Ethernet
sidebar_position: 6
description: The PS5's wired Ethernet port under Linux, USB Ethernet adapters, and the old driver's speed and IPv6 problems.
hardware: [original, slim, pro]
applies_to: all
---

# Ethernet

The wired port (`104d:9104`, driver `mts`) works on every PS5 kernel: plug in a cable.

## Quick answers

| Problem | Do this |
| --- | --- |
| The interface doesn't come up after the first start | Disable and re-enable the wired connection in the network settings |
| About 300 Mbps, one CPU core at 100%, or no IPv6 | An old kernel's driver: update. Current kernels do full gigabit at about 13% of one core |
| A USB Ethernet adapter connects and disconnects in a loop <a id="usb-ethernet-adapters-keep-disconnecting"></a> | That adapter's driver. Use the built-in port, or an adapter with the **RTL8156B** chipset |
