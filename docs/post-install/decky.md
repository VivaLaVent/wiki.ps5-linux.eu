---
title: Decky Loader
sidebar_position: 1
description: Install Decky Loader on PS5 Bazzite Deck and use the PS5 Hardware Control plugin for the fan, clocks, LED and VRAM.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Decky Loader

[Decky Loader](https://decky.xyz) adds plugins to Steam's Game Mode. They open from the quick access menu (the **...** button), next to Steam's own performance and settings pages. It is community-made and not part of PS5 Bazzite Deck, and each plugin is its own project.

## Install

On the PS5 in Desktop Mode, open a terminal (Konsole) and run:

```bash
ujust setup-decky install
```

Enter your password (`ps5` unless you changed it). Switch to Game Mode: a plug icon appears at the bottom of the quick access menu. `ujust setup-decky status` shows whether it is installed, and `ujust setup-decky uninstall` removes it again.

## Install a plugin

Most plugins come from the store: quick access menu → plug icon → the shop icon at the top. Plugins that aren't in the store install from a URL:

1. Quick access menu → plug icon → the gear icon.
2. Under **General**, turn on **Developer mode**.
3. Open **Developer** → **Install Plugin from URL**, enter the plugin's release URL and choose **Install**.

## PS5 Hardware Control {#ps5-hardware-control}

NotHavocc's [ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin) sets the PS5's own hardware from Game Mode. Install it from this URL (it always points to the newest release):

```text
https://github.com/NotHavocc/ps5-hwcon-plugin/releases/latest/download/ps5-hwcon-plugin.zip
```

| Tab | What it does |
| --- | --- |
| **Fan** | Live temperatures, a fan curve or a target temperature, presets, and a thermal guard that switches to full speed when the CPU gets too hot. See [Fan control](/troubleshooting/fan#hwcon). |
| **CPU** | Governor and a fixed clock. |
| **GPU** | Governor and a fixed clock, and the [CU unlock](/troubleshooting/gpu#40-cu-unlock). |
| **Memory** (from v1.6.0) | RAM and swap in use; **GPU Memory**: `vram.txt` and the GTT limit (`ttm.pages_limit`); **zram** on or off, its size and compression; **zswap** on or off. |
| **LED** | Light bar presets. |

Each tab has **Restore on Startup**, which applies your settings again at every start; without it, the console's defaults come back after a restart.

Changes to VRAM, the GTT limit, zram, zswap and the CU unlock need a restart, and VRAM a start with the loader (not a [warm reboot](/post-install/warm-reboot)). VRAM, the GTT limit, zswap and the CU unlock edit `vram.txt` and `cmdline.txt` on the boot partition; on PS5 Bazzite Deck they stay through updates. PS5 Bazzite Deck sets 6 GB of VRAM once from v2.6.1; the plugin's VRAM setting replaces it, and the last value written wins. zram writes `/etc/systemd/zram-generator.conf`: Bazzite already runs zram, so leave zswap off with it. How VRAM, the GTT limit and swap work together: [Memory, VRAM and swap](/post-install/all-distros#memory-and-swap).

### On the desktop

[ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) has the same tabs as an app for Desktop Mode, without Decky. From v1.4.0 it runs in the system tray instead of a background service: closing the window keeps the thermal guard and LED loops running, **Quit** in the window or the tray menu stops them, and **Start in Tray at Login** on its About page starts it with the desktop. Install or update it on the PS5, as your normal user:

```bash
curl -fsSL https://raw.githubusercontent.com/NotHavocc/ps5-hwcon-gui/main/install.sh | bash
```

It asks for your password each time it opens; `bash -s -- --passwordless` at the end of that command skips that (any program running as you can then open it as root). Use the plugin or the app for the same setting, not both at once. `ps5-perf` sets the CPU boost and fan target too: whichever was set last applies.
