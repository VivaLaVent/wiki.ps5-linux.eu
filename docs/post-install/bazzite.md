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

<<<<<<< ours
Updating, Stable or Beta, which version runs and rolling back are on [Updating: PS5 Bazzite Deck](/updating/bazzite-deck).
=======
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
2. **Power off** (not restart), then start with the loader as usual. With [warm reboots](/post-install/warm-reboot#ps5-bazzite-deck) on, a restart would skip the loader. Any loader starts the version you rolled back to, because it is already in place on the boot partition; use bazzite-bootc-loader from your release anyway, so the manual rollback below works with the same loader.
3. Check which version runs:

   ```bash
   sudo rpm-ostree status
   sed -n 's/^deck=//p' /usr/share/ps5-bazzite-bootc/VERSION
   ```

Running `sudo bootc rollback` again, then powering off, takes you forward to the newer version.

The loader doesn't need to know about rollbacks: at every shutdown, `ps5-bootc-sync` puts the version that starts next on the boot partition as `bzImage`, `initrd.img` and `cmdline.txt`, and keeps the previous version's kernel under `ostree/<id>/`. `ROLLBACK.txt` on the boot partition names both, and describes how to start the previous version from a PC if a new version doesn't start at all. That manual rollback **needs bazzite-bootc-loader**: it uses `path-override.txt`, and only this loader applies it to `cmdline.txt` and `vram.txt` as well as to the kernel and initrd. Another loader would start the previous kernel with the new version's `cmdline.txt`.
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs

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
<<<<<<< ours
| `ps5-perf` | CPU boost and Wi-Fi power saving; `ps5-perf status` shows the boost and the fan mode. The fan runs on the console's own control with Sony's target, see [Fan control](/troubleshooting/fan); v2.7.2 and v2.7.3 also set a target with `ps5-perf fan`, v2.6.1 to v2.7.1 used 80 °C. |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Off by default, `on`/`off`/`status`, see [Warm reboots](/post-install/warm-reboot-bazzite-deck). |
| `ps5-bt-address` | `on`: Linux gets its own Bluetooth address and pairings (default on the original PS5 and the Pro). `off`: Linux shares the PS5 OS's pairings through the loader (default on the Slim), and IW620 consoles can warm reboot. `status` shows which, see [One DualSense for the PS5 and Linux](/post-install/dualsense-bazzite-deck). |

The image runs the fan and the clocks itself. Don't use `ps5_control --fan` or `--boost` from ps5-linux-tools on it: they go around the kernel's fan driver and GPU clock governor. Use `ps5-perf` or [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) instead.
=======
| `ps5-perf` | CPU boost and the fan target (the console's firmware control, 80 °C by default). `ps5-perf status` shows the fan mode and speed, see [Fan control](/troubleshooting/fan). |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Off by default, `on`/`off`/`status`, see [Warm reboots](/post-install/warm-reboot#ps5-bazzite-deck). |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default. `status`, `on`, `off`. |
>>>>>>> theirs

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
- [DualSense](/post-install/dualsense-bazzite-deck): one controller for the PS5 system and Linux
- [Troubleshooting](/troubleshooting/getting-help)
