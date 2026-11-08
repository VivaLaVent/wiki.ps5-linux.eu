---
title: "Install to the M.2: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: Move a running PS5 Bazzite Deck system to the PS5's M.2 SSD with ps5-m2-install, and back.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Install to the M.2: PS5 Bazzite Deck

PS5 Bazzite Deck moves the system you are running onto the M.2, bootc and Legacy alike. Nothing is reinstalled: your games, settings and files come along, and the system starts exactly as you left it. On bootc the USB drive also keeps `/boot`, which holds the kernels of all installed versions.

First do [steps 1 and 2](/installation/m2-install) (install the drive and run `m2_init`). Then, on the PS5 in a terminal (password `ps5`):

1. **Move the system:**

   ```bash
   sudo ps5-m2-install
   ```

   It shows what it copies and asks you to type `yes`; everything on the M.2's Linux partition is erased. The copy takes 10 to 30 minutes and shows its progress. At the end it checks that `cmdline.txt` (and on bootc every boot entry) starts the M.2.

   On v2.5.1 and older, which don't have the command yet, or ship a version that stops with `would change RO state`, run the current one straight from the repository instead:

   ```bash
   curl -fsSLo /tmp/ps5-m2-install https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/ps5-m2-install.sh && sudo bash /tmp/ps5-m2-install
   ```

   For `--back` later, run the same with `--back` at the end.

2. **Power off and start with the loader.** The system now starts from the M.2: `findmnt /` shows an `nvme` partition as its source. The first start can show a grey or black screen: power off once more and use the loader again.

To go back to the USB system: `sudo ps5-m2-install --back` (or the download line above with `--back`), then power off and start with the loader. The copy on the M.2 stays; running `sudo ps5-m2-install` again from the USB system replaces it.

**Updates work as before:** on bootc with `sudo bootc upgrade`, on Legacy with the update command from the release notes. Keep the USB drive plugged in for both.
