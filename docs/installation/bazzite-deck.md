---
title: PS5 Bazzite Deck
sidebar_position: 2
description: Install PS5 Bazzite Deck, a Bazzite image that boots the PS5 straight into Steam Gaming Mode.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# PS5 Bazzite Deck

[PS5 Bazzite Deck](https://github.com/VivaLaVent/ps5-bazzite-deck) turns the PS5 into a Steam console. It is [Bazzite](https://bazzite.gg) in Steam Deck mode, adapted for the PS5: it boots straight into **Steam Gaming Mode** (the Steam Deck interface), and a full KDE desktop is one click away.

It runs from a USB drive (or the M.2 slot) and is started by the Linux loader, like any other image. The PS5 itself is not modified: when you restart or power off, the PS5 starts its own system again, even with the drive still plugged in.

- **Download:** [releases](https://github.com/VivaLaVent/ps5-bazzite-deck/releases)
- **Help and testing:** [Discord](https://discord.gg/ps5linux), channel `#bazzite-problems`
- **Support the project:** [Ko-fi](https://ko-fi.com/vivalavent)

:::tip[Which version?]
Use the release marked **Latest**. Releases marked **Pre-release** are test builds, even when their version number is higher. A full release updates an installed console from any earlier version in one step with the command in its notes; only the very first releases, which had no update script, need a reflash.
:::

## What works on your console

One image runs on every supported PS5. What you get depends on three parts of the console; `ps5-report` shows all three. See [Hardware overview](/hardware/matrix#console-models-and-chips) for how to check them by hand.

**By HDMI chip:**

| Feature | FLAVA3 (most consoles) | VERDE (some later models) | Notes |
| --- | :---: | :---: | --- |
| 1440p at 120 Hz | ✅ | ❌ | |
| 4K at 120 Hz | ✅ | ❌ | Needs an HDMI 2.1 TV and cable. Only offered when the TV can take it, and falls back to 4K60 by itself if the link fails. |
| HDR (1080p60, 4K60) | ✅ | ❌ | Game Mode → Settings → Display |
| VRR (displays with HDMI VRR) | ✅ | ❌ | At every resolution: Game Mode → Settings → Display → Enable VRR. Like on the PS5 OS, not on monitors that only have FreeSync. |

Both chips support 1080p60, 1080p120, 1440p60 and 4K60, when the display can do them. Other resolutions and refresh rates (ultrawide, 165 Hz and so on) are not offered: the HDMI chip only has setups for these.

**By Wi-Fi/Bluetooth chip:**

| Feature | IW620 | MediaTek (Slim) | MediaTek (Pro) | Notes |
| --- | :---: | :---: | :---: | --- |
| One DualSense for the PS5 and Linux | ✅ | ✅ | ✅ | On by default, see [DualSense](/using-linux/dualsense#one-dualsense-for-the-ps5-and-linux). |
| Wi-Fi after restarting straight into Linux (`ps5-warm-reboot on`) | ⚠️ | ✅ | ✅ | IW620: repaired automatically. If Wi-Fi is still missing, power off and run the loader. |
| Bluetooth finds new devices | ✅ | ✅ | ✅ | IW620: broken in some earlier releases (a paired DualSense kept working). Update if the settings find nothing. |

**PS5 Pro:** the GPU runs with its 60 compute units and the Pro's own firmware, Wi-Fi and Bluetooth work from a cold boot, and overlays show the GPU load. The GPU firmware has to be dumped by the Linux loader, which only a loader built from the official repository's `main` branch does; see [PS5 Pro](/hardware/ps5-pro#gpu-firmware) for which loaders do and what to expect after an update. Not supported on the Pro: the 40 CU unlock. Reports are welcome in `#bazzite-ps5-pro-tests`.

## Prerequisites

- A PS5 on a firmware the [Linux loader](/installation/booting#which-loader) supports.
- An original PS5, a PS5 Slim or a PS5 Pro.
- **etaHEN and kstuff off:** they don't work together with the Linux loader (freezes, especially when going to sleep).
- A USB drive of **32 GB or more**, ideally an external SSD (much faster than a stick).
- A PC to download and flash the image. A USB keyboard is handy for the first setup.
- The [required PS5 settings](/getting-started/prerequisites#required-ps5-settings): USB power in rest mode set to **Always**, and HDMI Device Link **off** (otherwise you'll usually get a black screen).

## Install

1. **Download** all `ps5-bazzite-deck-vX.Y.Z.img.7z.00*` files from the latest [release](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) into one folder.
2. **Extract** the `.001` file with [7-Zip](https://7-zip.org) (Windows), Keka (macOS) or `7z x` (Linux). You get `ps5-bazzite-deck.img`.
3. **Flash** it to the USB drive with [Rufus](https://rufus.ie): select the drive, select the `.img` file and click **Start**. This erases the drive.
4. **Plug** the drive into a fast port, see [USB ports](/hardware/storage#usb-ports). Use the slow USB 2.0 port for a controller or keyboard.
5. **Jailbreak and send the loader** as described in [Booting Linux](/installation/booting). Wait until the orange light stops blinking, then press the power button. A **white light** means Linux is booting.
6. **Be patient on the first boot.** The screen can stay black for a few minutes.

Already installed? Each release's notes explain how to update.

## First boot

- The default password is **`ps5`**. You need it for anything that requires admin rights. SSH is on: `ssh ps5@<your PS5's IP>`.

  :::warning
  **Change the password** with `passwd`: anyone on your network can try `ps5`.
  :::

- **After you join Wi-Fi, Steam updates itself** in the background, often behind a blank screen with a blinking cursor that looks frozen, for several minutes. Don't power off during this: it is the most common cause of a broken first start. The console can also restart once by itself after the network setup; cold boot and run the loader again.
- The first start is at **1080p60**. Choose your resolution under Game Mode → Settings → Display; it is remembered.
- Set **RGB range** to **Full**, both in Game Mode and on the desktop.

## Built-in commands

| Command | What it does |
| --- | --- |
| `ps5-report` | Collects your hardware details and the relevant logs into one file for a bug report. It only reads. |
| `ps5-perf` | CPU boost and the fan target (the console's firmware control, 80 °C by default). `ps5-perf status` shows the fan mode and speed, see [Fan control](/hardware/fan). |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Experimental, `on`/`off`. |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default. `status`, `on`, `off`. |

Sleep (suspend-to-idle) is built in: a short press of the power button or Steam's **Sleep** puts the console to sleep and wakes it again. The GPU stays powered, so the saving is modest; it is not the PS5 OS's rest mode, and a DualSense can't wake the console.

## Boot options (cmdline.txt)

`cmdline.txt` is on the USB drive's small FAT32 partition and must stay **one single line**. To add an option, add it at the end with a space in front of it; delete it again to undo. Leave the existing entries as they are.

| Option | What it does | When to use it |
| --- | --- | --- |
| `amdgpu.force_1080p=1` | Only allows 1080p60 | A black or garbled picture you can't get past, for example after choosing a resolution your display can't show. Remove it once you've set a working resolution, see [Display recovery](/hardware/hdmi#display-recovery). |
| `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`) | USB-C SSDs or enclosures that disconnect, freeze or show I/O errors (many have buggy UAS) |
| `usbc_dp.enable=1` | Turns on DisplayPort output on the front USB-C port | USB-C displays and the PS VR2. Not when your boot drive is in the front USB-C port. |
| `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz | A TV where 4K120 misbehaves |

To turn off VRR, use Steam's setting (Settings → Display). To stop the TV from turning on with the console, turn off HDMI-CEC in the TV's settings (SIMPLINK, Anynet+, BRAVIA Sync…).

The commands on this wiki that edit `cmdline.txt` find it by themselves: on Bazzite the boot partition is mounted at `/efi`, on most other images at `/boot/efi`.

## 40 GPU compute units

The image supports the [40 CU unlock](/hardware/gpu#40-cu-unlock) on the original PS5 and the Slim. The setting is kept across updates. Don't use it on a PS5 Pro.

## Install to the internal M.2

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

## Optional Decky plugins

These are community-made and not part of the image. They need [Decky Loader](https://decky.xyz): install it from Desktop Mode with the installer on its website. Decky plugins appear in Game Mode's quick access menu (the `...` button).

| Plugin | What it does |
| --- | --- |
| [PS5 hardware control](https://github.com/NotHavocc/ps5-hwcon-plugin) | Fan target or curve, live temperatures, CPU and GPU governors and clocks, LED presets. It sets the same things as `ps5-perf`: whichever was set last applies. Use a current image release: one pre-release had the fan modes swapped, and in some releases the fan target fell back to 50 °C after sleep (both fixed). There is also a desktop version, [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui). |

## Troubleshooting

Ask in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) and attach the report from `ps5-report`. Without a network connection, copy the report to the USB drive's FAT32 partition and take it from there on your PC:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp ~/ps5-report-*.txt $E/
```

- **The console runs but there's no picture** (wrong mode, or a mode the TV doesn't accept): see [Display recovery](/hardware/hdmi#display-recovery).
- **White light but black screen:** check that HDMI Device Link is off, try another HDMI port or TV, toggle HDCP in the PS5 settings. As a last resort, add `amdgpu.force_1080p=1` to `cmdline.txt`.
- **Black screen, but the PS5 is running:** press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2–3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH: `sudo chvt 2; sleep 3; sudo chvt 1`.
- **It boots back into the PS5 menu:** you pressed the power button before the orange light stopped blinking, USB power in rest mode isn't set to **Always**, or the console's rest mode was blocked, see [Known issues](/troubleshooting/known-issues#rest-mode-error-back-to-the-ps5-login-screen).
- **Artefacts, green dots or crashes:** turn the [40 CU unlock](/hardware/gpu#40-cu-unlock) off again. For glitches in a single game, use the launch option `RADV_DEBUG=nohiz %command%`.
- **VRR:** no "Enable VRR" option means a VERDE console, a display without HDMI VRR (FreeSync-only monitors), VRR turned off for that input on the TV, or an old image release with a TV that announces no VRR maximum (update). If the screen goes dark for 2 seconds in menus, use VRR per game instead (quick access menu → Performance). OLED flicker on the desktop: set Adaptive Sync to **Automatic**, not Always.
- **Bluetooth settings find no new devices** (IW620 consoles): a bug in some earlier releases; a DualSense that was already paired kept working. Update to the current release. If a controller is refused in a loop instead, see [Bluetooth](/hardware/wifi-bluetooth#controller-refused-in-a-loop).
- **HEVC video with broken colours or a red screen** (recording, streaming with Sunshine or Moonlight): the PS5's video engine gets HEVC P-frames wrong. Use **H.264**, or encode HEVC with I-frames only (see [VCN](/hardware/gpu#using-it-with-ffmpeg)). As a Moonlight client: use H.264, or "Force software decoding" for HEVC.
- **Won't boot from an SSD in a USB enclosure:** some enclosures don't work with the loader. Try another one.
- **PS5 Pro reports 36 compute units:** the Pro's GPU firmware isn't in use yet. After every update, start Linux twice: the first start adds the firmware to the initrd, the second runs on it. If it stays at 36, the loader didn't dump the firmware, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

## How it works

Bazzite's Game Mode never worked on the PS5 before, and it wasn't the display or Gamescope. Bazzite starts Steam through the `cardwired` service, which loads an eBPF program and needs two kernel features that the PS5 kernel configs don't enable: the **BPF LSM** (`bpf` must be in `CONFIG_LSM`) and **kernel BTF** (`CONFIG_DEBUG_INFO_BTF`). Without them, `cardwired` crash-loops and Bazzite drops you to the desktop after five attempts. See [Kernel setup](/advanced/kernel#build-a-kernel-for-bazzite-game-mode) for details.

The image is built on the [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder with a recent stable kernel, rmuxnet's PS5 patch set and its own HDMI, Wi-Fi and Bluetooth fixes. The config changes, the patch order and what each patch does are on [How the PS5 Bazzite Deck image is built](/advanced/image-build). Each release ships a `VERSIONS.md` with the exact versions used. To build it yourself (Linux or WSL with Docker and about 60 GB free; it takes a couple of hours):

```bash
git clone https://github.com/VivaLaVent/ps5-bazzite-deck && cd ps5-bazzite-deck
bash build.sh
```

The output folder is printed at the end of the build.
