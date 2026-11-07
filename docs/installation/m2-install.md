---
title: Install to an M.2 SSD
sidebar_label: Install to M.2
sidebar_position: 4
description: Move your Linux install to the PS5's M.2 slot for better speed and capacity.
hardware: [original, slim, pro]
applies_to: all
---

# Install to an M.2 SSD

An NVMe drive in the console's M.2 slot gives Linux a fast, large home. It needs a firmware with M.2 support (every version except the oldest, see [Supported firmware](/getting-started/prerequisites#firmware)), and while Linux lives on the drive the PS5 OS can't use it for games.

Before you buy a drive, read [M.2 drives](/getting-started/drives#m2-drives): only NVMe drives work, and Gen3 drives need an [unlock](/getting-started/drives#gen3-nvme-unlock).

:::note[PS5 Bazzite Deck]
PS5 Bazzite Deck moves the running system with its own command, bootc and Legacy alike. Follow [its own M.2 steps](/installation/m2-install#ps5-bazzite-deck) instead.
:::

## 1. Install the drive

Install the M.2 drive following [Sony's official guide](https://www.playstation.com/en-us/support/hardware/ps5-install-m2-ssd). If it was previously used for games, format it first: **Settings → Storage → M.2 SSD Storage**.

## 2. Initialise the drive from Linux

Boot Linux from USB as usual, then run:

```bash
cd ps5-linux-tools
sudo ./m2_init
sudo reboot
```

Should the PS5 OS ask to format the drive again after that reboot, say so on [Discord](https://discord.gg/ps5linux) with the drive's model and size: that combination hasn't been seen before.

## 3. Install the Linux image onto the drive

```bash
cd ps5-linux-tools
chmod +x ./m2_install.sh
sudo ./m2_install.sh --install /path/to/ps5-ubuntu2604.img
```

## 4. Boot from the drive

```bash
cd ps5-linux-tools
chmod +x ./m2_exec.sh
sudo ./m2_exec.sh
```

To boot from M.2 every time, edit `/boot/efi/cmdline.txt` and change `root=LABEL=ubuntu2604` to `root=LABEL=ubuntu2604-m2`.

:::note
The USB drive stays in the console: the loader reads the kernel from its FAT32 partition at every boot.
:::

:::warning[Kernel updates on M.2]
A kernel update on an M.2 install has left some users with a black screen or a kernel that doesn't match its modules. Read [Error messages](/troubleshooting/error-messages#kernel-update-breaks-m2-boot) before you update.
:::

## Switching distros

There is no need to format the drive from the PS5 OS again. The PS5's format only rewrites the blocks it uses itself and leaves the Linux partition as it is. To change distro, format the Linux partition from Linux (`sudo mkfs.ext4 /dev/nvme0n1p1`, the partition `m2_init` created) and install the new image.

## No 64 GB USB drive?

A USB drive too small for the full image can still get you onto the M.2: the community script at [github.com/g4caos/ps5-linux-script](https://github.com/g4caos/ps5-linux-script) copies the running Linux system to the M.2 drive with rsync, so no image file is needed on the USB side.

## PS5 Bazzite Deck on the M.2 {#ps5-bazzite-deck}

PS5 Bazzite Deck moves the system you are running onto the M.2, bootc and Legacy alike, with its own command. Nothing is reinstalled: your games, settings and files come along. The USB drive stays plugged in, because the loader always starts Linux from its boot partition (on bootc, the drive also keeps `/boot`, which holds the kernels of all installed versions).

All steps run on the PS5, started from the USB drive, in a terminal (password `ps5`).

1. **Prepare the M.2 for Linux,** once. Bazzite has everything needed to build [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools):

   ```bash
   git clone https://github.com/ps5-linux/ps5-linux-tools ~/ps5-linux-tools && make -C ~/ps5-linux-tools
   cd ~/ps5-linux-tools && sudo ./m2_init && sudo reboot
   ```

   Start with the loader again after the restart.

2. **Move the system:**

   ```bash
   sudo ps5-m2-install
   ```

   It shows what it copies and asks you to type `yes`; everything on the M.2's Linux partition is erased. The copy takes 10 to 30 minutes and shows its progress. At the end it checks that `cmdline.txt` (and on bootc every boot entry) starts the M.2.

   On v2.5.1 and older, which don't have the command yet, or ship a version that stops with `would change RO state`, run the current one straight from the repository instead:

   ```bash
   curl -fsSLo /tmp/ps5-m2-install https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/ps5-m2-install.sh && sudo bash /tmp/ps5-m2-install
   ```

   For `--back` later, run the same with `--back` at the end.

3. **Power off and start with the loader.** The system now starts from the M.2. The first start can show a grey or black screen: power off once more and use the loader again.

To go back to the USB system: `sudo ps5-m2-install --back` (or the download line above with `--back`), then power off and start with the loader. The copy on the M.2 stays; running `sudo ps5-m2-install` again from the USB system replaces it.

**Updates work as before:** on bootc with `sudo bootc upgrade`, on Legacy with the update command from the release notes. Keep the USB drive plugged in for both.

## Next steps

- [After installing](/post-install/all-distros)
- [Drives and USB ports](/getting-started/drives#m2-ssds): which M.2 drives work
