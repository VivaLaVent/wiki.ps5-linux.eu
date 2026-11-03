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

Before you buy a drive, read [M.2 drives](/hardware/storage#m2-drives): only NVMe drives work, and Gen3 drives need an [unlock](/hardware/storage#gen3-nvme-unlock).

:::note[PS5 Bazzite Deck]
Bazzite mounts the boot partition somewhere else and uses different labels. Follow [its own M.2 steps](/installation/m2-install#ps5-bazzite-deck) instead.
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
A kernel update on an M.2 install has left some users with a black screen or a kernel that doesn't match its modules. Read [Known issues](/troubleshooting/known-issues#kernel-update-breaks-m2-boot) before you update.
:::

## Switching distros

There is no need to format the drive from the PS5 OS again. The PS5's format only rewrites the blocks it uses itself and leaves the Linux partition as it is. To change distro, format the Linux partition from Linux (`sudo mkfs.ext4 /dev/nvme0n1p1`, the partition `m2_init` created) and install the new image.

## No 64 GB USB drive?

A USB drive too small for the full image can still get you onto the M.2: the community script at [github.com/g4caos/ps5-linux-script](https://github.com/g4caos/ps5-linux-script) copies the running Linux system to the M.2 drive with rsync, so no image file is needed on the USB side.

## PS5 Bazzite Deck on the M.2 {#ps5-bazzite-deck}


The USB drive stays required: the loader always starts the kernel from its small FAT32 partition. The M.2 holds the system. Install the **same version** on the M.2 as on the USB drive.

All steps run on the PS5, booted from the USB drive, in a terminal (password `ps5`).

1. **Get the tools.** Bazzite has everything needed to build [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools). If the M.2 isn't prepared for Linux yet, run `m2_init` first (see [Install to M.2](/installation/m2-install#2-initialise-the-drive-from-linux)).

   ```bash
   git clone https://github.com/ps5-linux/ps5-linux-tools ~/ps5-linux-tools && make -C ~/ps5-linux-tools
   ```

2. **Install.** `m2_install.sh` looks for the boot partition at `/boot/efi`, but Bazzite mounts it at `/efi`, so mount it at `/boot/efi` too:

   ```bash
   sudo mkdir -p /boot/efi && (mountpoint -q /boot/efi || sudo mount LABEL=boot /boot/efi)
   cd ~/ps5-linux-tools && sudo ./m2_install.sh --install /path/to/ps5-bazzite-deck.img
   ```

   - Use the extracted `.img` file, not the `.7z` files.
   - Keep the `.img` file **on the USB system** (for example in `~/Downloads`), **not on the M.2**: the M.2 is wiped during the install.
   - Tip: type the command up to `--install ` (with the space), then drag the `.img` file from the file manager into the terminal to insert its path.
   - **What you'll see:** `Formatting /dev/nvme0n1p1 …`, then `Copying files to M.2...`, and then **nothing for 10–30 minutes** while the system is copied (there is no progress bar). Wait for `Installation complete.`
   - **It asks for the password and then ends without any output:** `/boot/efi` isn't mounted, or it is mounted several times (from running the `mount` line more than once). Reset it to a single mount and run the install again:

     ```bash
     while mountpoint -q /boot/efi; do sudo umount /boot/efi; done; sudo mount LABEL=boot /boot/efi
     ```

   - `/dev/nvme0n1p1 not found`: the M.2 isn't prepared for Linux yet, see step 1.

3. **Boot from the M.2 from now on** by pointing `cmdline.txt` at it:

   ```bash
   E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo sed -i 's/root=LABEL=bazzite-deck /root=LABEL=bazzite-deck-m2 /' $E/cmdline.txt && sudo cat $E/cmdline.txt
   ```

4. **Start it:** reboot (`sudo reboot`) and run the loader as usual. It now starts the system on the M.2. You can also switch right away with `cd ~/ps5-linux-tools && sudo ./m2_exec.sh`; if it says `kexec` isn't found, reboot instead.

To go back to the USB system, change `bazzite-deck-m2` back to `bazzite-deck` in `cmdline.txt`.

**Notes:**

- The first start from the M.2 can show a grey or black screen: reboot once and run the loader again.
- **The USB drive afterwards:** keep its small FAT32 partition (label `boot`). The loader always starts Linux from there, and updates put the new kernel there. The large Linux partition on the USB drive is now only a fallback. You can reformat that partition (only that one, not the whole drive) for storage, but then you can't switch back to the USB system any more.
- **Updating:** run the in-place update while booted from the M.2, with the USB drive plugged in. The update script finds the USB drive's boot partition by itself. A loader that takes `bzImage` and `initrd.img` from anywhere other than that partition starts the old kernel with the new modules: no network, and `disagrees about version of symbol` in the log. See [Known issues](/troubleshooting/known-issues#kernel-update-breaks-m2-boot).
- **Stuck in emergency mode when booting from the M.2:** its `/etc/fstab` may contain a boot partition line with an empty `UUID=`. Boot from USB, mount the M.2 with `sudo mount LABEL=bazzite-deck-m2 /mnt`, and replace that line in `/mnt/etc/fstab` with:

  ```text
  LABEL=boot /efi vfat defaults,nofail 0 2
  ```

## Next steps

- [After installing](/post-install/all-distros)
- [Storage](/hardware/storage#m2-ssds): which M.2 drives work
