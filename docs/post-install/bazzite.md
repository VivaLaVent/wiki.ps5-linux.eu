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

## Updating

Use Steam's update button (**Settings → System**) or `sudo bootc upgrade` in a terminal. The new version downloads in the background and takes over at the next start: restart, then start with **bazzite-bootc-loader**. If it gives you trouble, [roll back](#rolling-back). Releases marked **Pre-release** are test builds: Steam's **Stable** channel doesn't install them, its **Beta** channel does (**Settings → System → OS Update Channel**).

**Legacy installs** (`ps5-report` shows `legacy` on its **Install** line) update in place with the command in the release's notes, then power off and start with the loader. Switching to bootc is recommended, see [Built with bootc](/choose/bazzite-deck#built-with-bootc).

:::warning[Updating from v2.5]
On v2.5, every update fails with `Failed to start ostree-finalize-staged.service` (`Unit greenboot-set-rollback-trigger.service is masked`). Run this once on the PS5 before updating; it prints `ready to update`, and the change stays through all later updates:

```bash
sudo rm -f /etc/systemd/system/greenboot-set-rollback-trigger.service
printf '[Unit]\nDescription=No greenboot rollbacks on the PS5\n\n[Service]\nType=oneshot\nExecStart=/usr/bin/true\nRemainAfterExit=yes\n' | sudo tee /etc/systemd/system/greenboot-set-rollback-trigger.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl start ostree-finalize-staged.service && echo "ready to update"
```
:::

## Rolling back

The previous version stays on the drive after every update. To go back to it:

1. Run `sudo bootc rollback`.
2. **Power off** (not restart), then start with **bazzite-bootc-loader**. With [warm restarts](/post-install/warm-reboot#ps5-bazzite-deck) on, a restart would skip the loader.
3. Check which version runs:

   ```bash
   sudo rpm-ostree status
   sed -n 's/^deck=//p' /usr/share/ps5-bazzite-bootc/VERSION
   ```

Running `sudo bootc rollback` again, then powering off, takes you forward to the newer version.

The loader doesn't need to know about rollbacks: at every shutdown, `ps5-bootc-sync` puts the version that starts next on the boot partition as `bzImage`, `initrd.img` and `cmdline.txt`, and keeps the previous version's kernel under `ostree/<id>/`. `ROLLBACK.txt` on the boot partition names both, and describes how to start the previous version from a PC if a new version doesn't start at all.

## Game Mode and Desktop Mode {#game-mode-and-desktop-mode}

| From | To | How |
| --- | --- | --- |
| Game Mode | Desktop Mode | **Steam** button → **Power** → **Switch to Desktop** |
| Desktop Mode | Game Mode | **Return to Gaming Mode** on the desktop |
| SSH | Desktop Mode | `steamos-session-select plasma` |
| SSH | Game Mode | `steamos-session-select gamescope` |

From v2.6.1, PS5 Bazzite Deck starts in Desktop Mode. To start in Game Mode instead, change the default session in Steam's settings in Game Mode, or run `ujust set-default-game-mode` (and `ujust set-default-desktop` to go back).

On some TVs the picture doesn't come back after **Switch to Desktop**, see [Display and HDMI](/troubleshooting/display#switch-to-desktop).

## Built-in commands


| Command | What it does |
| --- | --- |
| `ps5-report` | Collects your hardware details and the relevant logs into one file for a bug report. It only reads. |
| `ps5-perf` | CPU boost and the fan target (the console's firmware control, 80 °C by default). `ps5-perf status` shows the fan mode and speed, see [Fan control](/troubleshooting/fan). |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Off by default, `on`/`off`/`status`, see [Warm restarts](/post-install/warm-reboot#ps5-bazzite-deck). |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default. `status`, `on`, `off`. |

Sleep (suspend-to-idle) is built in: a short press of the power button or Steam's **Sleep** puts the console to sleep and wakes it again. The GPU stays powered, so the saving is modest; it is not the PS5 OS's rest mode, and a DualSense can't wake the console.

## Boot options (cmdline.txt)

All options, PS5 Bazzite Deck's default line and how to edit it are on **[Boot options](/post-install/boot-options)**. The ones you're most likely to need: `amdgpu.force_1080p=1` for a picture you can't get past, `usb-storage.quirks=…` for a USB drive that disconnects, `usbc_dp.enable=1` for a USB-C display. To turn off VRR, use Steam's setting (Settings → Display). To stop the TV from turning on with the console, turn off HDMI-CEC in the TV's settings.

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
| [Updates, rollbacks and rebasing](https://docs.bazzite.gg/Installing_and_Managing_Software/Updates_Rollbacks_and_Rebasing/), `rpm-ostree`, Bazzite Updater | **Partly.** `sudo bootc upgrade`, `sudo bootc rollback`, `sudo bootc status` and `rpm-ostree kargs` work; don't rebase to Bazzite's own images, they can't start on the PS5. Legacy installs: no ("This system was not booted via libostree"). See [Updating](#updating) |
| [Installation guides](https://docs.bazzite.gg/General/Installation_Guide/) | **No.** Install from a PS5 Bazzite Deck image, see [PS5 Bazzite Deck](/choose/bazzite-deck#download-and-extract) |

PS5 Bazzite Deck is a community project, not made or supported by the Bazzite project. Ask PS5 questions on [Discord](https://discord.gg/ps5linux), not in Bazzite's channels.

## Next steps

- [Decky Loader](/post-install/decky): plugins for Game Mode, including PS5 Hardware Control
- [DualSense](/post-install/dualsense): one controller for the PS5 system and Linux
- [Troubleshooting](/troubleshooting/getting-help)
