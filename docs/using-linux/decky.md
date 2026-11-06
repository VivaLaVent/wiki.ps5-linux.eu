---
title: Decky Loader
sidebar_position: 9
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
| **Fan** | Live temperatures, a fan curve or a target temperature, presets, and a thermal guard that switches to full speed when the CPU gets too hot. See [Fan control](/hardware/fan#hwcon). |
| **CPU** | Governor and a fixed clock. |
| **GPU** | Governor and a fixed clock, the [CU unlock](/hardware/gpu#40-cu-unlock), and **GPU Memory**: `vram.txt` and the GTT limit (`ttm.pages_limit`). |
| **LED** | Light bar presets. |

Each tab has **Restore on Startup**, which applies your settings again at every start; without it, the console's defaults come back after a restart.

Changes to VRAM, the GTT limit and the CU unlock edit `vram.txt` and `cmdline.txt` on the USB drive's boot partition, so they need a restart with the loader. PS5 Bazzite Deck sets 6 GB of VRAM by default from v2.6; the plugin's VRAM setting replaces it.

The same controls exist for Desktop Mode as an app, [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui), which doesn't need Decky. `ps5-perf` sets the CPU boost and fan target too: whichever was set last applies.

## When Game Mode doesn't start after installing a plugin

Remove the plugin from Desktop Mode: delete its folder under `~/homebrew/plugins/`, then switch to Game Mode again. If that isn't enough, `ujust setup-decky uninstall` removes Decky completely.

## Next steps

- [Fan control](/hardware/fan): what the fan modes do
- [VRAM](/hardware/gpu#vram): how much dedicated memory to give the GPU
- [Troubleshooting & help](/troubleshooting/getting-help)
