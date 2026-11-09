---
title: "After installing: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 3
description: What to do after installing PS5 Bazzite Deck, and which parts of Bazzite's own documentation apply.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# After installing: PS5 Bazzite Deck

What only PS5 Bazzite Deck has: updates and rollbacks, its own commands, and the switch between Game Mode and Desktop Mode. The steps for every image are on [All images](/post-install/all-distros), its boot options on [Boot options](/post-install/boot-options), and its problems under [Troubleshooting](/troubleshooting/getting-help). For everything that is plain Bazzite, use **[Bazzite's documentation](https://docs.bazzite.gg/)**.

## Updating and rolling back {#updating}

Updating, Stable or Beta, which version runs and rolling back are on [Updating: PS5 Bazzite Deck](/updating/bazzite-deck).

## Game Mode and Desktop Mode {#game-mode-and-desktop-mode}

| From | To | How |
| --- | --- | --- |
| Game Mode | Desktop Mode | **Steam** button → **Power** → **Switch to Desktop** |
| Desktop Mode | Game Mode | **Return to Gaming Mode** on the desktop |
| SSH | Desktop Mode | `steamos-session-select plasma` |
| SSH | Game Mode | `steamos-session-select gamescope` |

From v2.6.1, PS5 Bazzite Deck starts in Desktop Mode. To start in Game Mode instead, turn off **Default to Desktop Mode on startup** in Steam's system settings in Game Mode, or run `ujust set-default-game-mode` (and `ujust set-default-desktop` to go back). The setting applies from the next start. If it still starts in Desktop Mode after that, report it in `#bazzite-problems` with the output of `ls -l /etc/sddm.conf.d; cat /etc/sddm.conf.d/*`.

On some TVs the picture doesn't come back after **Switch to Desktop**, see [Display and HDMI](/troubleshooting/display#switch-to-desktop).

## Built-in commands


| Command | What it does |
| --- | --- |
| `ps5-report` | Collects your hardware details and the relevant logs into one file for a bug report. It only reads. |
| `ps5-perf` | CPU boost and Wi-Fi power saving; `ps5-perf status` shows the boost and the fan mode. The fan runs on the console's own control with Sony's target, see [Fan control](/troubleshooting/fan); v2.7.2 and v2.7.3 also set a target with `ps5-perf fan`, v2.6.1 to v2.7.1 used 80 °C. |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Off by default, `on`/`off`/`status`, see [Warm reboots](/post-install/warm-reboot-bazzite-deck). |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default (off on the Slim's MediaTek chip from v2.8.1). `status`, `on`, `off`. |

The image runs the fan and the clocks itself. Don't use `ps5_control --fan` or `--boost` from ps5-linux-tools on it: they go around the kernel's fan driver and GPU clock governor. Use `ps5-perf` or [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) instead.

Sleep (suspend-to-idle) is built in: a short press of the power button or Steam's **Sleep** puts the console to sleep and wakes it again. The GPU stays powered, so the saving is modest; it is not the PS5 OS's rest mode, and a DualSense can't wake the console.

## Boot options (cmdline.txt)

PS5 Bazzite Deck's default line and how to add an option are on [Boot options: PS5 Bazzite Deck](/post-install/bazzite-boot-options), every option on [Boot options](/post-install/boot-options#options).

## 40 GPU compute units


The image supports the [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) on the original PS5 and the Slim. The setting is kept across updates. Don't use it on a PS5 Pro.

## Decky Loader and PS5 Hardware Control

[Decky Loader](/post-install/decky) adds plugins to Game Mode's quick access menu: `ujust setup-decky install` in Desktop Mode installs it. Its [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) plugin sets the fan, CPU and GPU clocks, the light bar and VRAM from Game Mode; [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) does the same on the desktop. Both are community-made and not part of the image.

## What applies from Bazzite's documentation

| Topic | Applies? |
| --- | --- |
| [Gaming](https://docs.bazzite.gg/Gaming/): launchers, launch options, common gaming issues | Yes |
| [Steam Gaming Mode quirks](https://docs.bazzite.gg/Handheld_and_HTPC_edition/quirks/) | Yes |
| [Installing software](https://docs.bazzite.gg/Installing_and_Managing_Software/): Bazaar (Flatpak), Homebrew, Distrobox, AppImage | Yes |
| [ujust commands](https://docs.bazzite.gg/Installing_and_Managing_Software/ujust/) | Mostly; skip the ones about updates and the bootloader |
| [Updates, rollbacks and rebasing](https://docs.bazzite.gg/Installing_and_Managing_Software/Updates_Rollbacks_and_Rebasing/), `rpm-ostree`, Bazzite Updater | **Partly.** `sudo bootc upgrade`, `sudo bootc rollback`, `sudo bootc status` and `rpm-ostree kargs` work. The Bazzite Updater, Steam's update button and `bazzite-rollback-helper` (`bruh`) don't; don't rebase to Bazzite's own images, they can't start on the PS5. Legacy installs: no ("This system was not booted via libostree"). See [Updating](#updating) |
| [Installation guides](https://docs.bazzite.gg/General/Installation_Guide/) | **No.** Install from a PS5 Bazzite Deck image, see [PS5 Bazzite Deck](/choose/bazzite-deck#download-and-extract) |

PS5 Bazzite Deck is a community project, not made or supported by the Bazzite project. Ask PS5 questions on [Discord](https://discord.gg/ps5linux), not in Bazzite's channels.

## Next steps

- [Decky Loader](/post-install/decky): plugins for Game Mode, including PS5 Hardware Control
- [DualSense](/post-install/dualsense): one controller for the PS5 system and Linux
- [Troubleshooting](/troubleshooting/getting-help)
