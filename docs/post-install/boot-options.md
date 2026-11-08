---
title: "Boot options: cmdline.txt and vram.txt"
sidebar_label: Boot options
sidebar_position: 4
description: How to edit the PS5's cmdline.txt and vram.txt on the PS5 or from a PC, and what the default line holds. The options themselves are listed per image.
hardware: [original, slim, pro]
applies_to: all
---

# Boot options: cmdline.txt and vram.txt

Two small files on the USB drive's FAT32 boot partition control how Linux starts: `cmdline.txt` holds the kernel parameters, `vram.txt` the GPU's dedicated memory. This page shows how to edit both on every image; the options themselves differ per image:

- **[PS5 Bazzite Deck](/post-install/bazzite-boot-options)**: its default line, the bootc way to add options, and every option it has.
- **[Other images](/post-install/other-boot-options)**: the official images and self-built installs, with which kernel has which option.

## Edit cmdline.txt {#edit-cmdlinetxt}

`cmdline.txt` must stay **one single line**. Add an option at the end with a space in front of it; delete it the same way.

- **On the PS5, in Linux:** the boot partition is mounted at `/boot/efi` on most images (`/efi` on Legacy PS5 Bazzite Deck installs; on bootc use [its own way](/post-install/bazzite-boot-options#edit)) and belongs to root, so a file manager can show it but not save to it. Open a terminal (on PS5 Bazzite Deck: Desktop Mode → **Konsole**); these commands find the partition by themselves:

  ```bash
  E=$(for d in /efi /boot/efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
  sudo cat $E/cmdline.txt                                                  # show
  sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt      # add an option
  sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt                 # remove it again
  ```

Changes take effect at the next start with the loader.

### From a PC {#edit-from-a-pc}

Plug the USB drive into a PC and edit `cmdline.txt` on its small FAT32 boot partition. On Linux, mount that partition and edit the file. On Windows, the partition gets no drive letter, and File Explorer refuses to open it even when it has one (on the bootc form it is an EFI system partition). Give it a letter with `diskpart`, then edit it with Notepad from the same administrator prompt.

:::warning[Windows offers to format the drive]
When you plug in a Linux drive, Windows may ask to format a disk it can't read. Always choose **Cancel**: formatting erases the Linux install.
:::

#### With diskpart and Notepad

1. **Open diskpart.** Start → type `cmd` → **Run as administrator**, then:

   ```text
   diskpart
   list disk
   ```

2. **Select the USB drive.** Find it in the list by its size, and use its number in place of `<n>`:

   ```text
   select disk <n>
   list partition
   ```

   Check the size twice: selecting the wrong disk gives the letter to a partition of your PC's own drive.

3. **Give the boot partition a letter.** It is the small partition of a few hundred MB, often listed as **System**. Use its number in place of `<n>`:

   ```text
   select partition <n>
   assign letter=P
   exit
   ```

4. **Edit cmdline.txt.** In the same administrator Command Prompt, run `notepad P:\cmdline.txt`. Notepad started from there runs as administrator and can save the file. Keep the file on **one single line**, add or remove the option, and save. To browse the partition instead, [Explorer++](https://explorerplusplus.com/) started with **Run as administrator** opens `P:\`.

5. **Remove the letter again** before you unplug the drive. In an administrator Command Prompt:

   ```text
   diskpart
   select volume P
   remove letter=P
   exit
   ```

#### With WSL

Attach the drive to WSL, then edit the file from Linux.

```powershell
# In PowerShell as administrator: find the drive number
Get-CimInstance -Query "SELECT * from Win32_DiskDrive"

# Attach partition 1 of that drive to WSL
wsl --mount \\.\PHYSICALDRIVE1 --partition 1 --type vfat
```

```bash
# Then, inside WSL
ls /mnt/wsl/PHYSICALDRIVE1p1/
nano /mnt/wsl/PHYSICALDRIVE1p1/cmdline.txt
```

## What the default line holds {#the-default-line}

The exact line is on the page for your image ([PS5 Bazzite Deck](/post-install/bazzite-boot-options#the-default-line), [other images](/post-install/other-boot-options#the-default-line)). What its common parts mean:

- `root=LABEL=…`: the partition Linux starts from; an [M.2 install](/installation/m2-install) changes it.
- `console=ttyTitania0`: the console's serial port, under Sony's name for it. Only matters when you debug over a serial cable.
- `mitigations=off`: the CPU vulnerability mitigations are off for speed. `mitigations=auto` turns them back on.
- `idle=halt`: try removing it if you notice micro-stuttering, see [GPU](/troubleshooting/gpu#performance-tips).

## vram.txt {#vram}

`vram.txt` sets the GPU's dedicated memory. The loader's default is 512 MB, and the GPU borrows more from system memory as needed; PS5 Bazzite Deck sets 6 GB from v2.6.1. The value is a **hexadecimal byte count**, not megabytes: see [VRAM](/troubleshooting/gpu#vram) for the format and a table of sizes. A large fixed value takes that memory away from the system; memory-hungry games (on the Pro, for example Hogwarts Legacy and Dragon's Dogma 2) run better with a smaller one plus `ttm.pages_limit`.

### Edit vram.txt {#edit-vramtxt}

`vram.txt` sits next to `cmdline.txt` on the boot partition and holds one hexadecimal value. On the PS5, in a terminal (on PS5 Bazzite Deck: Desktop Mode → **Konsole**):

```bash
E=$(for d in /efi /boot/efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo cat $E/vram.txt                         # show
echo 180000000 | sudo tee $E/vram.txt        # 6 GB
```

The new value is used from the next start with the loader: power off, then start Linux with the loader as usual. From a PC, edit it like `cmdline.txt`, see [From a PC](#edit-from-a-pc).
