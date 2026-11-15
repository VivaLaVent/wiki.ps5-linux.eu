---
title: "Install to the M.2: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: Move a running PS5 Bazzite Deck system to the PS5's M.2 SSD with ps5-m2-install, and back.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Install to the M.2: PS5 Bazzite Deck

PS5 Bazzite Deck moves the system you are running onto the M.2. Nothing is reinstalled: your games, settings and files come along, and the system starts exactly as you left it. The USB drive also keeps `/boot`, which holds the kernels of all installed versions.

First [install the drive and run `m2_init`](/installation/m2-install). Only `m2_init` from ps5-linux-tools: its `install.sh` adds a fan and CPU control beside PS5 Bazzite Deck's own. Then, on the PS5 in a terminal (password `ps5`):

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

**Updates work as before,** with `sudo bootc upgrade`. Keep the USB drive plugged in for them.

## Starting without the USB drive (experimental) {#usb-free}

With the system on the M.2, the loader can also take its files from the PS5's own storage, so no USB drive is needed for a normal start. It is still being tested: keep the USB drive, it is the way back in.

1. **Move `/boot` to the M.2 as well.** Started from the USB drive as usual:

   ```bash
   sudo ps5-m2-install --boot
   ```

   Power off and start with the loader, USB drive still plugged in. `findmnt -no SOURCE /boot` now shows an `nvme` partition. **Do not skip this step:** without it Linux starts and then stops in emergency mode, because `/boot` is still on the drive you unplugged.

2. **Copy the loader's files to the PS5's storage.** In the PS5 system, with an FTP payload: `bzImage`, `initrd.img`, `cmdline.txt` and `vram.txt` from the USB drive's `boot` partition go into `/data/PS5/Linux/`. A PC reads that partition directly.

3. **Start with `bazzite-bootc-loader` v2.13 or newer, without the USB drive.** Older loaders don't hand Linux the Wi-Fi firmware, Bluetooth pairings and PS5 Pro GPU firmware in this setup.

**Updating:** the files in `/data/PS5/Linux/` belong to the version you copied them from. Start once with the USB drive plugged in, run `sudo bootc upgrade`, power off, and copy the four files again (step 2). Starting the old files against an updated system ends in an emergency shell.

| Problem | Do this |
| --- | --- |
| Emergency mode, "the root account is locked" or a shell | Step 1 was skipped, or the files are from before an update. Plug the USB drive in and start with it: that always works. Then do step 1, or copy the files again |
| "Couldn't find specified OSTree root" | The files in `/data/PS5/Linux/` are older than the system. Start with the USB drive and copy them again |
| No Wi-Fi or no controller pairing without the USB drive | The loader is older than v2.13 |
