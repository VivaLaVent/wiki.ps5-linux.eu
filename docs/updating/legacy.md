---
title: "Switching from Legacy to bootc"
sidebar_label: Legacy (ended)
sidebar_position: 2
description: "Legacy PS5 Bazzite Deck installs are no longer supported or updated. Switch to bootc in place, keeping your games, or flash the bootc image."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Switching from Legacy to bootc

Legacy installs, the PS5 Bazzite Deck installs from before v2.5, are no longer supported or updated from v2.13 on. `ps5-report` shows `legacy` on its **Install** line on one. Switch to bootc one of two ways.

## In place, keeping your games {#in-place}

The script sets the Stable bootc system up beside the Legacy one on the same drive. Users, passwords, home folders (Steam library included), Flatpaks, saved networks and Bluetooth pairings come along.

On the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`), with at least 30 GB free on the system drive:

```bash
curl -fsSLO https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/legacy-to-bootc.sh
sudo bash legacy-to-bootc.sh            # checks only, changes nothing
sudo bash legacy-to-bootc.sh --apply    # downloads the Stable image (about 7 GB) and sets it up
```

Then:

1. Power off and start with `bazzite-bootc-loader` from the [latest release](https://github.com/VivaLaVent/ps5-bazzite-deck/releases/latest), not an older loader. The first start moves your home folders and Flatpaks over.
2. Check that everything is there. `ps5-report` now shows `bootc` on its Install line.
3. Free the space of the old system, about 20 GB, once you're sure:

```bash
sudo bash legacy-to-bootc.sh --cleanup
```

| Situation | Do this |
| --- | --- |
| bootc doesn't start | On a PC, copy `bzImage`, `initrd.img` and `cmdline.txt` from `legacy-backup` on the drive's `boot` partition back to its top folder. Legacy starts again as before |
| You changed your mind before the first bootc start | `sudo bash legacy-to-bootc.sh --undo` on the Legacy system |
| The check says there isn't enough space | Free space or [flash](#flash) instead. The Legacy files are only deleted by `--cleanup`, so both systems are on the drive for a while |
| Decky Loader or a package you installed into the system is gone | Install it again. Options you added to `cmdline.txt` are kept |

Nothing of the Legacy system is deleted before `--cleanup`. The script is new: make a backup of anything you can't replace before `--apply`.

## By flashing {#flash}

Flash the bootc image to a drive, see [Flash the image](/installation/flash). This erases the drive: use a second one, or copy off what you want to keep first.

## After the switch

Updates come with `sudo bootc upgrade`, see [Updating: bootc](/updating/bootc).
